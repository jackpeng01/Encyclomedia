from flask import Blueprint, jsonify, make_response, request, current_app
from flask_cors import cross_origin
from bson.objectid import ObjectId
from pymongo import errors
import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

# Define Blueprint
lists_bp = Blueprint("lists", __name__)


# def init_db(client, lists_collection, users_collection):
#     """Initialize database connections globally within this module."""
#     global mongoClient, lists_col, users_col
#     mongoClient = client
#     lists_col = lists_collection
#     users_col = users_collection


@lists_bp.route("/api/lists", methods=["GET", "OPTIONS"])
def get_lists():
    """Fetch all lists for the current user from MongoDB"""
    print("\n📌 Incoming OPTIONS Request Headers:", request.headers)  # ✅ Debugging
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight successful"})
        response.status_code = 204  # No Content
        return response
    print("\n📤 GET /api/lists requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    lists_col = current_app.config["collections"].get("lists")
    # if not mongzoClient:
    #     print("❌ Database not connected.\n")
    #     return jsonify({"error": "Database not connected"}), 500

    # Get lists only for the current user
    lists = []
    for list_item in lists_col.find({"user_id": current_user}):
        list_item["_id"] = str(list_item["_id"])
        lists.append(list_item)

    response = make_response(jsonify(lists), 200)

    return response


@lists_bp.route("/api/lists/<id>", methods=["GET"])
def get_list(id):
    """Fetch a specific list by ID"""
    print(f"\n📤 GET /api/lists/{id} requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    lists_col = current_app.config["collections"].get("lists")

    try:
        # Only get the list if it belongs to the current user
        list_item = lists_col.find_one({"_id": ObjectId(id), "user_id": current_user})
        if list_item:
            list_item["_id"] = str(list_item["_id"])
            response = make_response(jsonify(list_item), 200)
            response.headers["Access-Control-Allow-Credentials"] = "true"
            return response
        else:
            print(f"❌ List with ID {id} not found or doesn't belong to the user.\n")
            return jsonify({"error": "List not found"}), 404
    except Exception as e:
        print(f"❌ Error retrieving list: {e}\n")
        return jsonify({"error": str(e)}), 500


@lists_bp.route("/api/lists", methods=["POST"])
# @cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
# @jwt_required()
def create_list():
    """Create a new list"""
    print("\n📥 POST /api/lists requested")
    verify_jwt_in_request()

    current_user = get_jwt_identity()
    lists_col = current_app.config["collections"].get("lists")

    try:
        data = request.json
        if not data or not data.get("name"):
            print("❌ Invalid request. List name is required.\n")
            return jsonify({"error": "List name is required"}), 400

        # Create list structure with user_id field
        new_list = {
            "name": data.get("name"),
            "description": data.get("description", ""),
            "items": data.get("items", []),
            "user_id": current_user,
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
        }

        # Insert into database
        result = lists_col.insert_one(new_list)

        # Return the created list with ID
        new_list["_id"] = str(result.inserted_id)
        print(
            f"✅ Successfully created list: {new_list['name']} with ID {result.inserted_id}\n"
        )

        response = make_response(jsonify(new_list), 201)
        # response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    except Exception as e:
        print(f"❌ Error creating list: {e}\n")
        return jsonify({"error": str(e)}), 500


@lists_bp.route("/api/lists/<id>", methods=["PUT"])
def update_list(id):
    """Update an existing list"""
    print(f"\n🔄 PUT /api/lists/{id} requested")
    verify_jwt_in_request()

    current_user = get_jwt_identity()
    lists_col = current_app.config["collections"].get("lists")

    try:
        data = request.json
        if not data:
            print("❌ Invalid request. No data provided.\n")
            return jsonify({"error": "No data provided"}), 400

        # Create update structure
        update_data = {"updated_at": datetime.datetime.utcnow()}
        if "name" in data:
            update_data["name"] = data["name"]
        if "description" in data:
            update_data["description"] = data["description"]
        if "items" in data:
            update_data["items"] = data["items"]

        # Update in database, ensuring it belongs to the current user
        result = lists_col.update_one(
            {"_id": ObjectId(id), "user_id": current_user}, {"$set": update_data}
        )

        if result.matched_count == 0:
            print(f"❌ List with ID {id} not found or doesn't belong to the user.\n")
            return jsonify({"error": "List not found"}), 404

        # Get the updated list
        updated_list = lists_col.find_one({"_id": ObjectId(id)})
        updated_list["_id"] = str(updated_list["_id"])

        print(f"✅ Successfully updated list with ID {id}\n")

        response = make_response(jsonify(updated_list), 200)
        return response
    except Exception as e:
        print(f"❌ Error updating list: {e}\n")
        return jsonify({"error": str(e)}), 500


@lists_bp.route("/api/lists/<id>", methods=["DELETE"])
def delete_list(id):
    """Delete a list"""
    print(f"\n🗑️ DELETE /api/lists/{id} requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()

    lists_col = current_app.config["collections"].get("lists")

    try:
        # Only delete if it belongs to the current user
        result = lists_col.delete_one({"_id": ObjectId(id), "user_id": current_user})

        if result.deleted_count == 0:
            print(f"❌ List with ID {id} not found or doesn't belong to the user.\n")
            response = make_response(jsonify({"error": "List not found"}), 404)
            response.headers["Access-Control-Allow-Credentials"] = "true"
            return response

        print(f"✅ Successfully deleted list with ID {id}\n")

        response = make_response(jsonify({"message": "List deleted successfully"}), 200)
        return response
    except Exception as e:
        print(f"❌ Error deleting list: {e}\n")
        return jsonify({"error": str(e)}), 500


# Migrate existing lists to have user ownership
@lists_bp.route("/api/admin/migrate-lists", methods=["POST"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def migrate_lists():
    """Admin endpoint to associate existing lists with users"""
    lists_col = current_app.config["collections"].get("lists")

    try:
        data = request.json
        admin_key = data.get("admin_key")

        # Simple security check - in production use proper admin authentication
        if admin_key != "your_secure_admin_key":
            return jsonify({"error": "Unauthorized"}), 401

        default_user = data.get("default_user")
        if not default_user:
            return jsonify({"error": "Default user required"}), 400

        # Update all lists with no user_id to belong to the default user
        result = lists_col.update_many(
            {"user_id": None}, {"$set": {"user_id": default_user}}
        )

        return jsonify(
            {"message": "Migration complete", "modified_count": result.modified_count}
        ), 200
    except Exception as e:
        print(f"❌ Error migrating lists: {e}\n")
        return jsonify({"error": str(e)}), 500


@lists_bp.route("/api/lists/<id>", methods=["OPTIONS"])
@cross_origin(
    origin="http://localhost:3000", headers=["Content-Type"], supports_credentials=True
)
def list_id_options_preflight(id):
    """Handle CORS preflight request for specific list ID"""
    print(f"🟡 OPTIONS preflight request received for /api/lists/{id}.")
    response = make_response("", 204)
    response.headers["Access-Control-Allow-Methods"] = "GET, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response
