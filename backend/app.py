from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.data import data_bp
from routes.users import users_bp
from routes.auth import auth_bp
from routes.tv import tv_bp
from routes.movie import movie_bp
from routes.books import books_bp
from routes.music import music_bp
from services.config import Config
from services.database import connect_db
from routes.lists import lists_bp
from routes.discover import discover_bp
from routes.reviews import reviews_bp
from routes.collage import collage_bp

app = Flask(__name__)
# ✅ Load configuration from config.py
app.config.from_object(Config)

# ✅ Ensure JWTManager is initialized
jwt = JWTManager(app)

# ✅ Enable CORS
cors = CORS(app, origins="http://localhost:3000", supports_credentials=True)
# app.config["CORS_HEADERS"] = "Content-Type"

# ✅ Connect to MongoDB
db = connect_db()

# ✅ Initialize collections in app config
if db is not None:
    app.config["collections"] = {
        "data": db.get_collection("data"),
        "users": db.get_collection("users"),
        "reviews": db.get_collection("reviews"),
        "movieLogs": db.get_collection("movieLogs"),
        "bookLogs": db["bookLogs"],
        "musicLogs": db.get_collection("musicLogs"),
        "tvLogs": db.get_collection("tvLogs"),
        "lists": db.get_collection("lists"),
        "collages": db.get_collection("collages") 
    }
else:
    app.config["collections"] = {}


# ✅ Register Blueprints
app.register_blueprint(data_bp)
app.register_blueprint(users_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(tv_bp)
app.register_blueprint(movie_bp)
app.register_blueprint(books_bp)
app.register_blueprint(music_bp)

app.register_blueprint(lists_bp) 
app.register_blueprint(reviews_bp)
app.register_blueprint(discover_bp)
app.register_blueprint(collage_bp)

@app.route("/api/test")
def test():
    response = {"message": "CORS test"}
    # print("CORS is applied with origins:", cors.origins)  # Debugging output
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
