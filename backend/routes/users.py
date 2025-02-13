from flask import Blueprint, current_app, jsonify, request
from flask_cors import cross_origin
from pymongo.errors import DuplicateKeyError
from werkzeug.security import check_password_hash, generate_password_hash

users_bp = Blueprint("users", __name__)


@users_bp.route("/api/users", methods=["POST"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def create_user():
    """Create a new user"""
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    # Extract request data
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    # Validate required fields
    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    # Check if username already exists
    hashed_password = generate_password_hash(password)

    try:
        # Insert into MongoDB
        user_id = users_col.insert_one(
            {
                "username": username,
                "email": email,
                "password": hashed_password,  # Store hashed password
            }
        ).inserted_id

        return jsonify({"message": "User created", "id": str(user_id)}), 201
    except DuplicateKeyError:
        return jsonify({"error": "Username or email already exists"}), 409


@users_bp.route("/api/users/check-username", methods=["GET"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def check_username_unique():
    """Check if username is unique"""
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    username = request.args.get("username")
    if not username:
        return jsonify({"error": "Missing username parameter"}), 400

    user = users_col.find_one({"username": username})
    is_unique = user is None

    return jsonify({"isUnique": is_unique}), 200


@users_bp.route("/api/users/<username>", methods=["GET"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_user(username):
    """Fetch user data by username"""
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    user = users_col.find_one({"username": username}, {"_id": 0, "password": 0})
    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user), 200


@users_bp.route("/api/users/login", methods=["POST"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def login_user():
    """Verify user credentials"""
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    # Extract request data
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # Validate required fields
    if not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    # Find user by email
    user = users_col.find_one({"email": email})
    if user and check_password_hash(user["password"], password):
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401
