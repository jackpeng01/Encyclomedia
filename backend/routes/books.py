from flask import Blueprint, current_app, jsonify, request
from flask_cors import cross_origin
from bson.objectid import ObjectId
from schemas.book_logs_schema import BookLogsSchema  # Import the new schema
import requests
from datetime import datetime
from controllers.updateUserStat import update_user_section


genres_and_subjects = [
    "Arts",
    "Architecture",
    "Art Instruction",
    "Art History",
    "Dance",
    "Design",
    "Fashion",
    "Film",
    "Graphic Design",
    "Music",
    "Music Theory",
    "Painting",
    "Photography",
    "Animals",
    "Bears",
    "Cats",
    "Kittens",
    "Dogs",
    "Puppies",
    "Fiction",
    "Fantasy",
    "Historical Fiction",
    "Horror",
    "Humor",
    "Literature",
    "Magic",
    "Mystery and detective stories",
    "Plays",
    "Poetry",
    "Romance",
    "Science Fiction",
    "Short Stories",
    "Thriller",
    "Young Adult",
    "Science & Mathematics",
    "Biology",
    "Chemistry",
    "Mathematics",
    "Physics",
    "Programming",
    "Business & Finance",
    "Management",
    "Entrepreneurship",
    "Business Economics",
    "Business Success",
    "Finance",
    "Children's",
    "Kids Books",
    "Stories in Rhyme",
    "Baby Books",
    "Bedtime Books",
    "Picture Books",
    "History",
    "Ancient Civilization",
    "Archaeology",
    "Anthropology",
    "World War II",
    "Social Life and Customs",
    "Health & Wellness",
    "Cooking",
    "Cookbooks",
    "Mental Health",
    "Exercise",
    "Nutrition",
    "Self-help",
    "Biography",
    "Autobiographies",
    "History",
    "Politics and Government",
    "World War II",
    "Women",
    "Kings and Rulers",
    "Composers",
    "Artists",
    "Social Sciences",
    "Anthropology",
    "Religion",
    "Political Science",
    "Psychology",
    "Places",
    "Brazil",
    "India",
    "Indonesia",
    "United States",
    "Textbooks",
    "History",
    "Mathematics",
    "Geography",
    "Psychology",
    "Algebra",
]


book_logs_schema = BookLogsSchema()  # Initialize schema

books_bp = Blueprint("books", __name__)

OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"
OPEN_LIBRARY_DETAILS_URL = "https://openlibrary.org/works"
TRENDING_BOOKS_URL = "https://openlibrary.org/trending/weekly.json"


@books_bp.route("/api/book/search", methods=["GET"])
def search_books():
    query = request.args.get("query", "")
    subjects = request.args.get("subjects", "")  # Get selected subjects
    year_start = request.args.get("yearStart", None)  # Get yearStart from request
    year_end = request.args.get("yearEnd", None)  # Get yearEnd from request

    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    # Construct the full query to include subjects if they are provided
    full_query = query
    if subjects:
        full_query += f" subject:{subjects}"

    try:
        # Perform the search request to Open Library
        response = requests.get(
            OPEN_LIBRARY_SEARCH_URL, params={"q": full_query, "limit": 10}
        )
        response.raise_for_status()  # Raise error for bad responses
        data = response.json()

        books = []
        for book in data.get("docs", []):
            # Get the publish year from the book data (if available)
            publish_year = int(
                book.get("first_publish_year", [None])
            )  # Default to None if no year

            # Filter by yearStart and yearEnd if those values are provided
            if year_start and publish_year and publish_year < int(year_start):
                continue
            if year_end and publish_year and publish_year > int(year_end):
                continue

            # Add book data to the list
            books.append(
                {
                    "id": book.get("key", "").replace(
                        "/works/", ""
                    ),  # Extracting book ID
                    "title": book.get("title", "Unknown Title"),
                    "author": book.get("author_name", ["Unknown Author"])[
                        0
                    ],  # Take first author
                    "cover_url": f"https://covers.openlibrary.org/b/id/{book.get('cover_i', '10909258')}-M.jpg",  # Default cover if missing
                }
            )

        return jsonify({"books": books})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


def search_book(title):
    if not title:
        return jsonify({"error": 'Query parameter "title" is required'}), 400

    # Construct the full query to include subjects if they are provided
    full_query = title

    try:
        # Perform the search request to Open Library
        response = requests.get(
            OPEN_LIBRARY_SEARCH_URL, params={"q": full_query, "limit": 1}
        )
        response.raise_for_status()  # Raise error for bad responses
        data = response.json()

        books = []
        for book in data.get("docs", []):
            # Add book data to the list
            books.append(
                {
                    "id": book.get("key", "").replace(
                        "/works/", ""
                    ),  # Extracting book ID
                    "title": book.get("title", "Unknown Title"),
                    "author": book.get("author_name", ["Unknown Author"])[
                        0
                    ],  # Take first author
                    "cover_url": f"https://covers.openlibrary.org/b/id/{book.get('cover_i', '10909258')}-M.jpg",  # Default cover if missing
                }
            )

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
                    author_response = requests.get(
                        f"https://openlibrary.org{author_key}.json"
                    )
                    if author_response.status_code == 200:
                        author_data = author_response.json()
                        author_names.append(author_data.get("name", "Unknown Author"))

        # Fetch Edition Data (to get publish date & language)
        edition_response = requests.get(
            f"https://openlibrary.org{data.get('key')}.json"
        )
        edition_data = (
            edition_response.json() if edition_response.status_code == 200 else {}
        )

        # Extract first 3 genres
        subjects = data.get("subjects", [])
        limited_genres = subjects[:3] if subjects else ["Unknown Genre"]

        # Extract language
        language_codes = edition_data.get("languages", [])
        languages = (
            [lang.get("key").split("/")[-1].upper() for lang in language_codes]
            if language_codes
            else ["Unknown Language"]
        )

        # Extract publish date
        publish_date = edition_data.get("created", {}).get("value", "Unknown Date")

        book_details = {
            "title": data.get("title", "Unknown Title"),
            "author": author_names if author_names else ["Unknown Author"],
            "description": data.get("description", {}).get(
                "value", "No description available"
            )
            if isinstance(data.get("description"), dict)
            else data.get("description", "No description available"),
            "genres": limited_genres,
            "language": languages,
            "publish_date": publish_date,
            "cover_url": f"https://covers.openlibrary.org/b/id/{data.get('covers', [10909258])[0]}-L.jpg"
            if "covers" in data
            else None,
        }
        # print(book_details)

        return jsonify({"book": book_details})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
    
@books_bp.route("/api/book/<book_id>/recommendations", methods=["GET"])
def get_recommendations(book_id):
    OPEN_LIBRARY_DETAILS_URL = f"https://openlibrary.org/works/{book_id}.json"
    try:
    
        subjects_param = request.args.get('subjects', "")
        subjects_list = [subject.strip() for subject in subjects_param if subject.strip()]

        # Generate the dynamic subject filter
        if subjects_list:       
            subjects_filter = " OR ".join(f'"{subject.strip()}"' for subject in subjects_list)
            

        query = (
            f'ebook_access:[borrowable TO *] '
            f'-key:"/works/{book_id}" '
            f'subject:({subjects_filter})'
        )
        # query = 'ebook_access:[borrowable TO *]'

        params = {
            "q": query,
            "page": 1,
            "limit": 5
        }
    
        # response = requests.get(
        #     OPEN_LIBRARY_SEARCH_URL, params={"q": query, "limit": 10}
        # )
        response = requests.get("https://openlibrary.org/search.json", params=params)
        response.raise_for_status()
        data = response.json()
        # print(data)
        
        books = []
        for book in data.get("docs", []):
            # Add book data to the list
            books.append(
                {
                    "id": book.get("key", "").replace(
                        "/works/", ""
                    ),  # Extracting book ID
                    "title": book.get("title", "Unknown Title"),
                    "author": book.get("author_name", ["Unknown Author"])[
                        0
                    ],  # Take first author
                    "cover_url": f"https://covers.openlibrary.org/b/id/{book.get('cover_i', '10909258')}-M.jpg",  # Default cover if missing
                }
            )

        return jsonify({"books": books})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


@books_bp.route("/api/book/suggestions", methods=["GET"])
def book_suggestions():
    query = request.args.get("query", "")
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"

    try:
        response = requests.get(
            OPEN_LIBRARY_SEARCH_URL, params={"q": query, "limit": 5}
        )  # Get top 5 suggestions
        response.raise_for_status()
        data = response.json()

        suggestions = []
        for book in data.get("docs", []):
            cover_id = book.get("cover_i")
            poster_url = (
                f"https://covers.openlibrary.org/b/id/{cover_id}-M.jpg"
                if cover_id
                else None
            )

            suggestions.append(
                {
                    "title": book.get("title", "Unknown Title"),
                    "id": book.get("key", "").replace("/works/", ""),
                    "author": book.get("author_name", ["Unknown Author"])[0],
                    "poster": poster_url,
                }
            )

        return jsonify({"suggestions": suggestions})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


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
        user_book_log = book_logs_col.find_one({"username": username})

    # Check if the book already exists in `readLater`
    for book in user_book_log.get("readLater", []):
        if book["bookId"] == book_id:
            return jsonify({"error": "Book is already in Read Later list."}), 400

    # If not, add the book to Read Later
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


@books_bp.route("/api/book/read_later", methods=["GET"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_read_later():
    username = request.args.get("username")

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

    # If no book log found, initialize a new one
    if user_book_log_item is None:
        info = {
            "username": username,
            "bookLog": [],
            "readLater": [],
        }
        book_logs_col.insert_one(info)
        return jsonify([])  # Return empty list since no books exist yet

    # Ensure "readLater" key exists
    read_later_log = user_book_log_item.get("readLater", [])
    if read_later_log is None:
        read_later_log = []

    # Convert ObjectId fields to string
    for entry in read_later_log:
        if "_id" in entry:
            entry["_id"] = str(entry["_id"])

    return jsonify(read_later_log)


@books_bp.route("/api/book/remove_read_later", methods=["POST"])
def remove_book():
    data = request.get_json()
    username = data.get("username")
    entry = data.get("entry")  # This is the _id of the book to remove
    section = data.get("section")

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

    print(
        f"Attempting to remove from section: {section}, entry: {entry}, for user: {username}"
    )
    print(f"User book log found: {user_book_log_item}")

    # ✅ Convert `entry` to a string before removing
    result = book_logs_col.update_one(
        {"username": username},
        {
            "$pull": {section: {"_id": str(entry)}}
        },  # Ensure `_id` is treated as a string
    )

    if result.modified_count == 0:
        return jsonify({"error": "Book not found in log or removal failed"}), 404

    return jsonify({"success": True, "message": f"Book removed from {section}."}), 200


@books_bp.route("/api/book/log/<book_id>", methods=["POST"])
def handle_log_book(book_id):
    data = request.get_json()
    username = data.get("username")
    title = data.get("title")
    cover = data.get("cover")
    read_date = data.get("read_date")
    rating = data.get("rating")
    author = data.get('author')

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
        user_book_log = book_logs_col.find_one({"username": username})

    # Validate date format
    if read_date:
        try:
            datetime.strptime(read_date, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    # Reject duplicates
    for book in user_book_log.get("bookLog", []):
        if book["bookId"] == book_id:
            return jsonify({"error": "Book is already in Book Log list."}), 400

    new_entry = {
        "_id": str(ObjectId()),
        "bookId": book_id,
        "title": title,
        "cover": cover,
        "readDate": read_date,
        "rating": rating,
        "author": author,
    }

    result = book_logs_col.update_one(
        {"username": username},
        {"$push": {"bookLog": new_entry}},
    )

    if result.matched_count > 0:
        # Re-fetch updated book log
        updated_log = book_logs_col.find_one({"username": username})
        total_books = len(updated_log.get("bookLog", []))

        # Get the user's current achievements
        achievements = user.get("achievements", [])
        achievement_unlocked = False

        # Unlock at 5, 6, 7, and 8 books
        if total_books == 5 and "5_books" not in achievements:
            users_col.update_one(
                {"username": username}, {"$push": {"achievements": "5_books"}}
            )
            achievement_unlocked = "5_books"
        elif total_books == 6 and "6_books" not in achievements:
            users_col.update_one(
                {"username": username}, {"$push": {"achievements": "6_books"}}
            )
            achievement_unlocked = "6_books"
        elif total_books == 7 and "7_books" not in achievements:
            users_col.update_one(
                {"username": username}, {"$push": {"achievements": "7_books"}}
            )
            achievement_unlocked = "7_books"
        elif total_books == 8 and "8_books" not in achievements:
            users_col.update_one(
                {"username": username}, {"$push": {"achievements": "8_books"}}
            )
            achievement_unlocked = "8_books"

        update_user_section(username, "increment", "media")
        return jsonify(
            {"book": new_entry, "achievementUnlocked": achievement_unlocked}
        ), 200
    else:
        return jsonify({"error": "User not found or could not be updated."}), 400


# Route to get all logged books
@books_bp.route("/api/book/log", methods=["GET"])
def get_logged_books():
    username = request.args.get("username")  # Get username from query parameters
    users_col = current_app.config["collections"].get("users")
    if users_col is None:
        return jsonify({"error": "Database not connected"}), 500

    user = users_col.find_one({"username": username})
    if user is None:
        return jsonify({"error": "User not logged in!"}), 500

    book_logs_col = current_app.config["collections"].get("bookLogs")
    user_book_log_item = book_logs_col.find_one({"username": username})

    if user_book_log_item is None:
        info = {
            "username": username,
            "bookLog": [],
            "readLater": [],
        }
        insert = book_logs_schema.load(info)
        book_logs_col.insert_one(insert)

    book_log = user_book_log_item["bookLog"]
    for entry in book_log:
        entry["_id"] = str(entry["_id"])  # Serialize ObjectId to string

    return jsonify(book_log)


@books_bp.route("/api/book/remove_log", methods=["POST"])
def remove_book_log():
    data = request.get_json()
    username = data.get("username")
    entry = data.get("entry")  # This is the _id of the book to remove
    section = data.get("section")

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

    print(
        f"Attempting to remove from section: {section}, entry: {entry}, for user: {username}"
    )
    print(f"User book log found: {user_book_log_item}")

    # ✅ Convert `entry` to a string before removing
    result = book_logs_col.update_one(
        {"username": username},
        {
            "$pull": {section: {"_id": str(entry)}}
        },  # Ensure `_id` is treated as a string
    )

    if result.modified_count == 0:
        return jsonify({"error": "Book not found in log or removal failed"}), 404
    update_user_section(username, "decrement", "media")
    return jsonify({"success": True, "message": f"Book removed from {section}."}), 200


@books_bp.route("/api/trendingbooks", methods=["GET"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def trending_books():
    try:
        book = []
        response = requests.get(
            TRENDING_BOOKS_URL, params={"sort": "readinglog", "limit": 20}
        )
        response.raise_for_status()
        data = response.json()

        for item in data.get("works", []):
            book.append(
                {
                    "title": item.get("title", "Unknown Title"),
                    "id": item.get("key", "").replace(
                        "/works/", ""
                    ),  # Extract book ID for linking
                    "author": item.get("author_name", ["Unknown Author"])[0],
                    "release_date": item.get("first_publish_year"),
                    "cover_url": f"https://covers.openlibrary.org/b/id/{item.get('cover_i')}-L.jpg"
                    if "cover_i" in item
                    else None,
                }
            )
        return jsonify({"book": book})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@books_bp.route("/api/searchauthor", methods=["GET"])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def search_author():
    author = request.args.get("query", "")
    if not author:
        return jsonify({'error': 'Query parameter "author" is required'}), 400


    # Construct the full query to include subjects if they are provided
    full_query = author
    
    try:
        # Perform the search request to Open Library
        response = requests.get(OPEN_LIBRARY_SEARCH_URL, params={"author": full_query, "sort": "new"})
        response.raise_for_status()  # Raise error for bad responses
        data = response.json()

        authors = []
        for each in data.get("docs", []):
            for i, author in enumerate(each.get("author_key", [])):
                name = each.get("author_name", [])[i]
                if not any(author == a["id"] for a in authors) and full_query.lower() in name.lower():
                    authors.append({
                    "id": author, # Extracting book ID
                    "name": name,
                    "image_url": f"https://covers.openlibrary.org/a/olid/{author}-M.jpg" if author else "https://covers.openlibrary.org/b/id/10909258-M.jpg"  # Default cover if missing
                })

        return jsonify({"authors": authors})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500
    
@books_bp.route('/api/authors/<author_id>', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def person_details(author_id):
    try:
        # Fetch movie details from TMDB API
        url = f"https://openlibrary.org/authors/{author_id}.json"
        credits_url = f"https://openlibrary.org/search.json?author={author_id}"

        # Movie details
        response = requests.get(url)
        response.raise_for_status()
        item = response.json()

        # Movie credits
        books_response = requests.get(credits_url)
        books_response.raise_for_status()
        books = books_response.json()

        # Extract cast information (limit to top 20 for brevity)
        work = []
        totalCount = books.get("numFound")
        for member in books.get("docs", []):

            # Append member details to cast list
            work.append({
                "id": member.get("key", "").replace("/works/", ""),  # Extracting book ID
                "title": member.get("title", "Unknown Title"),
                "cover_url": f"https://covers.openlibrary.org/b/id/{member.get('cover_i', '10909258')}-M.jpg"
            })

        # Format the response data
        author_details = {
            "name": item.get("name"),
            "biography": item.get("bio"),
            "image_url": f"https://covers.openlibrary.org/a/olid/{author_id}-M.jpg" if author_id else "https://covers.openlibrary.org/b/id/10909258-M.jpg",  # Default cover if missing
            "num_books": totalCount,
            "work": work,
        }
        return jsonify(author_details)

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500