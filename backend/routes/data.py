from flask import Blueprint, jsonify, make_response, request
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

@data_bp.route('/api/poster', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_movie_posters():
    """
    Fetch the first 10 movie posters from TMDB API based on the query.
    """
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Query parameter 'query' is required"}), 400
    
    encoded_query = quote(query)  # This will encode spaces as '%20'
    
    all_posters = []

    # Loop through multiple pages (e.g., 5 pages)
    for page in range(1, 100):
        url = f"{TMDB_BASE_URL}/search/movie?query={encoded_query}&include_adult=false&language=en-US&page={page}"
        headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {TMDB_API_KEY}"
        }
        
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            data = response.json()
            for movie in data["results"]:
                poster_path = movie.get("poster_path")
                if poster_path:
                    all_posters.append(f"{TMDB_IMAGE_BASE_URL}{poster_path}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
            break
    return jsonify({"posters": all_posters}), 200

    # url = f"{TMDB_BASE_URL}/search/movie?query={encoded_query}&include_adult=false&language=en-US&page=1"
    # url = "https://api.themoviedb.org/3/search/movie?query=cars&include_adult=false&language=en-US&page=1"
    # params = {"api_key": TMDB_API_KEY, "query": query}
    # headers = {
    # "accept": "application/json",
    # "Authorization": f"Bearer {TMDB_API_KEY}"
    # }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return jsonify({"error": "Error fetching data from TMDB"}), response.status_code

    if response.status_code != 200:
        return jsonify({"error": "Error fetching data from TMDB"}), response.status_code

    data = response.json()
    if not data["results"]:
        return jsonify({"error": "No movies found"}), 404

    posters = []
    for movie in data["results"][:100]:  # Limit results to the first 100
        poster_path = movie.get("poster_path")
        if poster_path:
            posters.append(f"{TMDB_IMAGE_BASE_URL}{poster_path}")

    return jsonify({"posters": posters}), 200
