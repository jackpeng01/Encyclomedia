from operator import attrgetter
from pymongo import errors
from dotenv import load_dotenv
from flask import Blueprint, current_app, jsonify, make_response, request
from flask_cors import cross_origin
from bson.objectid import ObjectId
import requests
import os
from schemas.tv_logs_schema import TVLogsSchema
from datetime import datetime

tv_bp = Blueprint("tv", __name__)

load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TV_SEARCH_URL = "https://api.themoviedb.org/3/search/tv"
TRENDING_SEARCH_URL = "https://api.themoviedb.org/3/search/tv"
tv_logs_schema = TVLogsSchema()

@tv_bp.route("/api/tv/search", methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def search_tv():
    query = request.args.get("query", "")
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    
    try:
        tv = []
        for page in range(1,30):
            headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}
            params = {
                "query": query,
                "include_adult": False,
                "language": "en-US",
                "page": page
            }
            response = requests.get(TV_SEARCH_URL, headers=headers, params=params)
            response.raise_for_status() 
            data = response.json()
        
            for item in data.get("results", []):
                tv.append({
                    "id": item.get("id"),  
                    "title": item.get("name"),
                    "poster_path": f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}",
                   })
        return jsonify({"tv": tv})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@tv_bp.route('/api/trendingtv', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def trending_tv():
    try:
        tv = []
        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}
        params = {
            "include_adult": False,
            "language": "en-US",
            "page": 1
        }
        response = requests.get("https://api.themoviedb.org/3/trending/tv/week", headers=headers, params=params)
        response.raise_for_status() 
        data = response.json()
        
        for item in data.get("results", []):
            tv.append({
                "id": item.get("id"),  
                "title": item.get("name"),
                "overview": item.get("overview"),
                "release_date": item.get("first_air_date"),
                "vote_average": item.get("vote_average"),
                "poster_path": f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}", 
                "popularity": item.get("popularity"),
                #"cast": cast,  # Add cast to the response
            })
        return jsonify({"tv": tv})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@tv_bp.route('/api/tv/<tv_id>', methods=['GET'])
def get_tv_details(tv_id):
    try:
        # Fetch movie details from TMDB API
        url = f"https://api.themoviedb.org/3/tv/{tv_id}"
        credits_url = f"https://api.themoviedb.org/3/tv/{tv_id}/credits"
        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}

        # Movie details
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        item = response.json()

        # Movie credits
        credits_response = requests.get(credits_url, headers=headers)
        credits_response.raise_for_status()
        credits = credits_response.json()

        # Extract cast information (limit to top 20 for brevity)
        cast = []
        for member in credits.get("cast", [])[:20]:
            profile_path = member.get("profile_path")
            #Construct the profile path or set to None if it's the placeholder
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
        tv_details = {
            "id": item.get("id"),
            "title": item.get("name"),
            "overview": item.get("overview"),
            "release_date": item.get("first_air_date"),
            "vote_average": item.get("vote_average"),
            "poster_path": f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}",
            "genres": [genre["name"] for genre in item.get("genres", [])],
            "number_of_seasons": item.get("number_of_seasons"),
            "status": item.get("status"),
            "tagline": item.get("tagline"),
            "cast": cast,  # Add cast to the response
        }

        return jsonify(tv_details)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500


#add to watch later
@tv_bp.route('/api/tv/watch_later/<tv_id>', methods=['POST'])
def save_tv(tv_id):
    
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
    
    tv_logs_col = current_app.config["collections"].get("tvLogs")
    user_tv_log_item = tv_logs_col.find_one({"username": username})
    
    if user_tv_log_item is None:
        info = {
            "username": username,
            "tvLog": [],
            "watchLater": [],
        }
        insert = tv_logs_schema.load(info)
        tv_logs_col.insert_one(insert)
    
    
    new_entry = {
        "_id": ObjectId(),
        "tvId": tv_id,
        "title": title,
        "poster": poster,  # Add poster path to the movie log
    }
    
    result = tv_logs_col.update_one(
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

#remove from log/watch later
@tv_bp.route('/api/tv/remove', methods=['POST'])
def remove_tv():
    
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
    
    tv_logs_col = current_app.config["collections"].get("tvLogs")
    user_tv_log_item = tv_logs_col.find_one({"username": username})
    
    result = tv_logs_col.update_one(
            {"username": username},
            {"$pull": {section: {"_id": ObjectId(entry)}}}  # Pull entry with matching movieId
        )
    
    if result.modified_count == 0:
        return jsonify({"error": "TV not found in log or removal failed"}), 404
        
    return jsonify({"success": True, "message": f"TV removed from {section}."}), 200


# get all watch later
@tv_bp.route('/api/tv/watch_later', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_watch_later():
    username = request.args.get('username')  # Get username from query parameters
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500
    
    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500
    
    tv_logs_col = current_app.config["collections"].get("tvLogs")
    user_tv_log_item = tv_logs_col.find_one({"username": username})
    
    if user_tv_log_item is None:
        info = {
            "username": username,
            "movieLog": [],
            "watchLater": [],
        }
        insert = tv_logs_schema.load(info)
        tv_logs_col.insert_one(insert)
        
    watch_log = user_tv_log_item["watchLater"]
    for entry in watch_log:
        entry["_id"] = str(entry["_id"])  # Serialize ObjectId to string

    return jsonify(watch_log)

#log tv
@tv_bp.route('/api/tv/log/<tv_id>', methods=['POST'])
def log_tv(tv_id):
    
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
    
    tv_logs_col = current_app.config["collections"].get("tvLogs")
    user_tv_log_item = tv_logs_col.find_one({"username": username})
    
    if user_tv_log_item is None:
        info = {
            "username": username,
            "tvLog": [],
            "watchLater": [],
        }
        insert = tv_logs_schema.load(info)
        tv_logs_col.insert_one(insert)

    # Validate date format
    if watched_date:
        try:
            datetime.strptime(watched_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    user_tv_log_item = tv_logs_col.find_one({"username": username})

    new_tv_log = {
        "_id": ObjectId(),
        "tvId": tv_id,
        "watchDate": watched_date,
        "rating": rating,
        "tags": tags.split(",") if tags else [],  # Convert tags into a list if provided
        "title": title,
        "poster": poster,  # Add poster path to the movie log
    }
    
    result = tv_logs_col.update_one(
        {"username": username},  # Find the document by username
        {
            "$push": {"tvLog": new_tv_log},  # Use $push to append to the logs array
        },
    )

    if result.matched_count > 0:
        return {"message": "TV successfully added to your log."}, 200
    else:
        return {"error": "User not found or could not be updated."}, 400

# Route to get all logged tv
@tv_bp.route('/api/tv/log', methods=['GET'])
def get_logged_tv():
    username = request.args.get('username')  # Get username from query parameters
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500
    
    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500
    
    tv_logs_col = current_app.config["collections"].get("tvLogs")
    user_tv_log_item = tv_logs_col.find_one({"username": username})
    
    if user_tv_log_item is None:
        info = {
            "username": username,
            "movieLog": [],
            "watchLater": [],
        }
        insert = tv_logs_schema.load(info)
        tv_logs_col.insert_one(insert)
        
    tv_log = user_tv_log_item["tvLog"]
    for entry in tv_log:
        entry["_id"] = str(entry["_id"])  # Serialize ObjectId to string

    return jsonify(tv_log)
    
    # return jsonify(user_movie_log_item["movieLog"])

@tv_bp.route("/api/tv/suggestions", methods=["GET"])
def tv_suggestions():    
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
        url = f"https://api.themoviedb.org/3/search/tv"
        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()

        # Only grab top 5 TV suggestions
        suggestions = [
            {
                "id": show["id"],
                "title": show["name"], 
                "release_date": show.get("first_air_date"), 
                "poster": f"https://image.tmdb.org/t/p/w500{show['poster_path']}" if show.get("poster_path") else None
            }
            for show in data.get("results", [])[:5]
        ]

        return jsonify({"suggestions": suggestions})

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500
