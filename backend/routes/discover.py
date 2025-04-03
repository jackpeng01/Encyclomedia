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
from .tv import search_single_tv
from .books import search_book
from google import genai
from google.genai import types
import json

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
    Fetch the titles and release years of the 10 most similar movies based on the given plot description.
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
                    text="""When given the plot description of a movie, return the 10 most similar movies as a JSON array.
                    
                    Each movie must be formatted as:
                    {"title": "Movie Title", "year": 2005}

                    Ensure the response is strictly a valid JSON array containing up to 10 movie objects. 
                    Example response:
                    [{"title": "Inception", "year": 2010}, {"title": "Interstellar", "year": 2014}]

                    Do NOT include any extra text, explanations, or formatting. If no matches exist, return an empty JSON array: []
                    """
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

        print(response_text)
        # Convert response text to JSON
        movie_data = json.loads(response_text.strip())  # Ensure valid JSON parsing
        return (
            movie_data
            if isinstance(movie_data, list) and all(isinstance(m, dict) and "title" in m and "year" in m for m in movie_data)
            else []
        )
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

        # Get movie titles and years from Gemini
        similar_movies = get_similar_movie_titles(plot_description)  # Modify this function to return (title, year)
        
        if not similar_movies or not isinstance(similar_movies, list):
            return jsonify({"movies": [], "error": "No valid response from Gemini"}), 200

        print(similar_movies)  # Debugging output

        # Fetch movie details using the titles and years
        movie_details_list = []
        for movie in similar_movies:
            try:
                # Ensure movie entry is structured correctly
                if isinstance(movie, dict) and "title" in movie and "year" in movie:
                    title = movie["title"]
                    year = movie["year"]

                    # Call get_poster with title and year
                    poster_response = get_poster(title, year)
                else:
                    title = movie  # Fallback if only title is returned
                    poster_response = get_poster(title)

                # Ensure response is valid and contains a movie
                if poster_response and poster_response.status_code == 200:
                    poster_data = poster_response.get_json()
                    if "movie" in poster_data:
                        movie_details_list.append(poster_data["movie"])
                    else:
                        movie_details_list.append({"title": title, "year": year, "error": "Movie not found"})
                else:
                    movie_details_list.append({"title": title, "year": year, "error": "Failed to fetch movie details"})
            
            except Exception as fetch_error:
                print(f"Error fetching details for movie '{title} ({year})': {fetch_error}")
                movie_details_list.append({"title": title, "year": year, "error": "Error fetching details"})

        # Respond with movie details list
        return jsonify({"movies": movie_details_list}), 200

    except Exception as e:
        print(f"Unexpected error in discover_plot: {e}")
        return jsonify({"movies": [], "error": "An unexpected error occurred"}), 500



def get_recommended(interests, previous_movies, previous_tv, previous_books):
    try:
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        model = "gemini-2.0-flash"

        # Prepare the previous movies list for prompt inclusion
        previous_movies_str = ", ".join([f'"{title}"' for title in previous_movies])
        previous_tv_str = ", ".join([f'"{title}"' for title in previous_tv])
        previous_books_str = ", ".join([f'"{title}"' for title in previous_books])

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=interests)],
            ),
        ]

        # Update the prompt to ask the AI to avoid previously recommended movies
        generate_content_config = types.GenerateContentConfig(
            response_mime_type="text/plain",
            system_instruction=[types.Part.from_text(
                text=f"""
                    When given a user's interests, return **exactly** 5 random movies, 5 random TV shows, and 5 random books as a structured JSON object.
                    If no interests are provided, still return 5 random movies, 5 random TV shows, and 5 random books.
                    
                    Return the movies, then the shows, then the books.
                    
                    ### **Response Format:**
                    The response **must be a JSON object** with three keys: `"movies"`, `"shows"`, and `"books"`.  
                    Each key maps to an **array** of up to 5 items.

                    - **Movies Format:**  
                    "movies": [  
                        {{ "title": "Movie Title", "year": 2005 }},  
                        {{ "title": "Inception", "year": 2010 }}  
                    ]  

                    - **TV Shows Format:**  
                    "shows": [  
                        {{ "title": "Show Title", "year": 2005 }},  
                        {{ "title": "Breaking Bad", "year": 2008 }}  
                    ]  

                    - **Books Format:**  
                    "books": [  
                        {{ "title": "Book Title" }},  
                        {{ "title": "Dune" }}  
                    ]  

                    IMPORTANT: Do not recommend movies that have already been suggested. The following movies have already been recommended and should be excluded from the new list: {previous_movies_str}
                    IMPORTANT: Do not recommend tv shows that have already been suggested. The following tv shows have already been recommended and should be excluded from the new list: {previous_tv_str}
                    IMPORTANT: Do not recommend books that have already been suggested. The following books have already been recommended and should be excluded from the new list: {previous_books_str}

                """
            )],
        )

        # Stream and parse the response
        response_text = ""
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            response_text += chunk.text

        # Clean up response text to remove unwanted characters
        response_text = response_text.strip().replace("\n", "").replace("```json", "").replace("```", "").strip()

        # Convert response text to JSON
        movie_data = json.loads(response_text)

        # Return the movies
        return {
            "movies": movie_data.get("movies", []) if isinstance(movie_data.get("movies"), list) else [],
            "shows": movie_data.get("shows", []) if isinstance(movie_data.get("shows"), list) else [],
            "books": movie_data.get("books", []) if isinstance(movie_data.get("books"), list) else [],
        }

    except Exception as e:
        print(f"Error generating movie titles: {e}")
        return []

@discover_bp.route("/api/discover/recommended", methods=["GET"])
def recommended_media():
    try:
        # Extract plot description from query parameters
        interests = request.args.get("query", "")
        previous_movies = request.args.get("previousMovies", "[]")
        previous_tv = request.args.get("previousTv", "[]")
        previous_books = request.args.get("previousBooks", "[]")
        
        try:
            previous_movies = json.loads(previous_movies)  # Convert from JSON string to list
        except json.JSONDecodeError:
            previous_movies = []
            
        try:
            previous_tv = json.loads(previous_tv)  # Convert from JSON string to list
        except json.JSONDecodeError:
            previous_tv = []
            
        try:
            previous_books = json.loads(previous_books)  # Convert from JSON string to list
        except json.JSONDecodeError:
            previous_books = []
            
        print(previous_tv)
                        
        # Get movie titles from Gemini instead of IDs
        recommended_media = get_recommended(interests, previous_movies, previous_tv, previous_books)  # Assuming this now returns titles
        # print(recommended_media)
        # Ensure recommended_media is a dictionary and contains valid lists
        if not recommended_media or not isinstance(recommended_media, dict):
            return jsonify({"movies": [], "shows": [], "books": [], "error": "No valid response from Gemini"}), 200


        # print(f"prev: {recommended_media}")
        
        # Split the results into movies and books        
        recommended_movies = recommended_media.get("movies", [])
        recommended_shows = recommended_media.get("shows", [])
        recommended_books = recommended_media.get("books", [])
        # print(recommended_books)
        
        # Fetch movie details using the titles and years
        movie_details_list = []
        for movie in recommended_movies:
            try:
                # Ensure movie entry is structured correctly
                if isinstance(movie, dict) and "title" in movie and "year" in movie:
                    title = movie["title"]
                    year = movie["year"]

                    # Call get_poster with title and year
                    poster_response = get_poster(title, year)
                else:
                    title = movie  # Fallback if only title is returned
                    poster_response = get_poster(title)

                # Ensure response is valid and contains a movie
                if poster_response and poster_response.status_code == 200:
                    poster_data = poster_response.get_json()
                    if "movie" in poster_data:
                        movie_details_list.append(poster_data["movie"])
                    else:
                        movie_details_list.append({"title": title, "year": year, "error": "Movie not found"})
                else:
                    movie_details_list.append({"title": title, "year": year, "error": "Failed to fetch movie details"})
            
            except Exception as fetch_error:
                print(f"Error fetching details for movie '{title} ({year})': {fetch_error}")
                movie_details_list.append({"title": title, "year": year, "error": "Error fetching details"})
                
        show_details_list = []
        for show in recommended_shows:
            try:
                if isinstance(show, dict) and "title" in show and "year" in show:
                    title, year = show["title"], show["year"]
                    show_response = search_single_tv(title, year)
                else:
                    title = show
                    show_response = search_single_tv(title, None)

                if show_response and show_response.status_code == 200:
                    show_data = show_response.get_json()
                    show_details_list.append(show_data.get("tv_show", {"title": title, "year": year, "error": "TV show not found"}))
                else:
                    show_details_list.append({"title": title, "year": year, "error": "Failed to fetch TV show details"})
            except Exception as e:
                print(f"Error fetching TV show details: {e}")
                show_details_list.append({"title": show.get("title", "Unknown"), "year": show.get("year", "Unknown"), "error": "Error fetching details"})
                
        # Fetch book details using search_book function for each recommended book title
        book_details_list = []
        for book in recommended_books:
            try:
                title = book["title"]
                
                # Call search_book function to fetch book details (title, author, cover)
                book_response = search_book(title)  # You can adapt this to fetch details for each book
                
                # Ensure response is valid and contains books
                if book_response and book_response.status_code == 200:
                    book_data = book_response.get_json()
                    if "books" in book_data:
                        book_details_list.extend(book_data["books"])  # Append all books found
                    else:
                        book_details_list.append({"title": title, "error": "Book not found"})
                else:
                    book_details_list.append({"title": title, "error": "Failed to fetch book details"})
            except Exception as fetch_error:
                print(f"Error fetching details for book '{title}': {fetch_error}")
                book_details_list.append({"title": title, "error": "Error fetching details"})

        return jsonify({
            "movies": movie_details_list,
            "shows": show_details_list,
            "books": book_details_list
        }), 200

    except Exception as e:
        print(f"Unexpected error in discover_plot: {e}")
        return jsonify({"movies": [], "error": "An unexpected error occurred"}), 500