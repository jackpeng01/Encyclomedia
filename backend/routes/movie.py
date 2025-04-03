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
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
movie_logs_schema = MovieLogsSchema()

# Define the genre ID to name mapping
genre_id_to_name = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western",
}

# Define Blueprint
movie_bp = Blueprint("movie", __name__)


@movie_bp.route("/api/movie/poster", methods=["GET"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_posters():
    query = request.args.get("query", "")
    year_start = request.args.get("yearStart", type=int)
    year_end = request.args.get("yearEnd", type=int)
    rating_min = request.args.get("ratingMin", type=float)
    rating_max = request.args.get("ratingMax", type=float)
    genre = request.args.get("genre", "")
    genre = genre.split(",") if genre else ""
    print(request)

    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    # Retrieve the page number from the query parameters, defaulting to 1
    page = request.args.get("page", 1, type=int)

    # Set up the TMDB API parameters for initial search based on the title
    params = {
        "query": query,
        "include_adult": False,
        "language": "en-US",
        "page": page,
    }

    try:
        # Search movies by query (title)
        url = f"{TMDB_BASE_URL}/search/movie"
        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        # Extract relevant movie data
        movies = [
            {
                "id": movie["id"],
                "title": movie["title"],
                "release_date": movie.get("release_date"),
                "vote_average": movie.get("vote_average"),
                "poster_path": f"{TMDB_IMAGE_BASE_URL}{movie['poster_path']}"
                if movie.get("poster_path")
                else None,
                "genre_ids": movie.get("genre_ids", []),  # Genre IDs from TMDB
                # Map genre IDs to names
                "genres": [
                    genre_id_to_name.get(genre_id, "Unknown")
                    for genre_id in movie.get("genre_ids", [])
                ],
            }
            for movie in data.get("results", [])
        ]

        # Filter the movies locally based on the additional parameters (if provided)
        filtered_movies = []

        for movie in movies:
            # Apply year range filter
            if year_start:
                movie_year = (
                    int(movie["release_date"][:4]) if movie["release_date"] else None
                )
                if movie_year and movie_year < year_start:
                    continue  # Skip this movie if it doesn't match the year range
            if year_end:
                movie_year = (
                    int(movie["release_date"][:4]) if movie["release_date"] else None
                )
                if movie_year and movie_year > year_end:
                    continue  # Skip this movie if it doesn't match the year range

            # Apply rating filter
            if rating_min and movie["vote_average"] < rating_min:
                continue  # Skip this movie if it doesn't meet the rating threshold
            if rating_max and movie["vote_average"] > rating_max:
                continue  # Skip this movie if it doesn't meet the rating threshold

            # Apply genre filter (Check if all genres in the filter are in the movie's genres)
            if genre and not all(g in movie["genres"] for g in genre):
                continue  # Skip this movie if it doesn't match all genres

            # Add the movie to the filtered list if it passes all filters
            filtered_movies.append(movie)

        # Return the filtered movies and total number of pages
        return jsonify(
            {
                "movies": filtered_movies,
                "total_pages": data.get(
                    "total_pages", 1
                ),  # Include total pages information
                "current_page": page,
            }
        )

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500
    
    
def get_poster(title):
    if not title:
        return jsonify({'error': 'Query parameter is required'}), 400

    # Set up the TMDB API parameters for initial search based on the title
    params = {
        "query": title,
        "include_adult": False,
        "language": "en-US",
        "page": 1,  # Always fetch the first page
    }

    try:
        # Search movies by query (title)
        url = f"{TMDB_BASE_URL}/search/movie"
        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        # Get the first movie result (if available)
        first_movie = data.get("results", [None])[0]
        if not first_movie:
            return jsonify({"error": "No movies found"}), 404

        # Extract relevant movie data
        movie_details = {
            "id": first_movie["id"],
            "title": first_movie["title"],
            "release_date": first_movie.get("release_date"),
            "vote_average": first_movie.get("vote_average"),
            "poster_path": f"{TMDB_IMAGE_BASE_URL}{first_movie['poster_path']}" if first_movie.get("poster_path") else None,
            "genre_ids": first_movie.get("genre_ids", []),
            "genres": [genre_id_to_name.get(genre_id, "Unknown") for genre_id in first_movie.get("genre_ids", [])],
        }

        # Return only the first movie's details
        return jsonify({"movie": movie_details})

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500



@movie_bp.route("/api/movie/<int:movie_id>", methods=["GET"])
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
            cast.append(
                {
                    "name": member.get("name"),
                    "character": member.get("character"),
                    "profile_path": full_path,  # Set to None if no valid image exists
                }
            )

        # Format the response data
        movie_details = {
            "id": movie.get("id"),
            "title": movie.get("title"),
            "overview": movie.get("overview"),
            "release_date": movie.get("release_date"),
            "vote_average": movie.get("vote_average"),
            "poster_path": f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"
            if movie.get("poster_path")
            else None,
            "genres": [genre["name"] for genre in movie.get("genres", [])],
            "runtime": movie.get("runtime"),
            "status": movie.get("status"),
            "tagline": movie.get("tagline"),
            "cast": cast,  # Add cast to the response
        }

        return jsonify(movie_details)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500


@movie_bp.route("/api/movie/log/<int:movie_id>", methods=["POST"])
def log_movie(movie_id):
    data = request.get_json()
    watched_date = data.get("watched_date")
    tags = data.get("tags", "")
    rating = data.get("rating")
    username = data.get("username")
    title = data.get("title")
    poster = data.get("poster")

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
            datetime.strptime(watched_date, "%Y-%m-%d")
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
            "$push": {
                "movieLog": new_movie_log
            },  # Use $push to append to the logs array
        },
    )

    if result.matched_count > 0:
        return {"message": "Movie successfully added to your log."}, 200
    else:
        return {"error": "User not found or could not be updated."}, 400


# Route to save a movie to the watch-later list
@movie_bp.route("/api/movie/watch_later/<int:movie_id>", methods=["POST"])
def save_for_later(movie_id):
    data = request.get_json()
    username = data.get("username")
    title = data.get("title")
    poster = data.get("poster")

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
@movie_bp.route("/api/movie/log", methods=["GET"])
def get_logged_movies():
    username = request.args.get("username")  # Get username from query parameters
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
@movie_bp.route("/api/movie/watch_later", methods=["GET"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_watch_later():
    username = request.args.get("username")  # Get username from query parameters
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
@movie_bp.route("/api/movie/remove", methods=["POST"])
def remove_movie():
    data = request.get_json()
    username = data.get("username")  # Get username from query parameters
    entry = data.get("entry")
    section = data.get("section")
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
        {
            "$pull": {section: {"_id": ObjectId(entry)}}
        },  # Pull entry with matching movieId
    )

    if result.modified_count == 0:
        return jsonify({"error": "Movie not found in log or removal failed"}), 404

    return jsonify({"success": True, "message": f"Movie removed from {section}."}), 200


@movie_bp.route("/api/movie/random", methods=["GET"])
def get_random_movie():
    import random

    headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}

    # Step 1: Get the latest movie to determine the maximum movie id
    latest_url = f"{TMDB_BASE_URL}/movie/latest"
    try:
        latest_response = requests.get(latest_url, headers=headers)
        latest_response.raise_for_status()
        latest_data = latest_response.json()
        max_movie_id = latest_data.get("id")
        if not max_movie_id:
            return jsonify({"error": "Latest movie id not found."}), 500
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

    # Step 2: Roll a random movie id and use get_movie_details if available
    max_attempts = 10
    for _ in range(max_attempts):
        random_id = random.randint(1, max_movie_id)
        random_url = f"{TMDB_BASE_URL}/movie/{random_id}"
        try:
            random_response = requests.get(random_url, headers=headers)
            # If the movie is not found (e.g., deleted), re-roll
            if random_response.status_code == 404:
                continue
            random_response.raise_for_status()
            # Return the movie details by calling the existing function
            return get_movie_details(random_id)
        except requests.RequestException:
            continue

    return jsonify(
        {"error": "Failed to fetch a random movie after multiple attempts."}
    ), 404


@movie_bp.route("/api/movie/suggestions", methods=["GET"])
def movie_suggestions():    
    query = request.args.get("query", "").strip()
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    params = {
        "query": query,
        "include_adult": False,
        "language": "en-US",
        "page": 1,
    }

    try:
        url = f"{TMDB_BASE_URL}/search/movie"
        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        # Only grab top 5 movie suggestions
        suggestions = [
            {
                "id": movie["id"],
                "title": movie["title"],
                "release_date": movie.get("release_date"),
                "poster": f"{TMDB_IMAGE_BASE_URL}{movie['poster_path']}" if movie.get("poster_path") else None
            }
            for movie in data.get("results", [])[:5]
        ]

        return jsonify({"suggestions": suggestions})

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500


    