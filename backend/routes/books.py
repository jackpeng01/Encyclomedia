import requests
from flask import Blueprint, request, jsonify

books_bp = Blueprint("books", __name__)

OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"

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
        print(book_details)

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

