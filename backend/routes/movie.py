from flask import Blueprint, current_app, jsonify, make_response, request
from flask_cors import cross_origin
from bson.objectid import ObjectId
from pymongo import errors
from dotenv import load_dotenv
from urllib.parse import quote
import requests
import os
from datetime import datetime
from schemas.movie_logs_schema import MovieLogsSchema

# Load environment variables
load_dotenv()
TMDB_API_KEY= os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = 'https://api.themoviedb.org/3'
TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'
movie_logs_schema = MovieLogsSchema()


# Define Blueprint
movie_bp = Blueprint("movie", __name__)

@movie_bp.route('/api/movie/poster', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_posters():
    query = request.args.get('query', 'category')
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
    
@movie_bp.route('/api/movie/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    try:
        # Fetch movie details from TMDB API
        url = f"{TMDB_BASE_URL}/movie/{movie_id}"
        credits_url = f"{TMDB_BASE_URL}/movie/{movie_id}/credits"
        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}

        # Movie details
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        movie = response.json()

        # Movie credits
        credits_response = requests.get(credits_url, headers=headers)
        credits_response.raise_for_status()
        credits = credits_response.json()

        # Extract cast information (limit to top 20 for brevity)
        cast = []
        for member in credits.get("cast", [])[:20]:
            profile_path = member.get("profile_path")
            # Construct the profile path or set to None if it's the placeholder
            if profile_path:
                full_path = f"https://image.tmdb.org/t/p/w500{profile_path}"
            else:
                full_path = None
            
            # Append member details to cast list
            cast.append({
                "name": member.get("name"),
                "character": member.get("character"),
                "profile_path": full_path,  # Set to None if no valid image exists
            })

        # Format the response data
        movie_details = {
            "id": movie.get("id"),
            "title": movie.get("title"),
            "overview": movie.get("overview"),
            "release_date": movie.get("release_date"),
            "vote_average": movie.get("vote_average"),
            "poster_path": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get("poster_path") else None,
            "genres": [genre["name"] for genre in movie.get("genres", [])],
            "runtime": movie.get("runtime"),
            "status": movie.get("status"),
            "tagline": movie.get("tagline"),
            "cast": cast,  # Add cast to the response
        }

        return jsonify(movie_details)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500


@movie_bp.route('/api/movie/log/<int:movie_id>', methods=['POST'])
def log_movie(movie_id):
    
    data = request.get_json()
    watched_date = data.get('watched_date')
    tags = data.get('tags', '')
    rating = data.get('rating')
    username = data.get('username')
    title = data.get('title')
    poster = data.get('poster')
        
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500
    
    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500
    
    movie_logs_col = current_app.config["collections"].get("movieLogs")
    user_movie_log_item = movie_logs_col.find_one({"username": username})
    
    if user_movie_log_item is None:
        info = {
            "username": username,
            "movieLog": [],
            "watchLater": [],
        }
        insert = movie_logs_schema.load(info)
        movie_logs_col.insert_one(insert)

    # Validate date format
    if watched_date:
        try:
            datetime.strptime(watched_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    user_movie_log_item = movie_logs_col.find_one({"username": username})

    new_movie_log = {
        "_id": ObjectId(),
        "movieId": movie_id,
        "watchDate": watched_date,
        "rating": rating,
        "tags": tags.split(",") if tags else [],  # Convert tags into a list if provided
        "title": title,
        "poster": poster,  # Add poster path to the movie log
    }
    
    result = movie_logs_col.update_one(
        {"username": username},  # Find the document by username
        {
            "$push": {"movieLog": new_movie_log},  # Use $push to append to the logs array
        },
    )

    if result.matched_count > 0:
        return {"message": "Movie successfully added to your log."}, 200
    else:
        return {"error": "User not found or could not be updated."}, 400

# Route to save a movie to the watch-later list
@movie_bp.route('/api/movie/watch_later/<int:movie_id>', methods=['POST'])
def save_for_later(movie_id):
    
    data = request.get_json()
    username = data.get('username')
    title = data.get('title')
    poster = data.get('poster')
        
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500
    
    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500
    
    movie_logs_col = current_app.config["collections"].get("movieLogs")
    user_movie_log_item = movie_logs_col.find_one({"username": username})
    
    if user_movie_log_item is None:
        info = {
            "username": username,
            "movieLog": [],
            "watchLater": [],
        }
        insert = movie_logs_schema.load(info)
        movie_logs_col.insert_one(insert)
    
    
    new_entry = {
        "_id": ObjectId(),
        "movieId": movie_id,
        "title": title,
        "poster": poster,  # Add poster path to the movie log
    }
    
    result = movie_logs_col.update_one(
        {"username": username},  # Find the document by username
        {
            "$push": {"watchLater": new_entry},  # Use $push to append to the logs array
        },
    )

    
    if result.matched_count > 0:
        new_entry["_id"] = str(new_entry["_id"])
        return new_entry
        return {"message": "Movie successfully added to your log."}, 200
    else:
        return {"error": "User not found or could not be updated."}, 400

# Route to get all logged movies
@movie_bp.route('/api/movie/log', methods=['GET'])
def get_logged_movies():
    username = request.args.get('username')  # Get username from query parameters
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500
    
    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500
    
    movie_logs_col = current_app.config["collections"].get("movieLogs")
    user_movie_log_item = movie_logs_col.find_one({"username": username})
    
    if user_movie_log_item is None:
        info = {
            "username": username,
            "movieLog": [],
            "watchLater": [],
        }
        insert = movie_logs_schema.load(info)
        movie_logs_col.insert_one(insert)
        
    movie_log = user_movie_log_item["movieLog"]
    for entry in movie_log:
        entry["_id"] = str(entry["_id"])  # Serialize ObjectId to string

    return jsonify(movie_log)
    
    # return jsonify(user_movie_log_item["movieLog"])

# Route to get all movies in the watch-later list
@movie_bp.route('/api/movie/watch_later', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_watch_later():
    username = request.args.get('username')  # Get username from query parameters
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500
    
    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500
    
    movie_logs_col = current_app.config["collections"].get("movieLogs")
    user_movie_log_item = movie_logs_col.find_one({"username": username})
    
    if user_movie_log_item is None:
        info = {
            "username": username,
            "movieLog": [],
            "watchLater": [],
        }
        insert = movie_logs_schema.load(info)
        movie_logs_col.insert_one(insert)
        
    watch_log = user_movie_log_item["watchLater"]
    for entry in watch_log:
        entry["_id"] = str(entry["_id"])  # Serialize ObjectId to string

    return jsonify(watch_log)
    
# Route to remove from log/watch later
@movie_bp.route('/api/movie/remove', methods=['POST'])
def remove_movie():
    
    data = request.get_json()
    username = data.get('username')  # Get username from query parameters
    entry = data.get('entry')
    section = data.get('section')
    print(entry)
    
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500
    
    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500
    
    movie_logs_col = current_app.config["collections"].get("movieLogs")
    user_movie_log_item = movie_logs_col.find_one({"username": username})
    
    result = movie_logs_col.update_one(
            {"username": username},
            {"$pull": {section: {"_id": ObjectId(entry)}}}  # Pull entry with matching movieId
        )
    
    if result.modified_count == 0:
        return jsonify({"error": "Movie not found in log or removal failed"}), 404
        
    return jsonify({"success": True, "message": f"Movie removed from {section}."}), 200
