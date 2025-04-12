// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ArticleManager {
    struct Article {
        string ipfsHash;
        uint256 timestamp;
        address author;
        uint256 likes;
        uint256 dislikes;
        mapping(address => bool) hasVoted;
    }

    mapping(bytes32 => Article) private articles;
    mapping(bytes32 => bool) private articleExists;
    bytes32[] private articleTitles; // Store all article titles (hashes)

    event ArticleAdded(
        bytes32 indexed titleHash,
        string ipfsHash,
        uint256 timestamp,
        address indexed author
    );

    event ArticleDeleted(
        bytes32 indexed titleHash,
        string reason
    );

    event ArticleVoted(
        bytes32 indexed titleHash,
        address indexed voter,
        bool liked
    );

    function addArticle(string memory _title, string memory _ipfsHash) public {
    bytes32 titleHash = keccak256(abi.encodePacked(_title));
    require(!articleExists[titleHash], "Article already exists");

    Article storage newArticle = articles[titleHash];
    newArticle.ipfsHash = _ipfsHash;
    newArticle.timestamp = block.timestamp;
    newArticle.author = msg.sender;
    newArticle.likes = 1; // Default to 1 like
    newArticle.dislikes = 0; // Default to 0 dislikes
    articleExists[titleHash] = true;
    articleTitles.push(titleHash); // Add title to the list

    emit ArticleAdded(titleHash, _ipfsHash, block.timestamp, msg.sender);
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

        emit ArticleVoted(titleHash, msg.sender, liked);

        // Check for 51% or more dislikes
        uint256 totalVotes = article.likes + article.dislikes;
        if (totalVotes > 0 && (article.dislikes * 100) / totalVotes >= 51) {
            delete articles[titleHash];
            articleExists[titleHash] = false;
            emit ArticleDeleted(titleHash, "Dislikes reached 51% or more");
        }
    }

    function getArticle(string memory _title) public view returns (
        string memory ipfsHash,
        uint256 timestamp,
        address author,
        uint256 likes,
        uint256 dislikes
    ) {
        bytes32 titleHash = keccak256(abi.encodePacked(_title));
        require(articleExists[titleHash], "Article does not exist");

        Article storage article = articles[titleHash];
        return (article.ipfsHash, article.timestamp, article.author, article.likes, article.dislikes);
    }

    function hasUserVoted(string memory _title, address user) public view returns (bool) {
        bytes32 titleHash = keccak256(abi.encodePacked(_title));
        require(articleExists[titleHash], "Article does not exist");
        return articles[titleHash].hasVoted[user];
    }

    // New function to get all article titles (or hashes)
    function getAllArticles() public view returns (bytes32[] memory) {
        return articleTitles;
    }
}
