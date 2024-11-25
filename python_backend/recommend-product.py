import os
import json
from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS
import logging

# Set up Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MySQL Database Configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "root",  # Replace with your MySQL password
    "database": "your db name"  # Replace with your database name
}

# Define valid categories
VALID_CATEGORIES = ["doorbells", "thermostats", "doorlocks", "speakers", "lights"]

# Fetch products based on the user's query
def fetch_products_by_category(category):
    try:
        # Connect to the MySQL database
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)

        # SQL query to fetch products for a specific category
        sql = """
            SELECT product_name, category, CAST(price AS DECIMAL(10,2)) AS price, description 
            FROM Products 
            WHERE category = %s
            LIMIT 10
        """
        cursor.execute(sql, (category.capitalize(),))  # Capitalize to match category naming in DB

        # Fetch results and close the connection
        products = cursor.fetchall()
        cursor.close()
        connection.close()

        return products

    except mysql.connector.Error as err:
        logger.error(f"Database error: {err}")
        return []

# Flask route to handle product recommendations
@app.route('/recommendProduct', methods=['POST'])
def recommend_product():
    try:
        # Get the query from the frontend
        data = request.get_json()
        query = data.get("query", "").strip().lower()

        if not query:
            return jsonify({"message": "Query cannot be empty."}), 400

        logger.info(f"Received query: {query}")

        # Check if the query contains any valid category
        matched_category = next((cat for cat in VALID_CATEGORIES if cat in query), None)

        if not matched_category:
            return jsonify({"message": "No valid category found in the query."}), 404

        # Fetch products from the database based on the matched category
        products = fetch_products_by_category(matched_category)

        if not products:
            return jsonify({"message": f"No products found for the category '{matched_category}'."}), 404

        # Respond with the fetched products
        return jsonify(products), 200

    except Exception as e:
        logger.error(f"Error in recommendProduct route: {e}")
        return jsonify({"message": "An error occurred while processing your request."}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
