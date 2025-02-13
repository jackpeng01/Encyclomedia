from flask import Flask
from flask_cors import CORS
from database import connect_db  # Import the database connection function
from routes.data import data_bp
from routes.users import users_bp
# from routes.reviews import reviews_bp

app = Flask(__name__)

# ✅ Enable CORS
CORS(
    app,
    resources={
        r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}
    },
    supports_credentials=True,
)
app.config["CORS_HEADERS"] = "Content-Type"

# ✅ Connect to MongoDB
db = connect_db()

# ✅ Initialize collections in app config
if db is not None:
    app.config["collections"] = {
        "data": db.get_collection("data"),
        "users": db.get_collection("users"),
        "reviews": db.get_collection("reviews"),
    }
else:
    app.config["collections"] = {}

# ✅ Register Blueprints
app.register_blueprint(data_bp)
app.register_blueprint(users_bp)
# app.register_blueprint(accounts_bp)
# app.register_blueprint(reviews_bp)

@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

@app.route("/")
def home():
    return (
        "<h1>Flask Backend Running</h1><p>Try accessing <a href='/api/data'>/api/data</a></p>",
        200,
    )


if __name__ == "__main__":
    print("\n🚀 Starting Flask Server on port 5000...\n")
    app.run(debug=True, port=5000)
