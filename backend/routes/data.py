from flask import Blueprint, jsonify, make_response, request, current_app
from flask_cors import cross_origin
from bson.objectid import ObjectId

# Define Blueprint
data_bp = Blueprint("data", __name__)


@data_bp.route("/api/data", methods=["GET"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_data():
    """Fetch all items from the 'data' collection in MongoDB"""
    print("\n📤 GET /api/data requested")

    data_col = current_app.config["collections"].get("data")
    if data_col is None:
        print("❌ Database not connected.\n")
        return jsonify({"error": "Database not connected"}), 500

    items = [
        {"_id": str(item["_id"]), "item": item["item"]} for item in data_col.find({})
    ]
    response = make_response(jsonify(items), 200)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@data_bp.route("/api/data", methods=["POST"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def add_data():
    """Insert a new item into the 'data' collection"""
    print("\n📥 POST /api/data requested")

    data_col = current_app.config["collections"].get("data")
    if data_col is None:
        return jsonify({"error": "Database not connected"}), 500

    data = request.json.get("item", "")
    if data:
        inserted = data_col.insert_one({"item": data})
        return jsonify({"message": "Item added", "id": str(inserted.inserted_id)}), 201

    return jsonify({"error": "Invalid request"}), 400
