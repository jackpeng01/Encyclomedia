from flask import Blueprint, jsonify, make_response, request, current_app
from flask_cors import cross_origin
from bson.objectid import ObjectId
import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from controllers.updateUserStat import update_user_section

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
        
        # Create review object with likes/dislikes arrays
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
            "comments": [],
            "likes": [],
            "dislikes": []
        }
        
        # Insert into database
        result = reviews_col.insert_one(new_review)
        new_review["_id"] = str(result.inserted_id)
        
        update_user_section(current_user, "increment", "reviews")
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
    
    # Get the current user if authenticated
    current_user = None
    try:
        verify_jwt_in_request(optional=True)
        current_user = get_jwt_identity()
    except:
        pass
    
    try:
        media_id_int = None
        try:
            media_id_int = int(media_id)
        except ValueError:
            pass
        
        # Build query
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
        
        if sort_by == "recent":
            sort_order = [("created_at", -1)]
        elif sort_by == "highest":
            sort_order = [("rating", -1), ("created_at", -1)]
        elif sort_by == "lowest":
            sort_order = [("rating", 1), ("created_at", -1)]
        elif sort_by == "popular":
            # Use aggregation for popular sorting
            pipeline = [
                {"$match": query},
                {"$addFields": {
                    "likes_count": {"$size": {"$ifNull": ["$likes", []]}},
                    "dislikes_count": {"$size": {"$ifNull": ["$dislikes", []]}},
                }},
                {"$addFields": {
                    "popularity_score": {"$subtract": ["$likes_count", "$dislikes_count"]}
                }},
                {"$sort": {"popularity_score": -1, "created_at": -1}}
            ]
            
            reviews = []
            for review in reviews_col.aggregate(pipeline):
                review["_id"] = str(review["_id"])
                review["likes"] = len(review.get("likes", []))
                review["dislikes"] = len(review.get("dislikes", []))
                
                # Add flags for if current user has liked/disliked
                if current_user:
                    review["liked"] = current_user in review.get("likes", [])
                    review["disliked"] = current_user in review.get("dislikes", [])
                
                # Process comments
                if "comments" in review:
                    for comment in review["comments"]:
                        comment["likes"] = len(comment.get("likes", []))
                        comment["dislikes"] = len(comment.get("dislikes", []))
                        if current_user:
                            comment["liked"] = current_user in comment.get("likes", [])
                            comment["disliked"] = current_user in comment.get("dislikes", [])
                        
                        # Process replies
                        if "replies" in comment:
                            for reply in comment["replies"]:
                                reply["likes"] = len(reply.get("likes", []))
                                reply["dislikes"] = len(reply.get("dislikes", []))
                                if current_user:
                                    reply["liked"] = current_user in reply.get("likes", [])
                                    reply["disliked"] = current_user in reply.get("dislikes", [])
                
                reviews.append(review)
            
            print(f"✅ Retrieved {len(reviews)} reviews for {media_type} {media_id}.\n")
            return jsonify(reviews), 200
        else:
            sort_order = [("created_at", -1)]
        
        reviews = []
        for review in reviews_col.find(query).sort(sort_order):
            review["_id"] = str(review["_id"])
            review["likes"] = len(review.get("likes", []))
            review["dislikes"] = len(review.get("dislikes", []))
            
            # Add flags for if current user has liked/disliked
            if current_user:
                review["liked"] = current_user in review.get("likes", [])
                review["disliked"] = current_user in review.get("dislikes", [])
            
            # Process comments
            if "comments" in review:
                for comment in review["comments"]:
                    comment["likes"] = len(comment.get("likes", []))
                    comment["dislikes"] = len(comment.get("dislikes", []))
                    if current_user:
                        comment["liked"] = current_user in comment.get("likes", [])
                        comment["disliked"] = current_user in comment.get("dislikes", [])
                    
                    # Process replies
                    if "replies" in comment:
                        for reply in comment["replies"]:
                            reply["likes"] = len(reply.get("likes", []))
                            reply["dislikes"] = len(reply.get("dislikes", []))
                            if current_user:
                                reply["liked"] = current_user in reply.get("likes", [])
                                reply["disliked"] = current_user in reply.get("dislikes", [])
            
            reviews.append(review)
        
        print(f"✅ Retrieved {len(reviews)} reviews for {media_type} {media_id}.\n")
        return jsonify(reviews), 200
    
    except Exception as e:
        print(f"❌ Error getting reviews: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/<id>/like", methods=["POST"])
def like_review(id):
    print(f"\n👍 POST /api/reviews/{id}/like requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        review = reviews_col.find_one({"_id": ObjectId(id)})
        if not review:
            return jsonify({"error": "Review not found"}), 404
        
        # Initialize likes/dislikes arrays if they don't exist
        if "likes" not in review:
            review["likes"] = []
        if "dislikes" not in review:
            review["dislikes"] = []
        
        # If already liked, unlike
        if current_user in review["likes"]:
            reviews_col.update_one(
                {"_id": ObjectId(id)},
                {"$pull": {"likes": current_user}}
            )
            return jsonify({
                "status": "unliked",
                "likes": len(review["likes"]) - 1,
                "dislikes": len(review["dislikes"]),
                "liked": False,
                "disliked": current_user in review["dislikes"]
            }), 200
        
        # If disliked, remove dislike and add like
        if current_user in review["dislikes"]:
            reviews_col.update_one(
                {"_id": ObjectId(id)},
                {"$pull": {"dislikes": current_user}}
            )
        
        # Add like
        reviews_col.update_one(
            {"_id": ObjectId(id)},
            {"$addToSet": {"likes": current_user}}
        )
        
        # Return updated counts
        updated_review = reviews_col.find_one({"_id": ObjectId(id)})
        return jsonify({
            "status": "liked",
            "likes": len(updated_review.get("likes", [])),
            "dislikes": len(updated_review.get("dislikes", [])),
            "liked": True,
            "disliked": False
        }), 200
        
    except Exception as e:
        print(f"❌ Error liking review: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/<id>/dislike", methods=["POST"])
def dislike_review(id):
    print(f"\n👎 POST /api/reviews/{id}/dislike requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        review = reviews_col.find_one({"_id": ObjectId(id)})
        if not review:
            return jsonify({"error": "Review not found"}), 404
        
        # Initialize likes/dislikes arrays if they don't exist
        if "likes" not in review:
            review["likes"] = []
        if "dislikes" not in review:
            review["dislikes"] = []
        
        # If already disliked, undislike
        if current_user in review["dislikes"]:
            reviews_col.update_one(
                {"_id": ObjectId(id)},
                {"$pull": {"dislikes": current_user}}
            )
            return jsonify({
                "status": "undisliked",
                "likes": len(review["likes"]),
                "dislikes": len(review["dislikes"]) - 1,
                "liked": current_user in review["likes"],
                "disliked": False
            }), 200
        
        # If liked, remove like and add dislike
        if current_user in review["likes"]:
            reviews_col.update_one(
                {"_id": ObjectId(id)},
                {"$pull": {"likes": current_user}}
            )
        
        # Add dislike
        reviews_col.update_one(
            {"_id": ObjectId(id)},
            {"$addToSet": {"dislikes": current_user}}
        )
        
        # Return updated counts
        updated_review = reviews_col.find_one({"_id": ObjectId(id)})
        return jsonify({
            "status": "disliked",
            "likes": len(updated_review.get("likes", [])),
            "dislikes": len(updated_review.get("dislikes", [])),
            "liked": False,
            "disliked": True
        }), 200
        
    except Exception as e:
        print(f"❌ Error disliking review: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/<id>/bookmark", methods=["POST"])
def bookmark_review(id):
    print(f"\n🔖 POST /api/reviews/{id}/bookmark requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    users_col = current_app.config["collections"].get("users")
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        review = reviews_col.find_one({"_id": ObjectId(id)})
        if not review:
            return jsonify({"error": "Review not found"}), 404
        
        user = users_col.find_one({"username": current_user})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Initialize bookmarks array if it doesn't exist
        if "bookmarked_reviews" not in user:
            user["bookmarked_reviews"] = []
        
        # Toggle bookmark
        if id in user["bookmarked_reviews"]:
            users_col.update_one(
                {"username": current_user},
                {"$pull": {"bookmarked_reviews": id}}
            )
            return jsonify({"status": "unbookmarked"}), 200
        else:
            users_col.update_one(
                {"username": current_user},
                {"$addToSet": {"bookmarked_reviews": id}}
            )
            return jsonify({"status": "bookmarked"}), 200
            
    except Exception as e:
        print(f"❌ Error bookmarking review: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/bookmarked", methods=["GET"])
def get_bookmarked_reviews():
    print(f"\n📤 GET /api/reviews/bookmarked requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    users_col = current_app.config["collections"].get("users")
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        user = users_col.find_one({"username": current_user})
        if not user or "bookmarked_reviews" not in user:
            return jsonify([]), 200
        
        bookmarked_reviews = []
        for review_id in user["bookmarked_reviews"]:
            review = reviews_col.find_one({"_id": ObjectId(review_id)})
            if review:
                review["_id"] = str(review["_id"])
                review["likes"] = len(review.get("likes", []))
                review["dislikes"] = len(review.get("dislikes", []))
                bookmarked_reviews.append(review)
        
        return jsonify(bookmarked_reviews), 200
        
    except Exception as e:
        print(f"❌ Error getting bookmarked reviews: {e}\n")
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
        
        comment_id = str(ObjectId())  # Generate a new ObjectId for the comment
        
        comment = {
            "_id": comment_id,  # Add this field
            "user_id": current_user,
            "content": data.get("content"),
            "created_at": datetime.datetime.utcnow(),
            "likes": [],
            "dislikes": [],
            "replies": [],
            "parent_comment_id": data.get("parent_comment_id", None)
        }
        
        # If this is a reply to another comment
        if comment["parent_comment_id"]:
            # Find the parent comment and add this reply to its replies array
            result = reviews_col.update_one(
                {
                    "_id": ObjectId(id),
                    "comments._id": comment["parent_comment_id"]
                },
                {
                    "$push": {
                        "comments.$.replies": comment
                    }
                }
            )
        else:
            # This is a top-level comment
            result = reviews_col.update_one(
                {"_id": ObjectId(id)},
                {"$push": {"comments": comment}}
            )
        
        if result.modified_count == 0:
            print(f"❌ Review or parent comment not found.\n")
            return jsonify({"error": "Review or parent comment not found"}), 404
        
        print(f"✅ Comment added to review {id} by user {current_user}.\n")
        return jsonify({"success": True, "comment": comment}), 200
    
    except Exception as e:
        print(f"❌ Error adding comment: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/<review_id>/comment/<comment_id>/like", methods=["POST"])
def like_comment(review_id, comment_id):
    print(f"\n👍 POST /api/reviews/{review_id}/comment/{comment_id}/like requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        # Find the comment and update its likes
        review = reviews_col.find_one({"_id": ObjectId(review_id)})
        if not review:
            return jsonify({"error": "Review not found"}), 404
        
        # First check if it's a direct comment
        comment_found = False
        for comment in review.get("comments", []):
            if comment["_id"] == comment_id:
                comment_found = True
                if current_user in comment.get("likes", []):
                    # Unlike
                    reviews_col.update_one(
                        {"_id": ObjectId(review_id), "comments._id": comment_id},
                        {"$pull": {"comments.$.likes": current_user}}
                    )
                    status = "unliked"
                else:
                    # Like (and remove dislike if exists)
                    reviews_col.update_one(
                        {"_id": ObjectId(review_id), "comments._id": comment_id},
                        {"$pull": {"comments.$.dislikes": current_user}}
                    )
                    reviews_col.update_one(
                        {"_id": ObjectId(review_id), "comments._id": comment_id},
                        {"$addToSet": {"comments.$.likes": current_user}}
                    )
                    status = "liked"
                break
        
        # If not found, check if it's a reply
        if not comment_found:
            for comment in review.get("comments", []):
                for reply in comment.get("replies", []):
                    if reply["_id"] == comment_id:
                        comment_found = True
                        if current_user in reply.get("likes", []):
                            # Unlike
                            reviews_col.update_one(
                                {"_id": ObjectId(review_id), "comments.replies._id": comment_id},
                                {"$pull": {"comments.$[].replies.$[reply].likes": current_user}},
                                array_filters=[{"reply._id": comment_id}]
                            )
                            status = "unliked"
                        else:
                            # Like (and remove dislike if exists)
                            reviews_col.update_one(
                                {"_id": ObjectId(review_id), "comments.replies._id": comment_id},
                                {"$pull": {"comments.$[].replies.$[reply].dislikes": current_user}},
                                array_filters=[{"reply._id": comment_id}]
                            )
                            reviews_col.update_one(
                                {"_id": ObjectId(review_id), "comments.replies._id": comment_id},
                                {"$addToSet": {"comments.$[].replies.$[reply].likes": current_user}},
                                array_filters=[{"reply._id": comment_id}]
                            )
                            status = "liked"
                        break
                if comment_found:
                    break
        
        if not comment_found:
            return jsonify({"error": "Comment not found"}), 404
        
        return jsonify({"status": status}), 200
        
    except Exception as e:
        print(f"❌ Error liking comment: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/<review_id>/comment/<comment_id>/dislike", methods=["POST"])
def dislike_comment(review_id, comment_id):
    print(f"\n👎 POST /api/reviews/{review_id}/comment/{comment_id}/dislike requested")
    verify_jwt_in_request()
    current_user = get_jwt_identity()
    
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        # Similar logic to like_comment but for dislikes
        review = reviews_col.find_one({"_id": ObjectId(review_id)})
        if not review:
            return jsonify({"error": "Review not found"}), 404
        
        # First check if it's a direct comment
        comment_found = False
        for comment in review.get("comments", []):
            if comment["_id"] == comment_id:
                comment_found = True
                if current_user in comment.get("dislikes", []):
                    # Undislike
                    reviews_col.update_one(
                        {"_id": ObjectId(review_id), "comments._id": comment_id},
                        {"$pull": {"comments.$.dislikes": current_user}}
                    )
                    status = "undisliked"
                else:
                    # Dislike (and remove like if exists)
                    reviews_col.update_one(
                        {"_id": ObjectId(review_id), "comments._id": comment_id},
                        {"$pull": {"comments.$.likes": current_user}}
                    )
                    reviews_col.update_one(
                        {"_id": ObjectId(review_id), "comments._id": comment_id},
                        {"$addToSet": {"comments.$.dislikes": current_user}}
                    )
                    status = "disliked"
                break
        
        # If not found, check if it's a reply
        if not comment_found:
            for comment in review.get("comments", []):
                for reply in comment.get("replies", []):
                    if reply["_id"] == comment_id:
                        comment_found = True
                        if current_user in reply.get("dislikes", []):
                            # Undislike
                            reviews_col.update_one(
                                {"_id": ObjectId(review_id), "comments.replies._id": comment_id},
                                {"$pull": {"comments.$[].replies.$[reply].dislikes": current_user}},
                                array_filters=[{"reply._id": comment_id}]
                            )
                            status = "undisliked"
                        else:
                            # Dislike (and remove like if exists)
                            reviews_col.update_one(
                                {"_id": ObjectId(review_id), "comments.replies._id": comment_id},
                                {"$pull": {"comments.$[].replies.$[reply].likes": current_user}},
                                array_filters=[{"reply._id": comment_id}]
                            )
                            reviews_col.update_one(
                                {"_id": ObjectId(review_id), "comments.replies._id": comment_id},
                                {"$addToSet": {"comments.$[].replies.$[reply].dislikes": current_user}},
                                array_filters=[{"reply._id": comment_id}]
                            )
                            status = "disliked"
                        break
                if comment_found:
                    break
        
        if not comment_found:
            return jsonify({"error": "Comment not found"}), 404
        
        return jsonify({"status": status}), 200
        
    except Exception as e:
        print(f"❌ Error disliking comment: {e}\n")
        return jsonify({"error": str(e)}), 500

@reviews_bp.route("/api/reviews/user/<username>", methods=["GET"])
def get_user_reviews(username):
    print(f"\n📤 GET /api/reviews/user/{username} requested")
    
    reviews_col = current_app.config["collections"].get("reviews")
    
    try:
        reviews = []
        for review in reviews_col.find({"user_id": username}).sort("created_at", -1):
            review["_id"] = str(review["_id"])
            review["likes"] = len(review.get("likes", []))
            review["dislikes"] = len(review.get("dislikes", []))
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
            review["likes"] = len(review.get("likes", []))
            review["dislikes"] = len(review.get("dislikes", []))
            reviews.append(review)
        
        print(f"✅ Retrieved {len(reviews)} recent reviews.\n")
        return jsonify(reviews), 200
    
    except Exception as e:
        print(f"❌ Error getting recent reviews: {e}\n")
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
            
        update_user_section(current_user, "decrement", "reviews")
        print(f"✅ Review {id} deleted successfully by user {current_user}.\n")
        return jsonify({"message": "Review deleted successfully"}), 200
        
    except Exception as e:
        print(f"❌ Error deleting review: {e}\n")
        return jsonify({"error": str(e)}), 500