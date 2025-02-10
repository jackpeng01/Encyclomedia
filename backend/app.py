from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient, errors
from config import Config
from routes.data import data_bp, init_db

app = Flask(__name__)

# ✅ Enable CORS
CORS(
    app,
    resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}},
    supports_credentials=True
)

app.config["CORS_HEADERS"] = "Content-Type"

# ✅ MongoDB Connection
print("\n🔄 Attempting to connect to MongoDB...")

try:
    mongoClient = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)  # 5s timeout
    db = mongoClient.get_database("encyclomediaDB")
    test_col = db.get_collection("test")

    # Verify Connection
    mongoClient.admin.command("ping")
    print("✅ Successfully connected to MongoDB!\n")

except errors.ServerSelectionTimeoutError as e:
    print("❌ ERROR: Could not connect to MongoDB")
    print(f"🛑 {e}\n")
    mongoClient = None  # Prevent using an invalid connection
    test_col = None

# Initialize routes with database connection
init_db(mongoClient, test_col)
app.register_blueprint(data_bp)

@app.route("/")
def home():
    return "<h1>Flask Backend Running</h1><p>Try accessing <a href='/api/data'>/api/data</a></p>", 200

if __name__ == "__main__":
    print("\n🚀 Starting Flask Server on port 5000...\n")
    app.run(debug=True, port=5000)