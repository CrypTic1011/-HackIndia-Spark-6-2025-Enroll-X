// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ArticleLeaderboard {
    struct Article {
        string title;
        string ipfsHash;
        address author;
        uint256 likes;
        uint256 dislikes;
        mapping(address => bool) hasVoted;
    }

    struct RankedArticle {
        string title;
        bytes32 titleHash;
        uint256 ratio; // Scaled by 100 (i.e., 7567 => 75.67%)
    }

    mapping(bytes32 => Article) private articles;
    bytes32[] private articleList;

    mapping(bytes32 => bool) private articleExists;

    event ArticleSubmitted(string title, bytes32 titleHash, address author);
    event Voted(bytes32 titleHash, address voter, bool liked);

    function submitArticle(string memory _title, string memory _ipfsHash) public {
        bytes32 titleHash = keccak256(abi.encodePacked(_title));
        require(!articleExists[titleHash], "Article already exists");

        Article storage newArticle = articles[titleHash];
        newArticle.title = _title;
        newArticle.ipfsHash = _ipfsHash;
        newArticle.author = msg.sender;

        articleExists[titleHash] = true;
        articleList.push(titleHash);

        emit ArticleSubmitted(_title, titleHash, msg.sender);
    }

    function voteArticle(string memory _title, bool liked) public {
    bytes32 titleHash = keccak256(abi.encodePacked(_title));
    require(articleExists[titleHash], "Article does not exist");

    Article storage article = articles[titleHash];
    require(!article.hasVoted[msg.sender], "Already voted");

    article.hasVoted[msg.sender] = true;

    if (liked) {
        article.likes += 1;
    } else {
        article.dislikes += 1;
    }

    emit Voted(titleHash, msg.sender, liked);

    uint256 totalVotes = article.likes + article.dislikes;
    if (totalVotes > 0 && (article.dislikes * 100) / totalVotes >= 51) {
        delete articles[titleHash];
        articleExists[titleHash] = false;

        // Remove from articleList (optional: expensive on-chain)
        for (uint i = 0; i < articleList.length; i++) {
            if (articleList[i] == titleHash) {
                articleList[i] = articleList[articleList.length - 1];
                articleList.pop();
                break;
            }
        }
    }
}


    function getLeaderboard() public view returns (RankedArticle[] memory) {
        uint256 total = articleList.length;
        RankedArticle[] memory board = new RankedArticle[](total);

        for (uint256 i = 0; i < total; i++) {
            bytes32 titleHash = articleList[i];
            Article storage art = articles[titleHash];
            uint256 totalVotes = art.likes + art.dislikes;

            uint256 ratio = 0;
            if (totalVotes > 0) {
                ratio = (art.likes * 10000) / totalVotes; // Scaled to 2 decimal places
            }

            board[i] = RankedArticle({
                title: art.title,
                titleHash: titleHash,
                ratio: ratio
            });
        }

        // Simple bubble sort (not gas-efficient for large data)
        for (uint256 i = 0; i < total; i++) {
            for (uint256 j = i + 1; j < total; j++) {
                if (board[j].ratio > board[i].ratio) {
                    RankedArticle memory temp = board[i];
                    board[i] = board[j];
                    board[j] = temp;
                }
            }
        }

        return board;
    }

    function getArticleDetails(string memory _title) public view returns (
    string memory ipfsHash,
    address author,
    uint256 likes,
    uint256 dislikes,
    uint256 ratio // Add the ratio here
) {
    bytes32 titleHash = keccak256(abi.encodePacked(_title));
    require(articleExists[titleHash], "Article does not exist");

    Article storage art = articles[titleHash];
    
    uint256 totalVotes = art.likes + art.dislikes;
    if (totalVotes > 0) {
        ratio = (art.likes * 10000) / totalVotes; // Scaled to 2 decimal places
    }

    return (art.ipfsHash, art.author, art.likes, art.dislikes, ratio);
}


    function hasUserVoted(string memory _title, address user) public view returns (bool) {
        bytes32 titleHash = keccak256(abi.encodePacked(_title));
        require(articleExists[titleHash], "Article does not exist");
        return articles[titleHash].hasVoted[user];
    }
}
