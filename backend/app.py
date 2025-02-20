from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import connect_db  # Import the database connection function
from routes.data import data_bp
from routes.users import users_bp
from routes.auth import auth_bp
from config import Config

# from routes.reviews import reviews_bp
from flask import send_from_directory


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
    }
else:
    app.config["collections"] = {}

# ✅ Register Blueprints
app.register_blueprint(data_bp)
app.register_blueprint(users_bp)
app.register_blueprint(auth_bp)
# app.register_blueprint(reviews_bp)

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
