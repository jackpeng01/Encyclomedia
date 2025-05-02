from flask import Blueprint, current_app, jsonify, request
from flask_cors import cross_origin
from bson.objectid import ObjectId
from schemas.music_logs_schema import MusicLogsSchema 
import requests
from datetime import datetime

music_logs_schema = MusicLogsSchema()  # Initialize schema
music_bp = Blueprint("music", __name__)

@music_bp.route("/api/music/search", methods=["GET"])
@cross_origin()
def search_music():
    query = request.args.get('q')
    if not query:
        return jsonify({"error": "Missing query parameter"}), 400

    deezer_url = f"https://api.deezer.com/search?q={query}"
    response = requests.get(deezer_url)

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch from Deezer"}), 500

    data = response.json()
    return jsonify(data.get("data", []))

@music_bp.route("/api/music/track/<track_id>", methods=["GET"])
@cross_origin()
def get_track_by_id(track_id):
    deezer_url = f"https://api.deezer.com/track/{track_id}"
    response = requests.get(deezer_url)

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch track data"}), 500

    return jsonify(response.json())

@music_bp.route("/api/music/log/<track_id>", methods=["POST"])
@cross_origin()
def handle_log_music(track_id):
    data = request.get_json()
    username = data.get("username")
    title = data.get("title")
    cover = data.get("cover")
    listen_date = data.get("listen_date")
    rating = data.get("rating")
    artist = data.get("artist")

    users_col = current_app.config["collections"].get("users")
    music_logs_col = current_app.config["collections"].get("musicLogs")

    if users_col is None or music_logs_col is None:
        return jsonify({"error": "Database not connected"}), 500

    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500

    user_music_log = music_logs_col.find_one({"username": username})

    if user_music_log is None:
        info = {
            "username": username,
            "musicLog": [],
            "listenLater": [],
        }
        music_logs_col.insert_one(info)
        user_music_log = music_logs_col.find_one({"username": username})

    if listen_date:
        try:
            datetime.strptime(listen_date, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    for track in user_music_log.get("musicLog", []):
        if track["trackId"] == track_id:
            return jsonify({"error": "Track is already in Music Log."}), 400

    new_entry = {
        "_id": str(ObjectId()),
        "trackId": track_id,
        "title": title,
        "artist": artist,
        "cover": cover,
        "listenDate": listen_date,
        "rating": rating,
    }

    result = music_logs_col.update_one(
        {"username": username},
        {"$push": {"musicLog": new_entry}},
    )

    if result.matched_count > 0:
        return jsonify(new_entry), 200
    else:
        return jsonify({"error": "User not found or could not be updated."}), 400


@music_bp.route("/api/music/log", methods=["GET"])
@cross_origin()
def get_logged_music():
    username = request.args.get("username")
    users_col = current_app.config["collections"].get("users")
    music_logs_col = current_app.config["collections"].get("musicLogs")

    if users_col is None or music_logs_col is None:
        return jsonify({"error": "Database not connected"}), 500

    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500

    user_music_log_item = music_logs_col.find_one({"username": username})

    if user_music_log_item is None:
        info = {
            "username": username,
            "musicLog": [],
            "listenLater": [],
        }
        music_logs_col.insert_one(info)
        return jsonify([])

    music_log = user_music_log_item["musicLog"]
    for entry in music_log:
        entry["_id"] = str(entry["_id"])

    return jsonify(music_log)

@music_bp.route("/api/music/remove", methods=["POST"])
@cross_origin()
def remove_music_log():
    data = request.get_json()
    username = data.get("username")
    entry = data.get("entry")  # This is the _id of the track to remove
    section = data.get("section")  # e.g., "musicLog" or "listenLater"

    users_col = current_app.config["collections"].get("users")
    music_logs_col = current_app.config["collections"].get("musicLogs")

    if users_col is None or music_logs_col is None:
        return jsonify({"error": "Database not connected"}), 500

    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not found"}), 404

    user_music_log = music_logs_col.find_one({"username": username})
    if user_music_log is None:
        return jsonify({"error": "Music log not found"}), 404

    result = music_logs_col.update_one(
        {"username": username},
        {"$pull": {section: {"_id": str(entry)}}}
    )

    if result.modified_count == 0:
        return jsonify({"error": "Track not found or removal failed"}), 404

    return jsonify({"success": True, "message": f"Track removed from {section}."}), 200
