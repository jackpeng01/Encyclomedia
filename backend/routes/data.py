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

@data_bp.route('/api/poster', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_posters():
    query = request.args.get('query', '')
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400
    
    # Retrieve the page number from the query parameters, defaulting to 1
    page = request.args.get('page', 1, type=int)
    
    try:
        # Search movies by query
        url = f"{TMDB_BASE_URL}/search/movie"
        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}
        params = {
            "query": query,
            "include_adult": False,
            "language": "en-US",
            "page": page
        }
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        # Extract relevant movie data
        movies = [
            {
                "id": movie["id"],
                "title": movie["title"],
                "poster_path": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get("poster_path") else None,
            }
            for movie in data.get("results", [])
        ]

        # Return the movies and total number of pages
        return jsonify({
            "movies": movies,
            "total_pages": data.get("total_pages", 1),  # Include total pages information
            "current_page": page
        })
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500  
    
@data_bp.route('/api/movie/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    try:
        # Fetch movie details from TMDB API
        url = f"{TMDB_BASE_URL}/movie/{movie_id}"
        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        movie = response.json()

        # Format the response data
        movie_details = {
            "id": movie.get("id"),
            "title": movie.get("title"),
            "overview": movie.get("overview"),
            "release_date": movie.get("release_date"),
            "vote_average": movie.get("vote_average"),
            "poster_path": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get("poster_path") else None,
            "genres": [genre["name"] for genre in movie.get("genres", [])],
        }

        return jsonify(movie_details)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500
