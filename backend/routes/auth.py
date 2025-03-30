import time
import uuid
from datetime import timedelta

import jwt
from flask import Blueprint, current_app, jsonify, make_response, request
from flask_cors import cross_origin
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
    verify_jwt_in_request,
)
from pymongo.errors import DuplicateKeyError
from services.config import Config
from services.email import send_reset_email
from werkzeug.security import check_password_hash, generate_password_hash

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
        access_token = create_access_token(
            identity=user["username"], expires_delta=timedelta(hours=6)
        )
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


@auth_bp.route("/api/auth/reset-password-request", methods=["POST", "OPTIONS"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def reset_password_request():
    try:
        data = request.json
        email = data.get("email")

        # find user
        users_col = current_app.config["collections"].get("users")
        user = users_col.find_one({"email": email})

        if not user:
            # Fail gracefully with a generic message to prevent email enumeration
            return jsonify(
                {
                    "message": "If an account exists with this email, a reset link will be sent."
                }
            ), 200

        # Generate a reset token (Replace with JWT logic)
        payload = {
            "username": user["username"],  # User identity
            "iat": int(time.time()),  # Issued at timestamp (ensures uniqueness)
            "jti": str(uuid.uuid4()),  # Unique token ID
        }

        reset_token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")

        print("RESET_TOKEN:", reset_token)
        # print("decoded token:\n", verify_reset_token(reset_token))

        # Send password reset email using Zoho Mail
        email_sent = send_reset_email(email, reset_token)

        if not email_sent:
            return jsonify({"error": "Failed to send email"}), 500

        return jsonify({"resetToken": reset_token}), 200

    except Exception as err:
        print("ERROR:", err)
        return jsonify({"error": str(err)}), 500


@auth_bp.route("/api/auth/verify-reset-token", methods=["GET"])
def verify_reset_token():
    """
    Verifies the password reset JWT token.

    Query Parameters:
        token (str): The JWT reset token.

    Returns:
        JSON response containing decoded data if valid, or an error message if invalid.
    """
    token = request.args.get("token")
    if not token:
        return jsonify({"error": "Token is required"}), 400

    try:
        decoded = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        return jsonify({"valid": True, "data": decoded}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"valid": False, "error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"valid": False, "error": "Invalid token"}), 400


@auth_bp.route("/api/auth/reset-password/<username>", methods=["POST"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def reset_password(username):
    data = request.json
    newPassword = data.get("newPassword")
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
    users_col.update_one(
        {"username": username},
        {"$set": {"password": generate_password_hash(newPassword)}},
    )
    response = make_response(jsonify(user), 200)
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response
