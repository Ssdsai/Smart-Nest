import os
import json
import uuid
import mysql.connector
from flask import Flask, jsonify
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import re
import random

# Set up Flask app
app = Flask(__name__)

# Set OpenAI API Key (store securely in an environment variable)
os.environ["OPENAI_API_KEY"] = "Your-API-Key"

# MySQL Database Configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "your db name"
}

# OpenAI Model Configuration
MODEL_NAME = "gpt-4o-mini"

# Prompt Template for GPT
PROMPT_TEMPLATE = """
You are a helpful assistant tasked with generating concise product records for an e-commerce site. 
The whole record data must be less than 100 words.
The Product Name and description should align with the Category of that product Record.
Each product must be unique within its category.

Categories: Smart Doorbells, Smart Doorlocks, Smart Speakers, Smart Lights, and Smart Thermostats.

Product Name: {product_name}
Product Price: ${price}
Category: {category}
Original Description: {original_description}

Generate a concise product record in the following JSON format:
{{
  "Product Name": "<simplified_product_name>",
  "Product Price": "<simplified_price>",
  "Category": "<category>",
  "Description": "<simplified_description>"
}}
"""

def clean_gpt_response(response):
    """
    Cleans the GPT response by removing backticks, extraneous text, and ensuring valid JSON.
    """
    # Remove backticks and markdown-style JSON code blocks
    if response.startswith("```json"):
        response = response[len("```json"):].strip()
    if response.endswith("```"):
        response = response[:-3].strip()

    # Use regex to isolate the JSON object or array if there’s extraneous text
    json_match = re.search(r"{.*}", response, re.DOTALL)  # Matches the first JSON object
    if json_match:
        return json_match.group(0)

    # If no JSON match is found, return the original response for further inspection
    return response


def generate_with_retries(chain, params, retries=3):
    """
    Retry logic for generating product records.
    """
    for attempt in range(retries):
        try:
            return chain.run(params)
        except Exception as e:
            print(f"Retry {attempt + 1} for {params['product_name']}: {e}")
    return None


def generate_new_products():
    """
    Generate exactly 50 new products (10 per category) with unique names and descriptions.
    """
    categories = {
        "Smart Doorbells": ["Ring", "Nest", "Arlo", "Eufy", "Goldroger","Wipro","Zebronics","Google","Himster","Anchor"],
        "Smart Doorlocks": ["August", "Yale", "Schlage", "Kwikset","Teeho","TT","Urban Company","Baldwin"],
        "Smart Speakers": ["Amazon Echo", "Google Nest", "Sonos", "Bose","Marshall","Xiaomi","Sony","JBL"],
        "Smart Lights": ["Philips Hue", "LIFX", "Sengled", "Wyze","Amazon","Samartway","Fiet","Tp-Link","Goove","Segled"],
        "Smart Thermostats": ["Nest", "Ecobee", "Honeywell", "Emerson","Google","Sensibo","Godrej"]
    }
    product_records = []
    seen_names = set()  # Track unique product names

    chat_model = ChatOpenAI(model=MODEL_NAME, temperature=0.8)
    prompt = PromptTemplate(input_variables=["product_name", "price", "category", "original_description"], template=PROMPT_TEMPLATE)
    chain = LLMChain(llm=chat_model, prompt=prompt)

    for category, brands in categories.items():
        for i in range(12):
            # Randomly select a brand and create a unique product name
            while True:
                brand = random.choice(brands)
                product_name = f"{brand} {category[:-1]} {random.randint(100, 999)}"
                if product_name not in seen_names:  # Ensure uniqueness
                    seen_names.add(product_name)
                    break

            price = round(random.uniform(50, 300), 2)
            original_description = f"A high-quality {category.lower()} with features like {random.choice(['advanced security', 'energy efficiency', 'seamless integration', 'smart alerts', 'voice control'])}."

            result = generate_with_retries(chain, {
                "product_name": product_name,
                "price": price,
                "category": category,
                "original_description": original_description
            })

            if result is None:
                print(f"Failed to generate product record for {product_name}. Skipping...")
                continue

            print(f"Raw response for {product_name}: {result}")

            try:
                # Remove backticks and parse JSON
                cleaned_result = clean_gpt_response(result)
                product_record = json.loads(cleaned_result)
                product_records.append(product_record)

            except json.JSONDecodeError as e:
                print(f"Error decoding JSON for {product_name}: {cleaned_result}")
                continue

    return product_records


def save_to_json_file(data, filename="products_records.json"):
    """
    Save product records to a JSON file.
    """
    with open(filename, "w") as file:
        json.dump(data, file, indent=4)


def insert_records_to_mysql(records):
    """
    Insert product records into MySQL.
    """
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor()

    for record in records:
        try:
            sql = """
            INSERT INTO Products (product_id, product_name, category, price, discount, product_sales, onsale, rebate, description) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values = (
                str(uuid.uuid4()),  # Generate unique product_id
                record["Product Name"],  # Product name from GPT output
                record["Category"],  # Category from GPT output
                float(record["Product Price"].replace("$", "")),  # Convert price to a float
                0,  # Default value for discount
                0,  # Default value for product_sales
                "No",  # Default value for onsale
                "No",  # Default value for rebate
                record["Description"],  # Description from GPT output
            )
            cursor.execute(sql, values)
        except mysql.connector.Error as e:
            print(f"Error inserting record: {record}. Error: {e}")
            continue

    connection.commit()
    cursor.close()
    connection.close()


@app.route('/generate-product-records', methods=['GET'])
def generate_and_save_records():
    """
    Flask route to generate, save, and insert product records.
    """
    try:
        # Generate exactly 50 new products
        product_records = generate_new_products()

        # Save records to a JSON file
        save_to_json_file(product_records)

        # Insert records into MySQL
        insert_records_to_mysql(product_records)

        return jsonify({"message": "50 new product records generated, saved to JSON file, and inserted into the database successfully."})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
