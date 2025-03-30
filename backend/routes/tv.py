from operator import attrgetter
from flask import request, Blueprint, jsonify
from flask_cors import cross_origin
from bson.objectid import ObjectId
import requests
import os

tv_bp = Blueprint("tv", __name__)

TMDB_API_KEY = os.getenv("TMDB_API_KEY")

@tv_bp.route('/api/tv', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def search_tv():
    query = request.args.get('query', '')  # Get the search query from the frontend
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    results = []
    current_page = 1

    while True:
        response = requests.get(
            f'https://api.themoviedb.org/3/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page={current_page}&sort_by=popularity.desc',
            headers={
                'Accept': 'application/json',
                'Authorization': f'Bearer {TMDB_API_KEY}'
            }
        )
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch data from TMDB"}), 500

        data = response.json()
        filtered_results = [
            item for item in data['results']
            if query.lower() in item['name'].lower() and not any(e['name'] == item['name'] for e in results)
        ]
        
        results.extend(filtered_results)

        if current_page >= 30:  # Limit the pages to 30 (or as needed)
            break

        current_page += 1

    return jsonify(results)

@tv_bp.route('/api/trendingtv', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def trending_tv():
    allResults = []
    currentPage = 1
    while True:
      response = requests.get(
            f'https://api.themoviedb.org/3/trending/tv/day?language=en-US',
            headers={
                'Authorization': f'Bearer {TMDB_API_KEY}'
            }
        )
      if response.status_code != 200:
            return jsonify({"error": "Failed to fetch data from TMDB"}), 500
      
      #Concatenate the results to the existing results
      data = response.json()
      allResults.extend(data['results'])

      #f there's no more pages (or when a maximum number of pages is reached), break the loop
      if currentPage >= 30 or 'results' not in data:
        break
      
    allResults = sorted(allResults, key=attrgetter('popularity'))
    return jsonify(allResults)

@tv_bp.route('/api/tvkey', methods=['GET'])
@cross_origin(origin="http://localhost:3000", headers=["Content-Type"])
def get_tv_key():
    api_key = TMDB_API_KEY
    return jsonify(api_key)
    