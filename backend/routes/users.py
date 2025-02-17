import os

from flask import Blueprint, current_app, jsonify, make_response, request
from flask_cors import cross_origin
from flask_jwt_extended import create_access_token, jwt_required
from pymongo.errors import DuplicateKeyError
from schemas.user_schema import UserSchema
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

users_bp = Blueprint("users", __name__)

user_schema = UserSchema()
UPLOAD_FOLDER = "static/uploads/"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

# ✅ Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@users_bp.route("/api/users", methods=["POST"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def create_user():
    """Register a new user with schema validation"""
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    data = user_schema.load(request.json)

    print(data)
    # ✅ Validate request data with Marshmallow

    # ✅ Hash password before storing
    data["password"] = generate_password_hash(data["password"])

    # ✅ Insert user into MongoDB
    users_col.insert_one(data)

    return jsonify({"message": "User registered successfully"}), 201


@users_bp.route("/api/users/check-username", methods=["GET"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def check_username_unique():
    """Check if username is unique"""
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    username = request.args.get("username")
    if not username:
        response = make_response(jsonify({"error": "Missing username parameter"}), 400)
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    user = users_col.find_one({"username": username})
    is_unique = user is None

    response = make_response(jsonify({"isUnique": is_unique}), 200)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@users_bp.route("/api/users/<username>", methods=["GET"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_user(username):
    """Fetch user data by username"""
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        response = make_response(jsonify({"error": "database not connected"}), 500)
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    user = users_col.find_one({"username": username}, {"_id": 0, "password": 0})
    if user is None:
        response = make_response(jsonify({"error": "User not found"}), 404)
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    response = make_response(jsonify(user), 200)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@users_bp.route("/api/users/<username>/upload-profile-picture", methods=["POST"])
@jwt_required()
def upload_profile_picture(username):
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        response = make_response(jsonify({"error": "Database not connected"}), 500)
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    if "image" not in request.files:
        response = make_response(jsonify({"error": "No file uploaded"}), 400)
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    file = request.files["image"]
    if file.filename == "" or not allowed_file(file.filename):
        response = make_response(jsonify({"error": "Invalid file type"}), 400)
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    # ✅ Retrieve the user's current profile picture (if any)
    user = users_col.find_one({"username": username})
    old_picture = user.get("profilePicture")

    # ✅ Delete old profile picture if it exists (and is not the default image)
    if old_picture and old_picture.startswith("http://127.0.0.1:5000/static/uploads/"):
        old_picture_path = old_picture.lstrip("/")
        if os.path.exists(old_picture_path):
            os.remove(old_picture_path)

    # ✅ Save new file securely
    filename = secure_filename(f"{username}_{file.filename}")
    file_path = os.path.join("static/uploads", filename)
    file.save(file_path)

    # ✅ Update user profile with new image URL
    image_url = f"http://127.0.0.1:5000/static/uploads/{filename}"  # ✅ Full URL
    users_col.update_one(
        {"username": username}, {"$set": {"profilePicture": image_url}}
    )

    response = make_response(
        jsonify(
            {
                "message": "Profile picture updated successfully",
                "profilePicture": image_url,
            }
        ),
        200,
    )
    # response.headers["Access-Control-Allow-Credentials"] = "true"

    return response
