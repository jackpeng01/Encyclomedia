from pymongo import MongoClient
from bson import ObjectId
from services.database import connect_db

# Establish MongoDB connection
db = connect_db()
users_collection = db["users"]  # Replace with your users collection name

def update_user_section(username, input_type, section):
    """
    Updates a section in the user document by incrementing or decrementing its value.

    Args:
        user_id (str): The ID of the user to update.
        input_type (str): "increment" or "decrement".
        section (str): The section to update ("lists", "reviews", "media").

    Returns:
        dict: The updated user document or an error message.
    """
    if section not in ["lists", "reviews", "media"]:
        return {"error": "Invalid section. Must be 'lists', 'reviews', or 'media'."}

    if input_type not in ["increment", "decrement"]:
        return {"error": "Invalid input type. Must be 'increment' or 'decrement'."}

    try:
        # Determine the update operation
        update_value = 1 if input_type == "increment" else -1

        # Perform the update
        result = users_collection.update_one(
            {"username": username},  # Match the user by ID
            {"$inc": {section: update_value}}  # Increment or decrement the section
        )

        if result.matched_count == 0:
            return {"error": "User not found."}

        # Retrieve and return the updated user document
        updated_user = users_collection.find_one({"username": username})
        return {"success": True, "updated_user": updated_user}

    except Exception as e:
        return {"error": str(e)}

# Example usage
if __name__ == "__main__":
    user_id = "644b102ecf1a4b6f9a8e5bdf"  # Replace with a valid user ID
    section = "lists"
    input_type = "increment"

    result = update_user_section(user_id, input_type, section)
    print(result)
