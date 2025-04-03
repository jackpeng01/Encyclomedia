from flask import Blueprint, jsonify, make_response, request, current_app
from flask_cors import cross_origin
from bson.objectid import ObjectId
import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

# Define Blueprint
reviews_bp = Blueprint("reviews", __name__)

@reviews_bp.route("/api/reviews", methods=["OPTIONS"])
@cross_origin(origins="http://localhost:3000", methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def reviews_options():
    return "", 200

@reviews_bp.route("/api/reviews", methods=["POST"])
def create_review():
    print("\n📥 POST /api/reviews requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        data = request.json
        if not data or not data.get("media_id") or not data.get("media_type") or not data.get("title") or not data.get("content") or not data.get("rating"):
            print("❌ Invalid request. Required fields missing.\n")
            return jsonify({"error": "Required fields missing"}), 400
        
        # Check if user already reviewed this media
        existing_review = reviews_col.find_one({
            "user_id": current_user,
            "media_id": data.get("media_id"),
            "media_type": data.get("media_type")
        })
        
        if existing_review:
            print(f"❌ User {current_user} already reviewed this {data.get('media_type')}.\n")
            return jsonify({"error": "You've already reviewed this media"}), 400
        
        # Create review object
        new_review = {
            "user_id": current_user,
            "media_id": data.get("media_id"),
            "media_type": data.get("media_type"),
            "media_title": data.get("media_title", "Unknown Title"),
            "title": data.get("title"),
            "content": data.get("content"),
            "rating": data.get("rating"),
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
            "comments": []
        }
        
        # Insert into database
        result = reviews_col.insert_one(new_review)
        new_review["_id"] = str(result.inserted_id)
        
        print(f"✅ Review created by {current_user} for {data.get('media_type')} {data.get('media_id')}.\n")
        return jsonify(new_review), 201
    
    except Exception as e:
        print(f"❌ Error creating review: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/<media_type>/<media_id>", methods=["GET"])
def get_reviews(media_type, media_id):
    print(f"\n📤 GET /api/reviews/{media_type}/{media_id} requested")
    
    reviews_col = current_app.config["collections"].get("reviews")
    sort_by = request.args.get("sort", "recent")
    
    try:
        media_id_int = None
        try:
            media_id_int = int(media_id)
        except ValueError:
            pass
        
        # Build query with both string and integer options
        query = {
            "media_type": media_type,
        }
        
        if media_id_int is not None:
            query["$or"] = [
                {"media_id": media_id},
                {"media_id": media_id_int}
            ]
        else:
            query["media_id"] = media_id
        
        print(f"Executing MongoDB query: {query}")
        
        # Define sort_order based on sort_by parameter
        if sort_by == "recent":
            sort_order = [("created_at", -1)]
        elif sort_by == "highest":
            sort_order = [("rating", -1), ("created_at", -1)]
        elif sort_by == "lowest":
            sort_order = [("rating", 1), ("created_at", -1)]
        else:
            sort_order = [("created_at", -1)]
        
        reviews = []
        for review in reviews_col.find(query).sort(sort_order):
            review["_id"] = str(review["_id"])
            reviews.append(review)
        
        print(f"✅ Retrieved {len(reviews)} reviews for {media_type} {media_id}.\n")
        return jsonify(reviews), 200
    
    except Exception as e:
        print(f"❌ Error getting reviews: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/user/<username>", methods=["GET"])
def get_user_reviews(username):
    print(f"\n📤 GET /api/reviews/user/{username} requested")
    
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        reviews = []
        for review in reviews_col.find({"user_id": username}).sort("created_at", -1):
            review["_id"] = str(review["_id"])
            reviews.append(review)
        
        print(f"✅ Retrieved {len(reviews)} reviews by user {username}.\n")
        return jsonify(reviews), 200
    
    except Exception as e:
        print(f"❌ Error getting user reviews: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/recent", methods=["GET"])
def get_recent_reviews():
    print(f"\n📤 GET /api/reviews/recent requested")
    
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        # Get most recent reviews across all media
        reviews = []
        for review in reviews_col.find().sort("created_at", -1).limit(20):
            review["_id"] = str(review["_id"])
            reviews.append(review)
        
        print(f"✅ Retrieved {len(reviews)} recent reviews.\n")
        return jsonify(reviews), 200
    
    except Exception as e:
        print(f"❌ Error getting recent reviews: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/<id>/comment", methods=["POST"])
def add_comment(id):
    print(f"\n📥 POST /api/reviews/{id}/comment requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        data = request.json
        if not data or not data.get("content"):
            print("❌ Invalid request. Comment content is required.\n")
            return jsonify({"error": "Comment content is required"}), 400
        
        comment = {
            "user_id": current_user,
            "content": data.get("content"),
            "created_at": datetime.datetime.utcnow()
        }
        
        result = reviews_col.update_one(
            {"_id": ObjectId(id)},
            {"$push": {"comments": comment}}
        )
        
        if result.modified_count == 0:
            print(f"❌ Review with ID {id} not found.\n")
            return jsonify({"error": "Review not found"}), 404
        
        print(f"✅ Comment added to review {id} by user {current_user}.\n")
        return jsonify({"success": True}), 200
    
    except Exception as e:
        print(f"❌ Error adding comment: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/<id>", methods=["DELETE"])
def delete_review(id):
    print(f"\n🗑️ DELETE /api/reviews/{id} requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        # Check if review exists and belongs to the current user
        review = reviews_col.find_one({"_id": ObjectId(id)})
        
        if not review:
            print(f"❌ Review with ID {id} not found.\n")
            return jsonify({"error": "Review not found"}), 404
            
        if review["user_id"] != current_user:
            print(f"❌ User {current_user} not authorized to delete review {id}.\n")
            return jsonify({"error": "Not authorized to delete this review"}), 403
            
        # Delete the review
        result = reviews_col.delete_one({"_id": ObjectId(id)})
        
        if result.deleted_count == 0:
            print(f"❌ Failed to delete review {id}.\n")
            return jsonify({"error": "Failed to delete review"}), 500
            
        print(f"✅ Review {id} deleted successfully by user {current_user}.\n")
        return jsonify({"message": "Review deleted successfully"}), 200
        
    except Exception as e:
        print(f"❌ Error deleting review: {e}\n")
        return jsonify({"error": str(e)}), 500