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
    print("\n📤 GET /api/lists requested")
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight successful"})
        response.status_code = 204  # No Content
        return response
    
    try:
        verify_jwt_in_request()
        current_user = get_jwt_identity()
        lists_col = current_app.config["collections"].get("lists")
        
        lists = []
        for list_item in lists_col.find({"user_id": current_user}):
            list_item["_id"] = str(list_item["_id"])
            lists.append(list_item)
            
        response = make_response(jsonify(lists), 200)
        return response
    except Exception as e:
        print(f"❌ Error getting lists: {e}\n")
        return jsonify({"error": str(e)}), 500


@lists_bp.route("/api/lists/<id>", methods=["GET"])
def get_list(id):
    print(f"\n📤 GET /api/lists/{id} requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    lists_col = current_app.config["collections"].get("lists")

    try:
        # Get the list
        list_item = lists_col.find_one({"_id": ObjectId(id)})
        
        if not list_item:
            print(f"❌ List with ID {id} not found.\n")
            return jsonify({"error": "List not found"}), 404
            
        # Check if user is owner, collaborator, or if the list is public
        is_owner = list_item["user_id"] == current_user
        is_collaborator = current_user in list_item.get("collaborators", [])
        is_public = list_item.get("isPublic", False)
        
        if not (is_owner or is_collaborator or is_public):
            print(f"❌ User {current_user} not authorized to view list {id}.\n")
            return jsonify({"error": "Not authorized to view this list"}), 403
        
        list_item["_id"] = str(list_item["_id"])
        response = make_response(jsonify(list_item), 200)
        return response
    except Exception as e:
        print(f"❌ Error retrieving list: {e}\n")
        return jsonify({"error": str(e)}), 500


@lists_bp.route("/api/lists", methods=["POST"])
# @cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
# @jwt_required()
def create_list():
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
            "isPublic": data.get("isPublic", False),
            "isCollaborative": data.get("isCollaborative", False),
            "collaborators": data.get("collaborators", [])
        }

        # Insert into database
        result = lists_col.insert_one(new_list)

        # Return the created list with ID
        new_list["_id"] = str(result.inserted_id)
        print(f"✅ Successfully created list: {new_list['name']} with ID {result.inserted_id}\n")

        response = make_response(jsonify(new_list), 201)
        return response
    except Exception as e:
        print(f"❌ Error creating list: {e}\n")
        return jsonify({"error": str(e)}), 500


@lists_bp.route("/api/lists/<id>", methods=["PUT"])
def update_list(id):
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
        if "isPublic" in data:
            update_data["isPublic"] = data["isPublic"]
        if "isCollaborative" in data:
            update_data["isCollaborative"] = data["isCollaborative"]
        if "collaborators" in data:
            update_data["collaborators"] = data["collaborators"]

        # Check if user is owner or collaborator before updating
        list_item = lists_col.find_one({"_id": ObjectId(id)})
        
        if not list_item:
            print(f"❌ List with ID {id} not found.\n")
            return jsonify({"error": "List not found"}), 404
            
        # Check if user is the owner or a collaborator
        is_owner = list_item["user_id"] == current_user
        is_collaborator = current_user in list_item.get("collaborators", [])
        
        if not (is_owner or is_collaborator):
            print(f"❌ User {current_user} not authorized to update list {id}.\n")
            return jsonify({"error": "Not authorized to update this list"}), 403
            
        # Only owner can change collaborators or visibility settings
        if not is_owner and ("isPublic" in data or "isCollaborative" in data or "collaborators" in data):
            print(f"❌ Only the owner can change visibility or collaborators for list {id}.\n")
            return jsonify({"error": "Only the owner can change visibility or collaborators"}), 403

        # Update in database
        result = lists_col.update_one(
            {"_id": ObjectId(id)}, {"$set": update_data}
        )

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

@lists_bp.route("/api/public-lists", methods=["GET", "OPTIONS"])
def get_public_lists():
    print("\n📤 GET /api/public-lists requested")
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS preflight successful"})
        response.status_code = 204  # No Content
        return response
    
    try:
        lists_col = current_app.config["collections"].get("lists")
        
        # Find all lists where isPublic is true
        public_lists = []
        for list_item in lists_col.find({"isPublic": True}):
            # Convert ObjectId to string for JSON serialization
            list_item["_id"] = str(list_item["_id"])
            public_lists.append(list_item)
            
        print(f"✅ Successfully retrieved {len(public_lists)} public lists\n")
        
        response = make_response(jsonify(public_lists), 200)
        return response
    except Exception as e:
        print(f"❌ Error getting public lists: {e}\n")
        return jsonify({"error": str(e)}), 500

@lists_bp.route("/api/lists/<id>/follow", methods=["POST"])
def follow_list(id):
    print(f"\n🔔 POST /api/lists/{id}/follow requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    lists_col = current_app.config["collections"].get("lists")
    users_col = current_app.config["collections"].get("users")
    
    try:
        # Check if the list exists and is public
        list_item = lists_col.find_one({"_id": ObjectId(id)})
        
        if not list_item:
            print(f"❌ List with ID {id} not found.\n")
            return jsonify({"error": "List not found"}), 404
            
        # Verify list is public
        is_public = list_item.get("isPublic", False)
        
        if not is_public:
            print(f"❌ User {current_user} not authorized to follow private list {id}.\n")
            return jsonify({"error": "Cannot follow private list"}), 403
        
        # Add list to user's followed lists if not already followed
        result = users_col.update_one(
            {"username": current_user},
            {"$addToSet": {"followed_lists": id}}
        )
        
        lists_col.update_one(
            {"_id": ObjectId(id)},
            {"$inc": {"follower_count": 1}}
        )
        
        print(f"✅ User {current_user} successfully followed list {id}.\n")
        return jsonify({"message": "Successfully followed list"}), 200
        
    except Exception as e:
        print(f"❌ Error following list: {e}\n")
        return jsonify({"error": str(e)}), 500

@lists_bp.route("/api/lists/<id>/unfollow", methods=["POST"])
def unfollow_list(id):
    print(f"\n🔔 POST /api/lists/{id}/unfollow requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    users_col = current_app.config["collections"].get("users")
    lists_col = current_app.config["collections"].get("lists")
    
    try:
        # Remove list from user's followed lists
        result = users_col.update_one(
            {"username": current_user},
            {"$pull": {"followed_lists": id}}
        )
        
        lists_col.update_one(
            {"_id": ObjectId(id), "follower_count": {"$gt": 0}},
            {"$inc": {"follower_count": -1}}
        )
        
        print(f"✅ User {current_user} successfully unfollowed list {id}.\n")
        return jsonify({"message": "Successfully unfollowed list"}), 200
        
    except Exception as e:
        print(f"❌ Error unfollowing list: {e}\n")
        return jsonify({"error": str(e)}), 500

@lists_bp.route("/api/users/followed-lists", methods=["GET"])
def get_followed_lists():
    print(f"\n📤 GET /api/users/followed-lists requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    users_col = current_app.config["collections"].get("users")
    lists_col = current_app.config["collections"].get("lists")
    
    try:
        user = users_col.find_one({"username": current_user})
        if not user:
            print(f"❌ User {current_user} not found.\n")
            return jsonify({"error": "User not found"}), 404
            
        followed_list_ids = user.get("followed_lists", [])
        
        followed_lists = []
        for list_id in followed_list_ids:
            try:
                list_item = lists_col.find_one({"_id": ObjectId(list_id)})
                if list_item:
                    list_item["_id"] = str(list_item["_id"])
                    followed_lists.append(list_item)
            except Exception as e:
                print(f"Error retrieving list {list_id}: {e}")
                
        print(f"✅ Successfully retrieved {len(followed_lists)} followed lists for user {current_user}\n")
        return jsonify(followed_lists), 200
        
    except Exception as e:
        print(f"❌ Error getting followed lists: {e}\n")
        return jsonify({"error": str(e)}), 500