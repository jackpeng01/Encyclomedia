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
from controllers.updateUserStat import update_user_section

tv_bp = Blueprint("tv", __name__)

load_dotenv()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TV_SEARCH_URL = "https://api.themoviedb.org/3/search/tv"
TRENDING_SEARCH_URL = "https://api.themoviedb.org/3/search/tv"
TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"
tv_logs_schema = TVLogsSchema()

genre_id_to_name = {
    10759: "Action & Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    10762: "Kids",
    9648: "Mystery",
    10763: "News",
    10764: "Reality",
    10765: "Sci-Fi & Fantasy",
    10766: "Soap",
    10767: "Talk",
    10768: "War & Politics",
    37: "Western"
}

@tv_bp.route("/api/tv/search", methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def search_tv():
    query = request.args.get("query", "")
    year_start = request.args.get("yearStart", type=int)
    year_end = request.args.get("yearEnd", type=int)
    rating_min = request.args.get("ratingMin", type=float)
    rating_max = request.args.get("ratingMax", type=float)
    genre = request.args.get("genre", "")
    genre = genre.split(",") if genre else ""
    
    print(request.args)
    
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
                    "poster_path": f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get("poster_path") else None, 
                    "first_air_date": item.get("first_air_date"),
                    "vote_average": item.get("vote_average"),
                    "genre_ids": item.get("genre_ids", []),  # Genre IDs from TMDB
                    # Map genre IDs to names
                    "genres": [
                        genre_id_to_name.get(genre_id, "Unknown")
                        for genre_id in item.get("genre_ids", [])
                    ],
                    })
                
            filtered_shows = []
            
            for show in tv:
                # Apply year range filter
                if year_start:
                    show_year = (
                        int(show["first_air_date"][:4]) if show["first_air_date"] else None
                    )
                    if not show_year: 
                        continue
                    if show_year and show_year < year_start:
                        continue  # Skip this show if it doesn't match the year range
                if year_end:
                    show_year = (
                        int(show["first_air_date"][:4]) if show["first_air_date"] else None
                    )
                    if not show_year:
                        continue
                    if show_year and show_year > year_end:
                        continue  # Skip this show if it doesn't match the year range

                # Apply rating filter
                if rating_min and show["vote_average"] < rating_min:
                    continue  # Skip this movie if it doesn't meet the rating threshold
                if rating_max and show["vote_average"] > rating_max:
                    continue  # Skip this movie if it doesn't meet the rating threshold

                # Apply genre filter (Check if all genres in the filter are in the movie's genres)
                if genre and not all(g in show["genres"] for g in genre):
                    continue  # Skip this movie if it doesn't match all genres

                # Add the movie to the filtered list if it passes all filters
                filtered_shows.append(show)
            # print(filtered_shows)
        return jsonify({"tv": filtered_shows})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
    
def search_single_tv(title, year):
    if not title:
        return jsonify({"error": "Query parameter is required"}), 400
    
    try:
        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}
        params = {
            "query": title,
            "include_adult": False,
            "language": "en-US",
            "page": 1,
            "first_air_date_year": year
        }
        response = requests.get(TV_SEARCH_URL, headers=headers, params=params)
        response.raise_for_status() 
        data = response.json()
        first_show = data.get("results", [None])[0]
        if not first_show:
            return jsonify({"error": "No shows found"}), 404
    
        show_details = {
            "id": first_show["id"],
            "title": first_show["name"],
            "year": year,
            "vote_average": first_show.get("vote_average"),
            "poster_path": f"{TMDB_IMAGE_BASE_URL}{first_show['poster_path']}" if first_show.get("poster_path") else None,
        }
        return jsonify({"tv_show": show_details})

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
        trailers_url = f"https://api.themoviedb.org/3/tv/{tv_id}/videos"
        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}

        # Movie details
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        item = response.json()

        # Movie credits
        credits_response = requests.get(credits_url, headers=headers)
        credits_response.raise_for_status()
        credits = credits_response.json()
        
        trailers_response = requests.get(trailers_url, headers=headers)
        trailers_response.raise_for_status()
        trailers = trailers_response.json()
        
        trailer_key = None
        for video in trailers.get("results", []):
            if video.get("type") == "Trailer" and video.get("site") == "YouTube":
                trailer_key = video.get("key")
                break

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
            "number_of_episodes": item.get("number_of_episodes"),
            "status": item.get("status"),
            "tagline": item.get("tagline"),
            "cast": cast,  # Add cast to the response
            "trailer_key": trailer_key
        }

        return jsonify(tv_details)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

@tv_bp.route("/api/tv/<int:tv_id>/recommendations", methods=["GET"])
def get_recommendations(tv_id):
    try:
        url = f"https://api.themoviedb.org/3/tv/{tv_id}/recommendations"

        headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}
        
        # Tv details
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Extract relevant movie data
        recommendations = [
            {
                "id": tv["id"],
                "title": tv["name"],
                "poster_path": f"{TMDB_IMAGE_BASE_URL}{tv['poster_path']}"
                if tv.get("poster_path")
                else None,
            }
            for tv in data.get("results", [])
        ]
        
        return jsonify(recommendations)
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
        
    update_user_section(username, "decrement", "media")
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
        
        user_tv_log_item = tv_logs_col.find_one({"username": username})
        
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
    number_of_episodes = data.get('number_of_episodes')
        
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
        "number_of_episodes": number_of_episodes,
    }
    
    result = tv_logs_col.update_one(
        {"username": username},  # Find the document by username
        {
            "$push": {"tvLog": new_tv_log},  # Use $push to append to the logs array
        },
    )

    if result.matched_count > 0:
        update_user_section(username, "increment", "media")
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
    
@tv_bp.route('/api/searchpeople', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def search_people():
    query = request.args.get("query", "")
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    
    try:
        people = []
        for page in range(1,30):
            headers = {"Authorization": f"Bearer {TMDB_API_KEY}"}
            params = {
                "query": query,
                "include_adult": False,
                "language": "en-US",
                "page": page
            }
            response = requests.get("https://api.themoviedb.org/3/search/person", headers=headers, params=params)
            response.raise_for_status() 
            data = response.json()
        
            for item in data.get("results", []):
                people.append({
                    "id": item.get("id"),  
                    "name": item.get("name"),
                    "known_for": item.get("known_for_department)"),
                    "profile_path": f"https://image.tmdb.org/t/p/original/{item.get('profile_path')}" if item.get("profile_path") else None,
                })
        return jsonify({"people": people})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
    

@tv_bp.route('/api/people/<person_id>', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def person_details(person_id):
    try:
        # Fetch movie details from TMDB API
        url = f"https://api.themoviedb.org/3/person/{person_id}"
        credits_url = f"https://api.themoviedb.org/3/person/{person_id}/combined_credits"
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
        for member in credits.get("cast", []):

            # Append member details to cast list
            cast.append({
                "id": member.get("id"),
                "title": member.get("title"),
                "poster_path": f"{TMDB_IMAGE_BASE_URL}{member['poster_path']}",
                "release_date": member.get("release_date"),
                "vote_average": member.get("vote_average"),
                "media_type": member.get("media_type"),
                "character": member.get("character"),
            })

        crew = []
        for member in credits.get("crew", []):

            # Append member details to cast list
            crew.append({
                "id": member.get("id"),
                "title": member.get("title"),
                "poster_path": f"{TMDB_IMAGE_BASE_URL}{member['poster_path']}",
                "release_date": member.get("release_date"),
                 "media_type": member.get("media_type"),
                "job": member.get("job"),
            })

        # Format the response data
        person_details = {
            "name": item.get("name"),
            "known_for": item.get("known_for_department"),
            "biography": item.get("biography"),
            "profile_path": f"https://image.tmdb.org/t/p/original/{item.get('profile_path')}" if item.get("profile_path") else None,
            "cast": cast,
            "crew": crew,
        }
        return jsonify(person_details)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
