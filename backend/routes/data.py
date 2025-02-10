from flask import Blueprint, jsonify, make_response, request
from flask_cors import cross_origin
from bson.objectid import ObjectId
from pymongo import errors

# Define Blueprint
data_bp = Blueprint("data", __name__)

# Database connection will be initialized in app.py and passed to this module
mongoClient = None
test_col = None

def init_db(client, collection):
    """Initialize database connection globally within this module."""
    global mongoClient, test_col
    mongoClient = client
    test_col = collection

@data_bp.route("/api/data", methods=["GET"])
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

    response = make_response(jsonify(items), 200)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    
    return response

@data_bp.route("/api/data", methods=["POST"])
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

@data_bp.route("/api/data/<id>", methods=["DELETE"])
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

@data_bp.route("/api/data/<id>", methods=["PUT"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def update_data(id):
    """Update an existing item in MongoDB"""
    print(f"\n🔄 PUT /api/data/{id} requested")

    if not mongoClient:
        print("❌ Database not connected.\n")
        return jsonify({"error": "Database not connected"}), 500

    data = request.json.get("item", "")
    if data:
        result = test_col.update_one({"_id": ObjectId(id)}, {"$set": {"item": data}})
        if result.modified_count:
            print(f"✅ Successfully updated item with ID {id}\n")
            return jsonify({"message": "Item updated"}), 200

    print(f"❌ Item with ID {id} not found or no changes made.\n")
    return jsonify({"error": "Item not found or no updates made"}), 404

@data_bp.route("/api/data", methods=["OPTIONS"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"], supports_credentials=True)
def options_preflight():
    """Handle CORS preflight request"""
    print("🟡 OPTIONS preflight request received.")
    response = make_response("", 204)
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response