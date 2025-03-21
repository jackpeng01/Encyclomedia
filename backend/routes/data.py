from flask import Blueprint, jsonify, make_response, request, current_app
from flask_cors import cross_origin
from bson.objectid import ObjectId
from pymongo import errors
from dotenv import load_dotenv
from urllib.parse import quote
import requests
import os

# Load environment variables
load_dotenv()
TMDB_API_KEY= os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = 'https://api.themoviedb.org/3'
TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'

# Define Blueprint
data_bp = Blueprint("data", __name__)


@data_bp.route("/api/data", methods=["GET", "OPTIONS"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_data():
    """Fetch all items from the 'data' collection in MongoDB"""
    print("\n📤 GET /api/data requested")
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight successful"})
        response.status_code = 204  # No Content
        return response
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

@data_bp.route("/api/data", methods=["OPTIONS"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"], supports_credentials=True)
def options_preflight():
    """Handle CORS preflight request"""
    print("🟡 OPTIONS preflight request received.")
    response = make_response("", 204)
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response