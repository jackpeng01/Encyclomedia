from flask import Blueprint, current_app, jsonify, request
from flask_cors import cross_origin
from bson.objectid import ObjectId
from schemas.book_logs_schema import BookLogsSchema  # Import the new schema
import requests


book_logs_schema = BookLogsSchema()  # Initialize schema

books_bp = Blueprint("books", __name__)

OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"
OPEN_LIBRARY_DETAILS_URL = "https://openlibrary.org/works"

@books_bp.route("/api/book/search", methods=["GET"])
def search_books():
    query = request.args.get("query", "")
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    try:
        response = requests.get(OPEN_LIBRARY_SEARCH_URL, params={"q": query, "limit": 10})
        response.raise_for_status() 
        data = response.json()

        books = []
        for book in data.get("docs", []):
            books.append({
                "id": book.get("key", "").replace("/works/", ""),  # Extracting book ID
                "title": book.get("title", "Unknown Title"),
                "author": book.get("author_name", ["Unknown Author"])[0],  # Take first author
                "cover_url": f"https://covers.openlibrary.org/b/id/{book.get('cover_i', '10909258')}-M.jpg"  # Default cover if missing
            })
        return jsonify({"books": books})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@books_bp.route("/api/book/<book_id>", methods=["GET"])
def get_book_details(book_id):
    OPEN_LIBRARY_DETAILS_URL = f"https://openlibrary.org/works/{book_id}.json"

    try:
        response = requests.get(OPEN_LIBRARY_DETAILS_URL)
        response.raise_for_status()
        data = response.json()

        # Extract author details
        author_names = []
        if "authors" in data:
            for author in data["authors"]:
                author_key = author.get("author", {}).get("key")
                if author_key:
                    author_response = requests.get(f"https://openlibrary.org{author_key}.json")
                    if author_response.status_code == 200:
                        author_data = author_response.json()
                        author_names.append(author_data.get("name", "Unknown Author"))

        # Fetch Edition Data (to get publish date & language)
        edition_response = requests.get(f"https://openlibrary.org{data.get('key')}.json")
        edition_data = edition_response.json() if edition_response.status_code == 200 else {}

        # Extract first 3 genres
        subjects = data.get("subjects", [])
        limited_genres = subjects[:3] if subjects else ["Unknown Genre"] 

        # Extract language
        language_codes = edition_data.get("languages", [])
        languages = [lang.get("key").split("/")[-1].upper() for lang in language_codes] if language_codes else ["Unknown Language"]

        # Extract publish date
        publish_date = edition_data.get("created", {}).get("value", "Unknown Date")

        book_details = {
            "title": data.get("title", "Unknown Title"),
            "author": author_names if author_names else ["Unknown Author"],
            "description": data.get("description", {}).get("value", "No description available") if isinstance(data.get("description"), dict) else data.get("description", "No description available"),
            "genres": limited_genres,
            "language": languages,
            "publish_date": publish_date,
            "cover_url": f"https://covers.openlibrary.org/b/id/{data.get('covers', [10909258])[0]}-L.jpg" if "covers" in data else None
        }
        #print(book_details)

        return jsonify({"book": book_details})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
    
@books_bp.route("/api/book/suggestions", methods=["GET"])
def book_suggestions():
    query = request.args.get("query", "")
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"

    try:
        response = requests.get(OPEN_LIBRARY_SEARCH_URL, params={"q": query, "limit": 5})  # Get top 5 suggestions
        response.raise_for_status()
        data = response.json()

        suggestions = []
        for book in data.get("docs", []):
            suggestions.append({
                "title": book.get("title", "Unknown Title"),
                "id": book.get("key", "").replace("/works/", ""),  # Extract book ID for linking
                "author": book.get("author_name", ["Unknown Author"])[0]
            })

        return jsonify({"suggestions": suggestions})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


#@books_bp.route("/api/book/read_later/<book_id>", methods=["POST"])
#def handle_read_later(book_id):
    data = request.get_json()
    username = data.get("username")
    title = data.get("title")
    cover = data.get("cover")

    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500

    book_logs_col = current_app.config["collections"].get("bookLogs")
    user_book_log = book_logs_col.find_one({"username": username})

    if user_book_log is None:
        info = {
            "username": username,
            "bookLog": [],
            "readLater": [],
        }
        insert = book_logs_schema.load(info)  # Use schema to validate data
        book_logs_col.insert_one(insert)

    new_entry = {
        "_id": str(ObjectId()),  # Convert ObjectId to string
        "bookId": book_id,
        "title": title,
        "cover": cover,
    }

    result = book_logs_col.update_one(
        {"username": username},  # Find the document by username
        {"$push": {"readLater": new_entry}},  # Append to readLater list
    )

    if result.matched_count > 0:
        return jsonify(new_entry), 200
    else:
        return jsonify({"error": "User not found or could not be updated."}), 400

@books_bp.route("/api/book/read_later/<book_id>", methods=["POST"])
def handle_read_later(book_id):
    data = request.get_json()
    username = data.get("username")
    title = data.get("title")
    cover = data.get("cover")

    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500

    book_logs_col = current_app.config["collections"].get("bookLogs")
    user_book_log = book_logs_col.find_one({"username": username})

    # If the user doesn't have a book log, create one
    if user_book_log is None:
        info = {
            "username": username,
            "bookLog": [],
            "readLater": [],
        }
        insert = book_logs_schema.load(info)
        book_logs_col.insert_one(insert)
        user_book_log = book_logs_col.find_one({"username": username})  # Fetch again

    # ✅ Check if the book already exists in `readLater`
    for book in user_book_log.get("readLater", []):
        if book["bookId"] == book_id:
            return jsonify({"error": "Book is already in Read Later list."}), 400  # ❌ Reject duplicate

    # ✅ If not, add the book to Read Later
    new_entry = {
        "_id": str(ObjectId()),  # Convert ObjectId to string
        "bookId": book_id,
        "title": title,
        "cover": cover,
    }

    result = book_logs_col.update_one(
        {"username": username},  # Find the document by username
        {"$push": {"readLater": new_entry}},  # Append to readLater list
    )

    if result.matched_count > 0:
        return jsonify(new_entry), 200
    else:
        return jsonify({"error": "User not found or could not be updated."}), 400


@books_bp.route('/api/book/read_later', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_read_later():
    username = request.args.get('username')

    # Ensure collections exist
    collections = current_app.config.get("collections", {})
    users_col = collections.get("users")
    book_logs_col = collections.get("bookLogs")

    if users_col is None or book_logs_col is None:
        return jsonify({"error": "Database not connected"}), 500

    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500
    
    user_book_log_item = book_logs_col.find_one({"username": username})

    # ✅ If no book log found, initialize a new one
    if user_book_log_item is None:
        info = {
            "username": username,
            "bookLog": [],
            "readLater": [],
        }
        book_logs_col.insert_one(info)
        return jsonify([])  # Return empty list since no books exist yet

    # ✅ Ensure "readLater" key exists
    read_later_log = user_book_log_item.get("readLater", [])
    if read_later_log is None:
        read_later_log = []


    # Convert ObjectId fields to string
    for entry in read_later_log:
        if "_id" in entry:
            entry["_id"] = str(entry["_id"])

    return jsonify(read_later_log)


@books_bp.route('/api/book/remove_read_later', methods=['POST'])
def remove_book():
    data = request.get_json()
    username = data.get('username')
    entry = data.get('entry')  # This is the _id of the book to remove
    section = data.get('section')

    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500

    book_logs_col = current_app.config["collections"].get("bookLogs")
    user_book_log_item = book_logs_col.find_one({"username": username})

    if user_book_log_item is None:
        return jsonify({"error": "User book log not found!"}), 404

    print(f"Attempting to remove from section: {section}, entry: {entry}, for user: {username}")
    print(f"User book log found: {user_book_log_item}")

    # ✅ Convert `entry` to a string before removing
    result = book_logs_col.update_one(
        {"username": username},
        {"$pull": {section: {"_id": str(entry)}}}  # Ensure `_id` is treated as a string
    )

    if result.modified_count == 0:
        return jsonify({"error": "Book not found in log or removal failed"}), 404

    return jsonify({"success": True, "message": f"Book removed from {section}."}), 200
