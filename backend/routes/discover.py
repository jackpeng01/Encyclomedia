import os
import cloudinary.uploader
from flask import Blueprint, current_app, jsonify, make_response, request
from flask_cors import cross_origin
from flask_jwt_extended import create_access_token, jwt_required
from pymongo.errors import DuplicateKeyError
from schemas.user_schema import UserSchema
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from services.config import Config
from bson import ObjectId

import datetime

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

discover_bp = Blueprint("discover", __name__)


@discover_bp.route("/api/discover/users", methods=["GET"])
def discover_users():
    """
    Search users whose name contains the query (case-insensitive), sorted alphabetically.
    """
    query = request.args.get("query", "").strip()  # Get the query parameter and strip whitespace
    users_col = current_app.config["collections"].get("users")
    print(query)

    try:
        user_list = None
        # Perform a case-insensitive search for users
        if query == "":  
            # Return all users if the query is empty, sorted alphabetically
            users = list(users_col.find({}, {"_id": 0, "username": 1, "profilePicture": 1}).sort("username", 1))
            user_list = list(users)
        else:
            users = users_col.find(
                {"username": {"$regex": query, "$options": "i"}},
                {"_id": 0, "username": 1, "profilePicture": 1}  # Project only required fields
            ).sort("username", 1)  # Sort by username in ascending order
            user_list = list(users)  # Convert cursor to list

        if not user_list:
            return jsonify({"message": "No users found"}), 200

        return jsonify({"users": user_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
