import os
from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
import logging

# Set up Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "your db name"
COLLECTION_NAME = "reviews"

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
reviews_collection = db[COLLECTION_NAME]

# Flask route to search reviews
@app.route('/searchReview', methods=['POST'])
def search_reviews():
    try:
        # Get the query from the frontend
        data = request.get_json()
        query = data.get("query", "").strip().lower()

        if not query:
            return jsonify({"message": "Query cannot be empty."}), 400

        logger.info(f"Received query: {query}")

        # Find reviews that match the query in the "Review Text"
        matching_reviews = list(reviews_collection.find(
            {"Review Text": {"$regex": query, "$options": "i"}},  # Case-insensitive search
            {
                "_id": 0,  # Exclude MongoDB's internal `_id` field from the results
                "Review Text": 1,
                "Review Rating": 1,
                "Product Model Name": 1,
                "Product Category": 1,
                "Product Price": 1,
            }
        ).limit(5))  # Limit the results to 5 reviews

        if not matching_reviews:
            return jsonify({"message": "No matching reviews found."}), 404

        logger.info(f"Found {len(matching_reviews)} matching reviews.")
        return jsonify(matching_reviews), 200

    except Exception as e:
        logger.error(f"Error in searchReviews route: {e}")
        return jsonify({"message": "An error occurred while processing your request."}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
