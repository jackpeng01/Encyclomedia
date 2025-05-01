import datetime
from bson.objectid import ObjectId
from flask import Blueprint, Response, current_app, jsonify, make_response, request, send_file
from flask_cors import cross_origin
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request
from io import BytesIO
import requests

collage_bp = Blueprint("collage", __name__)

@collage_bp.route("/api/collages/save", methods=["OPTIONS"])
@cross_origin(origins="http://localhost:3000", methods=["POST", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def collages_save_options():
    return "", 200

@collage_bp.route("/api/collages/<collage_id>", methods=["OPTIONS"])
@cross_origin(origins="http://localhost:3000", methods=["DELETE", "GET", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
def collage_id_options(collage_id):
    return "", 200

@collage_bp.route("/api/collages", methods=["GET"])
def get_collages():
    username = request.args.get('username')
    
    if not username:
        return jsonify({"error": "Username is required"}), 400
    
    try:
        collages_col = current_app.config["collections"]["collages"]
        collages = list(collages_col.find({"username": username}))
        
        for collage in collages:
            collage['_id'] = str(collage['_id'])
        
        return jsonify(collages)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@collage_bp.route("/api/collages/save", methods=["POST"])
def save_collage():
    try:
        verify_jwt_in_request()
        current_user = get_jwt_identity()
        
        collages_col = current_app.config["collections"]["collages"]
        data = request.json
        
        if not data or not data.get('name') or not data.get('gridSize') or not data.get('items'):
            return jsonify({"error": "Missing required fields"}), 400

        if data.get('username') != current_user:
            return jsonify({"error": "Unauthorized"}), 403
        
        collage_id = data.get('_id')
        collage_data = {
            "username": current_user,
            "name": data['name'],
            "gridSize": data['gridSize'],
            "items": data['items'],
            "showTitles": data.get('showTitles', False),
            "exportFormat": data.get('exportFormat', 'png'),
            "updated_at": datetime.datetime.utcnow()
        }
        
        if collage_id:
            result = collages_col.update_one(
                {"_id": ObjectId(collage_id), "username": current_user},
                {"$set": collage_data}
            )
            
            if result.modified_count == 0:
                return jsonify({"error": "Collage not found or no changes made"}), 404
                
            return jsonify({"message": "Collage updated successfully", "id": collage_id})
        
        else:
            collage_data["created_at"] = datetime.datetime.utcnow()
            result = collages_col.insert_one(collage_data)
            
            return jsonify({
                "message": "Collage saved successfully",
                "id": str(result.inserted_id)
            })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@collage_bp.route("/api/collages/<collage_id>", methods=["GET"])
def get_collage(collage_id):
    try:
        collages_col = current_app.config["collections"]["collages"]
        collage = collages_col.find_one({"_id": ObjectId(collage_id)})
        
        if not collage:
            return jsonify({"error": "Collage not found"}), 404
            
        collage['_id'] = str(collage['_id'])
        
        return jsonify(collage)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@collage_bp.route("/api/collages/<collage_id>", methods=["DELETE"])
def delete_collage(collage_id):
    try:
        verify_jwt_in_request()
        current_user = get_jwt_identity()
        
        collages_col = current_app.config["collections"]["collages"]
        result = collages_col.delete_one({
            "_id": ObjectId(collage_id),
            "username": current_user
        })
        
        if result.deleted_count == 0:
            return jsonify({"error": "Collage not found or unauthorized"}), 404
            
        return jsonify({"message": "Collage deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@collage_bp.route("/api/collages/trending", methods=["GET"])
def get_trending_collages():
    limit = int(request.args.get('limit', 10))
    
    try:
        collages_col = current_app.config["collections"]["collages"]
        trending_collages = list(collages_col.find().sort("updated_at", -1).limit(limit))
        
        for collage in trending_collages:
            collage['_id'] = str(collage['_id'])
            
        return jsonify(trending_collages)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@collage_bp.route("/api/proxy/image", methods=["GET"])
def proxy_image():
    image_url = request.args.get('url')
    if not image_url:
        return {"error": "Missing image URL"}, 400
    
    try:
        # Fetch the image from the original source
        response = requests.get(image_url, stream=True)
        if response.status_code != 200:
            return {"error": f"Failed to fetch image: {response.status_code}"}, response.status_code
        
        # Return the image with proper headers
        return Response(
            response.content,
            content_type=response.headers.get('Content-Type', 'image/jpeg'),
            headers={
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=86400'
            }
        )
    except Exception as e:
        return {"error": str(e)}, 500