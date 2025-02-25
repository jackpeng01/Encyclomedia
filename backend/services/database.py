from pymongo import MongoClient, errors
from services.config import Config

def connect_db():
    """Connect to MongoDB"""
    print("\n🔄 Attempting to connect to MongoDB...")

    try:
        mongo_client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
        db = mongo_client.get_database('encyclomediaDB')
        print("✅ Successfully connected to MongoDB!\n")
        return db
    except errors.ServerSelectionTimeoutError as e:
        print("❌ ERROR: Could not connect to MongoDB")
        print(f"🛑 {e}\n")
        return None