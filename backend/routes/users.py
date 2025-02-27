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

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

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


@users_bp.route("/api/users/check-email", methods=["GET"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def check_email_unique():
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    email = request.args.get("email")
    if not email:
        response = make_response(jsonify({"error": "Missing username parameter"}), 400)
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    user = users_col.find_one({"email": email})
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


@users_bp.route("/api/users/<username>", methods=["PATCH"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def patch_user(username):
    update_data = request.json
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
    users_col.update_one({"username": username}, {"$set": update_data})
    response = make_response(jsonify(user), 200)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


@users_bp.route("/api/users/<username>/upload-profile-picture", methods=["POST"])
@jwt_required()
def upload_profile_picture(username):
    users_col = current_app.config["collections"].get("users")

    if users_col is None:
        return make_response(jsonify({"error": "Database not connected"}), 500)

    if "image" not in request.files:
        return make_response(jsonify({"error": "No file uploaded"}), 400)

    file = request.files["image"]

    if file.filename == "":
        return make_response(jsonify({"error": "Invalid file name"}), 400)

    # ✅ Retrieve the user's current profile picture (if any)
    user = users_col.find_one({"username": username})
    old_picture_url = user.get("profilePicture")

    # ✅ Upload new image to Cloudinary
    try:
        upload_result = cloudinary.uploader.upload(file, folder="profile_pictures")
        new_picture_url = upload_result["secure_url"]
    except Exception as e:
        return make_response(
            jsonify({"error": f"Cloudinary upload failed: {str(e)}"}), 500
        )

    # ✅ Delete the old profile picture from Cloudinary (if not default)
    if old_picture_url and "res.cloudinary.com" in old_picture_url:
        public_id = old_picture_url.split("/")[-1].split(".")[0]  # Extract public_id
        try:
            cloudinary.uploader.destroy(f"profile_pictures/{public_id}")
        except Exception as e:
            print(f"Failed to delete old Cloudinary image: {str(e)}")

    # ✅ Update MongoDB with the new image URL
    users_col.update_one(
        {"username": username}, {"$set": {"profilePicture": new_picture_url}}
    )

    return make_response(
        jsonify(
            {
                "message": "Profile picture updated successfully",
                "profilePicture": new_picture_url,
            }
        ),
        200,
    )
