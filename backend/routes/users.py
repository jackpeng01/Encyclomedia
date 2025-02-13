from schemas.user_schema import UserSchema
from flask import Blueprint, current_app, jsonify, request, make_response
from flask_jwt_extended import create_access_token
from flask_cors import cross_origin
from pymongo.errors import DuplicateKeyError
from werkzeug.security import check_password_hash, generate_password_hash

users_bp = Blueprint("users", __name__)

user_schema = UserSchema()


@users_bp.route("/api/users", methods=["POST"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def create_user():
    """Register a new user with schema validation"""
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    data = request.json

    # ✅ Validate request data with Marshmallow
    errors = user_schema.validate(data)
    if errors:
        return jsonify({"error": errors}), 400

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
        return jsonify({"error": "Database not connected"}), 500

    user = users_col.find_one({"username": username}, {"_id": 0, "password": 0})
    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user), 200


@users_bp.route("/api/users/login", methods=["POST"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def login_user():
    # if request.method == "OPTIONS":
    #     response = jsonify({"message": "CORS preflight successful"})
    #     response.status_code = 204  # No Content
    #     response.headers["Access-Control-Allow-Credentials"] = "true"
    #     return response
    """Verify user credentials and return JWT token"""
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
        # Create JWT token
        access_token = create_access_token(
            identity={"username": user["username"], "email": user["email"]}
        )

        response = make_response(jsonify({"message": "Login successful"}), 200)
        response.set_cookie(
            "token", access_token, httponly=True, secure=True, samesite="Strict"
        )
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    else:
        return jsonify({"error": "Invalid credentials"}), 401
