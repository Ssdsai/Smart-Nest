import os
import json
import uuid
from datetime import datetime
from flask import Flask, jsonify
from pymongo import MongoClient
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import random
import re

# Set up Flask app
app = Flask(__name__)

# Set OpenAI API Key
os.environ["OPENAI_API_KEY"] = "Your-API-Key"
    
# MongoDB Configuration
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "your db name"
COLLECTION_NAME = "reviews"

# OpenAI Model Configuration
MODEL_NAME = "gpt-4o-mini"

# Product Categories
CATEGORIES = {
    "Smart Doorbells": ["Ring", "Nest", "Arlo", "Eufy"],
    "Smart Doorlocks": ["August", "Yale", "Schlage", "Kwikset"],
    "Smart Speakers": ["Amazon Echo", "Google Nest", "Sonos", "Bose"],
    "Smart Lights": ["Philips Hue", "LIFX", "Sengled", "Wyze"],
    "Smart Thermostats": ["Nest", "Ecobee", "Honeywell", "Emerson"]
}

# Prompt Templates
REVIEW_PROMPT_TEMPLATE = """
You are a helpful assistant tasked with generating realistic product reviews for a SmartHome product catalog. 
Each review should be tailored to the user's profile, product details, and reflect either positive or negative sentiments 
based on the provided keywords. Generate 5 diverse reviews for the given product.

Review Fields:
- User ID
- User Age
- User Gender
- User Occupation
- Review Rating (1 to 5 stars)
- Review Text (use positive or negative keywords)
- Review Date
- Product Model Name
- Product Category
- Product Price
- Product On Sale (yes/no)
- Product Rebate (yes/no)
- Manufacturer Name
- Store ID
- City
- State
- Zip
- Store Name

Product Name: {product_name}
Product Category: {product_category}
Product Price: ${price}
Manufacturer Name: {manufacturer_name}
Store Info: {store_name}, {city}, {state}, {zip}
Keywords for Positive Reviews: {positive_keywords}
Keywords for Negative Reviews: {negative_keywords}

Output the reviews as a JSON array with the fields above.
"""

def clean_gpt_response(response):
    """
    Cleans the GPT response by removing backticks, extraneous text, and ensuring valid JSON.
    """
    if response.startswith("```json"):
        response = response[len("```json"):].strip()
    if response.endswith("```"):
        response = response[:-3].strip()

    json_match = re.search(r"\[.*\]|\{.*\}", response, re.DOTALL)
    if json_match:
        return json_match.group(0)

    return response


def generate_products():
    """
    Dynamically generate 10 products (2 per category).
    """
    products = []
    for category, brands in CATEGORIES.items():
        for i in range(2):  # 2 products per category
            brand = random.choice(brands)
            product_name = f"{brand} {category[:-1]} {random.randint(100, 999)}"
            price = round(random.uniform(50, 300), 2)
            product = {
                "product_name": product_name,
                "product_category": category,
                "price": price,
                "manufacturer_name": brand,
                "store_name": "Tech Store",
                "city": "New York",
                "state": "NY",
                "zip": "10001",
                "positive_keywords": ["high quality", "reliable", "easy to use", "advanced features", "great design"],
                "negative_keywords": ["expensive", "short battery life", "difficult setup", "poor performance", "connectivity issues"]
            }
            products.append(product)
    return products


def generate_reviews(products):
    """
    Generate reviews for the given products and store them in MongoDB.
    """
    chat_model = ChatOpenAI(model=MODEL_NAME, temperature=0.8)
    prompt = PromptTemplate(
        input_variables=[
            "product_name", "product_category", "price", 
            "manufacturer_name", "store_name", "city", "state", "zip", 
            "positive_keywords", "negative_keywords"
        ],
        template=REVIEW_PROMPT_TEMPLATE
    )
    chain = LLMChain(llm=chat_model, prompt=prompt)

    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    reviews_collection = db[COLLECTION_NAME]

    all_reviews = []
    for product in products:
        try:
            # Generate reviews using ChatGPT
            response = chain.run(product)
            cleaned_response = clean_gpt_response(response)

            reviews = json.loads(cleaned_response)
            for review in reviews:
                # Add unique ID and additional fields
                review["_id"] = str(uuid.uuid4())
                review["reviewDate"] = datetime.now().strftime("%Y-%m-%d")
                review["storeid"] = f"store_{random.randint(1, 5)}"

                # Save to MongoDB
                reviews_collection.insert_one(review)
                all_reviews.append(review)

        except (json.JSONDecodeError, Exception) as e:
            print(f"Error processing product {product['product_name']}: {e}")
            continue

    # Save all reviews to a JSON file
    with open("reviews_records.json", "w") as file:
        json.dump(all_reviews, file, indent=4)

    return all_reviews


@app.route('/generate-reviews', methods=['GET'])
def generate_and_store_reviews():
    """
    Flask route to generate products, reviews, and store them in MongoDB and a JSON file.
    """
    try:
        # Step 1: Generate products
        products = generate_products()

        # Step 2: Generate reviews for the products
        reviews = generate_reviews(products)

        return jsonify({"message": "Products and reviews generated, stored in MongoDB, and saved to reviews_records.json successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
