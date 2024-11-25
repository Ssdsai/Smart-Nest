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
ELASTICSEARCH_PASS = os.getenv("ELASTICSEARCH_PASS", "ealstic-password")  # Replace with your actual password
PRODUCT_EMBEDDING_INDEX = "product_embeddings"
QUERY_EMBEDDING_INDEX = "query_embeddings"  # Index for storing query embeddings

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

# Flask route to save query embeddings to Elasticsearch
@app.route('/saveQueryEmbedding', methods=['POST'])
def save_query_embedding():
    try:
        # Get the user's query
        data = request.get_json()
        query = data.get("query", "").strip()

        if not query:
            return jsonify({"error": "Query cannot be empty"}), 400

        # Log when the query is received
        logger.info(f"Received query for embedding: {query}")

        # Generate embedding for the query
        query_embedding = embeddings.embed_query(query)

        # Create a unique ID for this query
        query_id = str(uuid.uuid4())

        # Prepare the document to be indexed in Elasticsearch
        document = {
            "query": query,
            "embedding": query_embedding,
            "timestamp": {"now": "true"}  # Add a timestamp to the query
        }

        # Index the query embedding in Elasticsearch under the query_embeddings index
        es.index(
            index=QUERY_EMBEDDING_INDEX,
            id=query_id,
            document=document
        )

        logger.info(f"Successfully indexed query embedding with ID: {query_id}")

        return jsonify({"message": "Query embedding saved successfully", "query_id": query_id}), 200

    except Exception as e:
        logger.error(f"Error in saving query embedding: {str(e)}")
        return jsonify({"error": f"Failed to save query embedding. Error: {str(e)}"}), 500


# Flask route to recommend products based on query
@app.route('/recommendProducts', methods=['POST'])
def recommend_product():
    try:
        # Get the product query from the request
        data = request.get_json()
        query = data.get("query", "").strip()

        if not query:
            return jsonify({"error": "Query cannot be empty"}), 400

        # Log the received query
        logger.info(f"Received product query for recommendation: {query}")

        # Generate embedding for the product query
        query_embedding = embeddings.embed_query(query)

        # Debugging: Print the query embedding type and shape
        logger.info(f"Query embedding type: {type(query_embedding)}")
        logger.info(f"Query embedding: {query_embedding}")

        # Check if query_embedding is a numpy array and convert to list if needed
        if isinstance(query_embedding, np.ndarray):
            query_embedding = query_embedding.tolist()

        # Check the type after conversion
        logger.info(f"Converted query embedding to list: {query_embedding}")
        
        # Create the KNN search query inside the body
        search_body = {
            "knn": {
                "field": "embedding",  # Ensure the field corresponds to where embeddings are stored in your index
                "query_vector": query_embedding,  # Correctly use 'query_vector' as the parameter name
                "k": 5,  # Get top 5 product recommendations
                "num_candidates": 100  # Number of candidate vectors to compare
            }
        }

        # Print the search body (KNN query) to check the content
        logger.info(f"Embedding found: ")

        # Search for similar products in the Elasticsearch product embedding index
        response = es.search(index=PRODUCT_EMBEDDING_INDEX, body=search_body)

        # Parse the results
        product_recommendations = [
            hit["_source"] for hit in response['hits']['hits']
        ]

        logger.info(f"Found {len(product_recommendations)} product recommendations")

        return jsonify({"recommendations": product_recommendations}), 200

    except Exception as e:
        logger.error(f"Error in recommending products: {str(e)}")
        return jsonify({"error": f"Failed to recommend products. Error: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
