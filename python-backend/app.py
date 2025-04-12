from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "Flask TF-IDF Keyword Extractor is running!"

def extract_keywords_tfidf(query):
    documents = [query, ""]

    tfidf = TfidfVectorizer(stop_words='english', ngram_range=(1, 1))
    tfidf_matrix = tfidf.fit_transform(documents)

    feature_array = np.array(tfidf.get_feature_names_out())
    tfidf_scores = tfidf_matrix.toarray()[0]

    nonzero_indices = tfidf_scores.nonzero()[0]
    filtered_features = feature_array[nonzero_indices]
    filtered_scores = tfidf_scores[nonzero_indices]

    sorted_indices = np.argsort(filtered_scores)[::-1]
    sorted_keywords = filtered_features[sorted_indices]

    return sorted_keywords.tolist()

@app.route('/extract_keywords', methods=['POST'])
def extract():
    data = request.get_json()

    if not data or 'query' not in data:
        return jsonify({'error': 'Missing "query" parameter in JSON body'}), 400

    query = data['query']
    keywords = extract_keywords_tfidf(query)

    return jsonify({'keywords': keywords})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="127.0.0.1", port=port) 
