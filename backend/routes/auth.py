from flask import Blueprint, current_app, jsonify, make_response, request
from flask_cors import cross_origin
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
    verify_jwt_in_request,
)
from pymongo.errors import DuplicateKeyError
from werkzeug.security import check_password_hash, generate_password_hash
import json

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/api/auth/login", methods=["POST"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def login_user():
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
        access_token = create_access_token(identity=user["username"])
        response = make_response(
            jsonify({"message": "Login successful", "token": access_token}), 200
        )
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    else:
        return jsonify({"error": "Invalid credentials"}), 401


@auth_bp.route("/api/auth/verify-token", methods=["GET", "OPTIONS"])
def verify_token():
    print("\n📌 Incoming OPTIONS Request Headers:", request.headers)  # ✅ Debugging
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight successful"})
        response.status_code = 204  # No Content
        return response
    """Verify JWT token from the Authorization header"""
    try:
        # ✅ Extract and validate the token from the Authorization header
        verify_jwt_in_request()
        current_user = get_jwt_identity()  # ✅ Get user identity from the token

        response = make_response(jsonify({"valid": True, "user": current_user}), 200)
        return response
    except Exception as e:
        print("\n❌ Token Error:", str(e))  # ✅ Debugging log
        response = make_response(
            jsonify({"valid": False, "error": "Invalid or missing token"}), 401
        )
        # response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
