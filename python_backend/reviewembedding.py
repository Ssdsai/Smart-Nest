import os
import json
from flask import Flask, jsonify
from langchain_openai.embeddings import OpenAIEmbeddings
from elasticsearch import Elasticsearch
import logging

# Set up Flask app
app = Flask(__name__)

# OpenAI API Key (set this in your environment securely)
os.environ["OPENAI_API_KEY"] = "Your-API-Key"

# Embedding Model Configuration
EMBEDDING_MODEL = "text-embedding-3-small"

# Elasticsearch Configuration
ELASTICSEARCH_HOST = "https://localhost:9200"
ELASTICSEARCH_USER = "elastic"  # Replace with your Elasticsearch username
ELASTICSEARCH_PASS = "elastic-password"  # Replace with your Elasticsearch password
ELASTICSEARCH_INDEX = "review_embeddings"

# Connect to Elasticsearch using basic authentication and disable SSL certificate verification
es = Elasticsearch(
    ELASTICSEARCH_HOST,
    basic_auth=(ELASTICSEARCH_USER, ELASTICSEARCH_PASS),  # Use basic_auth instead of http_auth
    verify_certs=False  # Disable SSL certificate verification for now (for development only)
)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


# Check if Elasticsearch is connected
def check_es_connection():
    try:
        if es.ping():
            print("Successfully connected to Elasticsearch!")
        else:
            print("Failed to connect to Elasticsearch.")
    except Exception as e:
        print(f"Error connecting to Elasticsearch: {e}")

# Call the check function
check_es_connection()

# Load review records from JSON file
def load_review_records_from_json(filename="reviews_records.json"):
    with open(filename, "r") as f:
        reviews = json.load(f)
    return reviews


def generate_review_embeddings(reviews):
    total_reviews = len(reviews)
    logger.info(f"Starting the embedding generation process for {total_reviews} reviews.")
    embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)
    review_embeddings = {}

    for review in reviews:
        try:
            # Extract review details
            user_id = review["User ID"]
            review_text = review["Review Text"]
            product_model_name = review["Product Model Name"]
            product_category = review["Product Category"]

            # Handle price as float or string
            product_price = review["Product Price"]
            if isinstance(product_price, str):
                product_price = float(product_price.replace("$", ""))

            store_name = review["Store Name"]

            # Combine review details into a descriptive text
            review_text_combined = (
                f"Review by User {user_id}: {review_text}. "
                f"Product: {product_model_name} ({product_category}) priced at ${product_price}, "
                f"available at {store_name}."
            )
            logger.info(f"Generating embedding for review by User {user_id}")

            # Generate embedding
            embedding = embeddings.embed_query(review_text_combined)
            logger.info(f"Embedding generated for review by User {user_id}")

            # Store embedding and other data
            review_embeddings[review["_id"]] = {
                "embedding": embedding,
                "user_id": user_id,
                "review_text": review_text,
                "product_model_name": product_model_name,
                "product_category": product_category,
                "product_price": product_price,
                "store_name": store_name,
            }

        except Exception as e:
            logger.error(f"Error processing review by User {user_id}: {e}")
            continue

    logger.info(f"Completed the embedding generation process for {total_reviews} reviews.")
    return review_embeddings


def save_review_embeddings_to_elasticsearch(embeddings, index_name=ELASTICSEARCH_INDEX):
    total_saved = 0
    logger.info("Starting the process of saving review embeddings to Elasticsearch.")

    for review_id, data in embeddings.items():
        try:
            es.index(index=index_name, id=review_id, document=data)
            logger.info(f"Saved embedding for review ID: {review_id} to Elasticsearch.")
            total_saved += 1
        except Exception as e:
            logger.error(f"Failed to save embedding for review ID: {review_id}. Error: {e}")

    logger.info(f"Completed saving {total_saved} review embeddings to Elasticsearch.")


# Flask route to process and save embeddings
@app.route('/generate-review-embeddings', methods=['GET'])
def generate_and_store_review_embeddings():
    try:
        # Load review data from JSON file
        reviews = load_review_records_from_json()

        # Generate embeddings
        review_embeddings = generate_review_embeddings(reviews)

        # Save embeddings to Elasticsearch
        save_review_embeddings_to_elasticsearch(review_embeddings)

        return jsonify({"message": "Review embeddings generated and saved to Elasticsearch successfully."})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Flask route to verify Elasticsearch data
@app.route('/search-review-embeddings', methods=['GET'])
def search_review_embeddings():
    try:
        # Fetch all data from the index
        response = es.search(index=ELASTICSEARCH_INDEX, body={"query": {"match_all": {}}})
        return jsonify(response["hits"]["hits"])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Run Flask app
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
