from flask import Blueprint

# Create a Blueprint instance for the routes
data_bp = Blueprint("data", __name__)

# Import routes to register them with the Blueprint
from . import data  # This ensures routes are registered when the package is imported