import os
import cloudinary.uploader
from flask import Blueprint, current_app, jsonify, make_response, request
from flask_cors import cross_origin
from flask_jwt_extended import create_access_token, jwt_required
from pymongo.errors import DuplicateKeyError
from schemas.user_schema import UserSchema
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from services.config import Config
from bson import ObjectId
from .movie import get_poster
from google import genai
from google.genai import types

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

discover_bp = Blueprint("discover", __name__)


@discover_bp.route("/api/discover/users", methods=["GET"])
def discover_users():
    """
    Search users whose name contains the query (case-insensitive), sorted alphabetically.
    """
    query = request.args.get("query", "").strip()  # Get the query parameter and strip whitespace
    users_col = current_app.config["collections"].get("users")
    print(query)

    try:
        user_list = None
        # Perform a case-insensitive search for users
        if query == "":  
            # Return all users if the query is empty, sorted alphabetically
            users = list(users_col.find({}, {"_id": 0, "username": 1, "profilePicture": 1}).sort("username", 1))
            user_list = list(users)
        else:
            users = users_col.find(
                {"username": {"$regex": query, "$options": "i"}},
                {"_id": 0, "username": 1, "profilePicture": 1}  # Project only required fields
            ).sort("username", 1)  # Sort by username in ascending order
            user_list = list(users)  # Convert cursor to list

        if not user_list:
            return jsonify({"message": "No users found"}), 200

        return jsonify({"users": user_list}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



def get_similar_movie_titles(plot_description):
    """
    Fetch the titles of the 10 most similar movies based on the given plot description.
    """
    try:
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        model = "gemini-2.0-flash"

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=plot_description)],
            ),
        ]

        generate_content_config = types.GenerateContentConfig(
            response_mime_type="text/plain",
            system_instruction=[
                types.Part.from_text(
                    text="""When given the plot description of a movie, return ONLY the titles of the 10 most similar movies based on plot similarity.
                    Format the output strictly as a list of strings (e.g., ["Inception", "Interstellar", "The Matrix"]). Do NOT include any explanation, additional text, or non-string values."""
                ),
            ],
        )

        # Stream and parse the response
        response_text = ""
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            response_text += chunk.text

        # Convert response text to a list of strings (movie titles)
        movie_titles = eval(response_text.strip())  # Ensure safe eval; validate response format
        return movie_titles if isinstance(movie_titles, list) and all(isinstance(title, str) for title in movie_titles) else []
    except Exception as e:
        print(f"Error generating movie titles: {e}")
        return []

@discover_bp.route("/api/discover/plot", methods=["GET"])
def discover_plot():
    try:
        # Extract plot description from query parameters
        plot_description = request.args.get("query", "")
        if not plot_description:
            return jsonify({"error": "Plot description is required"}), 400

        # Get movie titles from Gemini instead of IDs
        movie_titles = get_similar_movie_titles(plot_description)  # Assuming this now returns titles
        if not movie_titles:
            return jsonify({"movies": [], "error": "No movie titles returned or invalid response from Gemini"}), 200
        
        print(movie_titles)

        # Fetch movie details using the movie titles
        movie_details_list = []
        for title in movie_titles:
            try:
                poster_response = get_poster(title)  # Call your existing function
                
                # Ensure response is valid and contains a movie
                if poster_response and poster_response.status_code == 200:
                    poster_data = poster_response.get_json()
                    if "movie" in poster_data:
                        movie_details_list.append(poster_data["movie"])
                    else:
                        movie_details_list.append({"title": title, "error": "Movie not found"})
                else:
                    movie_details_list.append({"title": title, "error": "Failed to fetch movie details"})
            except Exception as fetch_error:
                # Log the error for debugging
                print(f"Error fetching details for movie title '{title}': {fetch_error}")

        # Respond with movie details list
        return jsonify({"movies": movie_details_list}), 200

    except Exception as e:
        # Log and handle unexpected errors
        print(f"Unexpected error in discover_plot: {e}")
        return jsonify({"movies": [], "error": "An unexpected error occurred"}), 500


