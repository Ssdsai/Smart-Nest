import logging
import numpy as np
from flask import Flask, request, jsonify
from langchain_openai import OpenAIEmbeddings  # Updated import
from elasticsearch import Elasticsearch
from flask_cors import CORS
import os
import urllib3
import uuid

# Disable insecure request warnings for local development
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# OpenAI API Key (use environment variable)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "Your-API-Key")
EMBEDDING_MODEL = "text-embedding-3-small"  # Updated model for compatibility

# Elasticsearch configurations
ELASTICSEARCH_HOST = os.getenv("ELASTICSEARCH_HOST", "https://localhost:9200")
ELASTICSEARCH_USER = os.getenv("ELASTICSEARCH_USER", "elastic")
ELASTICSEARCH_PASS = os.getenv("ELASTICSEARCH_PASS", "elastic-password")  # Replace with your actual password
REVIEW_EMBEDDING_INDEX = "review_embeddings"

# Connect to Elasticsearch
es = Elasticsearch(
    ELASTICSEARCH_HOST,
    basic_auth=(ELASTICSEARCH_USER, ELASTICSEARCH_PASS),
    verify_certs=False
)

# Initialize OpenAI embeddings
embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL, openai_api_key=OPENAI_API_KEY)

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask route to recommend reviews based on query
@app.route('/searchReviews', methods=['POST'])
def recommend_reviews():
    try:
        # Get the review query from the request
        data = request.get_json()
        query = data.get("query", "").strip()

        if not query:
            return jsonify({"error": "Query cannot be empty"}), 400

        # Log the received query
        logger.info(f"Received review query for recommendation: {query}")

        # Generate embedding for the review query
        query_embedding = embeddings.embed_query(query)

        # Check if query_embedding is a numpy array and convert to list if needed
        if isinstance(query_embedding, np.ndarray):
            query_embedding = query_embedding.tolist()

        # Debugging: Log the query embedding
        logger.info(f"Query embedding generated: {query_embedding}")

        # Create the KNN search query inside the body
        search_body = {
            "knn": {
                "field": "embedding",  # Ensure the field corresponds to where embeddings are stored in your index
                "query_vector": query_embedding,  # Correctly use 'query_vector' as the parameter name
                "k": 5,  # Get top 5 review recommendations
                "num_candidates": 100  # Number of candidate vectors to compare
            }
        }

        # Perform the search in the Elasticsearch review embedding index
        response = es.search(index=REVIEW_EMBEDDING_INDEX, body=search_body)

        # Parse the results
        review_recommendations = [
            {
                "Review Text": hit["_source"]["Review Text"],
                "Review Rating": hit["_source"]["Review Rating"],
                "Product Model Name": hit["_source"]["Product Model Name"],
                "Product Category": hit["_source"]["Product Category"],
                "Product Price": hit["_source"]["Product Price"],
            }
            for hit in response['hits']['hits']
        ]

        logger.info(f"Found {len(review_recommendations)} review recommendations")

        return jsonify({"recommendations": review_recommendations}), 200

    except Exception as e:
        logger.error(f"Error in recommending reviews: {str(e)}")
        return jsonify({"error": f"Failed to recommend reviews. Error: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
