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
