import os

from bson.objectid import (
    ObjectId,  # Needed for MongoDB ObjectId handling  # Needed for MongoDB ObjectId handling
)
from dotenv import load_dotenv
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS, cross_origin
from pymongo import MongoClient, errors

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ✅ Enable CORS to allow frontend requests
CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
    supports_credentials=True
)
# CORS(app)

app.config['CORS_HEADERS'] = 'Content-Type'

# ✅ MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI")

print("\n🔄 Attempting to connect to MongoDB...")

try:
    mongoClient = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)  # 5s timeout
    db = mongoClient.get_database('encyclomediaDB')
    test_col = db.get_collection('test')

    # Verify Connection
    mongoClient.admin.command('ping')
    print("✅ Successfully connected to MongoDB!\n")

except errors.ServerSelectionTimeoutError as e:
    print("❌ ERROR: Could not connect to MongoDB")
    print(f"🛑 {e}\n")
    mongoClient = None  # Prevent using an invalid connection

@app.route('/')
def home():
    return "<h1>Flask Backend Running</h1><p>Try accessing <a href='/api/data'>/api/data</a></p>", 200

@app.route('/api/data', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_data():
    """Fetch all items from MongoDB"""
    print("\n📤 GET /api/data requested")

    if not mongoClient:
        print("❌ Database not connected.\n")
        return jsonify({"error": "Database not connected"}), 500

    items = [{"_id": str(item["_id"]), "item": item["item"]} for item in test_col.find({})]

    if not items:
        print("⚠️ No items found in the database.\n")

    response_data = items # ✅ Wrap list in a dictionary under "data"
    print(f"✅ Sending {len(items)} items to frontend.\n")

    # ✅ Create a proper Flask response and set headers
    response = make_response(jsonify(response_data), 200)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

# ✅ POST: Add a new item
@app.route('/api/data', methods=['POST'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def add_data():
    """Insert a new item into MongoDB"""
    print("\n📥 POST /api/data requested")

    if not mongoClient:
        print("❌ Database not connected.\n")
        response = make_response(jsonify({"error": "Database not connected"}), 500)
        return response

    data = request.json.get('item', '')
    if data:
        inserted = test_col.insert_one({"item": data})
        print(f"✅ Successfully inserted: {data} with ID {inserted.inserted_id}\n")
        response = make_response(jsonify({"message": "Item added", "id": str(inserted.inserted_id)}), 201)
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    
    
    print("❌ Invalid request. No item received.\n")
    response = make_response(jsonify({"message": "item added", "id": str(inserted.inserted_id)}), 400)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


# ✅ DELETE: Remove an item by ID
@app.route('/api/data/<id>', methods=['DELETE'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def delete_data(id):
    """Delete an item from MongoDB by ID"""
    print(f"\n🗑️ DELETE /api/data/{id} requested")

    if not mongoClient:
        print("❌ Database not connected.\n")
        return jsonify({"error": "Database not connected"}), 500

    result = test_col.delete_one({"_id": ObjectId(id)})
    if result.deleted_count:
        print(f"✅ Successfully deleted item with ID {id}\n")
        return jsonify({"message": "Item deleted"}), 200

    print(f"❌ Item with ID {id} not found.\n")
    return jsonify({"error": "Item not found"}), 404


# ✅ PUT: Update an existing item by ID
@app.route('/api/data/<id>', methods=['PUT'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def update_data(id):
    """Update an existing item in MongoDB"""
    print(f"\n🔄 PUT /api/data/{id} requested")

    if not mongoClient:
        print("❌ Database not connected.\n")
        return jsonify({"error": "Database not connected"}), 500

    data = request.json.get('item', '')
    if data:
        result = test_col.update_one({"_id": ObjectId(id)}, {"$set": {"item": data}})
        if result.modified_count:
            print(f"✅ Successfully updated item with ID {id}\n")
            return jsonify({"message": "Item updated"}), 200

    print(f"❌ Item with ID {id} not found or no changes made.\n")
    return jsonify({"error": "Item not found or no updates made"}), 404


# ✅ Ensure OPTIONS works for CORS Preflight Requests
@app.route('/api/data', methods=['OPTIONS'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"], supports_credentials=True)
def options_preflight():
    """Handle CORS preflight request for POST"""
    print("🟡 OPTIONS preflight request received.")
    response = make_response("", 204)
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


if __name__ == "__main__":
    print("\n🚀 Starting Flask Server on port 5000...\n")
    app.run(debug=True, port=5000)