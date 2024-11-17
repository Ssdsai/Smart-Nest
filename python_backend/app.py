import os
import uuid
import json
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# Load environment variables
load_dotenv()
app = Flask(__name__)

# Enable CORS for all domains
CORS(app)

# Retrieve OpenAI API key from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OpenAI API key not found. Set it in the .env file.")

# Initialize OpenAI model
llm = ChatOpenAI(model="gpt-4-turbo", temperature=0.7, openai_api_key=OPENAI_API_KEY)

# Define the path for the tickets JSON file
TICKETS_FILE = "tickets.json"

# Ensure the tickets file exists
if not os.path.exists(TICKETS_FILE):
    with open(TICKETS_FILE, 'w') as f:
        json.dump([], f)  # Initialize with an empty list

# Updated prompt template
prompt_template = """
You are a customer service assistant for a delivery service. Analyze images of packages and follow the instructions below to determine the correct action.

Instructions:
1. If you see **clear structural damage** to the package (such as deep dents, large tears, holes, or crushed areas that affect the package's shape), respond with **'refund_order'** and provide a detailed description of the damage observed.
2. If the package appears **wet**, showing **signs of being drenched**, or has any sign of **water leakage**, respond with **'replace_order'** and explain the specific issue observed.
3. If the package is **cracked** or exhibits **minor damage**, wear, or tear, respond with **'replace_order'** and describe the observed condition.
4. If the package contains visible labels, text, tape, or minor surface markings but has **no physical damage** to its structure (meaning no dents, tears, holes, or crushed areas), respond with **'escalate_to_agent'** and state that the package appears normal and undamaged.
5. If the package looks completely intact with **no signs of damage** or compromise, respond with **'escalate_to_agent'** and mention that the package appears normal and undamaged.
6. For unclear images, images that only partially show the package, or if you are **unsure** about the condition of the package, respond with **'escalate_to_agent'** for further human review.
7. Anything unrelated to items, products, and packages should trigger **'escalate_to_agent'**.

**Only structural damage should trigger 'refund_order,' while all normal or unclear conditions should be escalated. Be precise in your assessment and provide a clear, concise rationale for each decision. Any signs of water or moisture, even minimally, should trigger 'replace_order.'**

Image Data: {image_data}
"""



@app.route('/submitTicket', methods=['POST'])
def submit_ticket():
    description = request.form.get('description')
    image = request.files.get('image')

    if not image:
        return jsonify({"error": "Image is required"}), 400

    ticket_number = str(uuid.uuid4())

    # Convert the image to base64
    image_data = base64.b64encode(image.read()).decode('utf-8')
    
    # Prepare the prompt for the language model
    prompt = prompt_template.format(image_data=image_data, description=description)

    # Call OpenAI model to determine ticket status
    try:
        response = llm.invoke(prompt)  # Use invoke instead of direct call
        status = response.content.strip().lower()

        # Print the response for debugging
        print(f"Model Response: {status}")
        #print(f"Parsed Status: {status}")

        # Determine final decision
        final_decision = ""
        if "replace_order" in status:
            final_decision = "Replace Order"
        elif "refund_order" in status:
            final_decision = "Refund Order"
        elif "escalate_to_agent" in status:
            final_decision = "Escalate to Human Agent"

        # Print final decision
        print(f"Final Decision: {final_decision}")

    except Exception as e:
        return jsonify({"error": f"Error communicating with OpenAI: {str(e)}"}), 500

    # Define a path to store images
    image_path = os.path.join("D:/hw1/smart-nest/python_backend/images", f"{ticket_number}.jpg")
    try:
        image.save(image_path)
    except Exception as e:
        return jsonify({"error": f"Error saving image: {str(e)}"}), 500

    # Load existing tickets
    try:
        with open(TICKETS_FILE, 'r') as f:
            tickets = json.load(f)
    except Exception as e:
        return jsonify({"error": f"Error loading tickets: {str(e)}"}), 500

    # Create a new ticket entry
    new_ticket = {
        "ticket_number": ticket_number,
        "description": description,
        "status": status,
        "image_url": image_path,
        "final_decision": final_decision  # Add final_decision here
    }
    tickets.append(new_ticket)

    # Save updated tickets to the JSON file
    try:
        with open(TICKETS_FILE, 'w') as f:
            json.dump(tickets, f, indent=4)
    except Exception as e:
        return jsonify({"error": f"Error saving tickets: {str(e)}"}), 500

    return jsonify({"ticket_number": ticket_number, "final_decision": final_decision}), 201

@app.route('/checkTicketStatus', methods=['GET'])
def check_ticket_status():
    ticket_number = request.args.get('ticketNumber')

    # Load existing tickets
    try:
        with open(TICKETS_FILE, 'r') as f:
            tickets = json.load(f)
    except Exception as e:
        return jsonify({"error": f"Error loading tickets: {str(e)}"}), 500

    ticket = next((ticket for ticket in tickets if ticket["ticket_number"] == ticket_number), None)

    if ticket:
        return jsonify({"status": ticket["status"]})
    else:
        return jsonify({"error": "Ticket not found"}), 404

if __name__ == "__main__":
    app.run(port=5000)


