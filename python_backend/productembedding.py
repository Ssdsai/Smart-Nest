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
ELASTICSEARCH_INDEX = "product_embeddings"

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

# Load product records from JSON file
def load_product_records_from_json(filename="products_records.json"):
    with open(filename, "r") as f:
        products = json.load(f)
    return products


def generate_embeddings(products):
    total_products = len(products)
    logger.info(f"Starting the embedding generation process for {total_products} products.")
    embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)
    product_embeddings = {}

    for product in products:
        # Extract product details
        product_name = product["Product Name"]
        product_price = product["Product Price"].replace("$", "")
        category = product["Category"]
        description = product["Description"]

        # Combine product details into a descriptive text
        product_text = f"Name: {product_name}, Category: {category}, Price: ${product_price}, Description: {description}"
        logger.info(f"Generating embedding for product: {product_name}")

        # Generate embedding
        embedding = embeddings.embed_query(product_text)
        logger.info(f"Embedding generated for product: {product_name}")

        # Store embedding and other data
        product_embeddings[product_name] = {
            "embedding": embedding,
            "category": category,
            "price": float(product_price),
            "description": description,
        }

    logger.info(f"Completed the embedding generation process for {total_products} products.")
    return product_embeddings



def save_embeddings_to_elasticsearch(embeddings, index_name=ELASTICSEARCH_INDEX):
    total_saved = 0
    logger.info("Starting the process of saving embeddings to Elasticsearch.")

    for product_name, data in embeddings.items():
        try:
            es.index(index=index_name, id=product_name, document=data)
            logger.info(f"Saved embedding for product: {product_name} to Elasticsearch.")
            total_saved += 1
        except Exception as e:
            logger.error(f"Failed to save embedding for product: {product_name}. Error: {e}")

    logger.info(f"Completed saving {total_saved} embeddings to Elasticsearch.")
# Flask route to process and save embeddings
@app.route('/generate-embeddings', methods=['GET'])
def generate_and_store_embeddings():
    try:
        # Load product data from JSON file
        products = load_product_records_from_json()

        # Generate embeddings
        product_embeddings = generate_embeddings(products)

        # Save embeddings to Elasticsearch
        save_embeddings_to_elasticsearch(product_embeddings)

        return jsonify({"message": "Embeddings generated and saved to Elasticsearch successfully."})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Flask route to verify Elasticsearch data
@app.route('/search-embeddings', methods=['GET'])
def search_embeddings():
    try:
        # Fetch all data from the index
        response = es.search(index=ELASTICSEARCH_INDEX, body={"query": {"match_all": {}}})
        return jsonify(response["hits"]["hits"])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Run Flask app
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
