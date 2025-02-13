from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from werkzeug.security import check_password_hash

accounts_bp = Blueprint("accounts", __name__)

@accounts_bp.route("/api/accounts/login", methods=["POST"])
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
