from flask import Flask, request, jsonify
from utils.house_price_model import calculate
from flask_cors import CORS
from dotenv import load_dotenv
from utils.codeforces import fetch_codeforces_ratings, predict_reach_date
import os
load_dotenv()

app = Flask(__name__)
CORS(app)

"""Helper functions moved to utils.helper"""

@app.route('/')
def home():
    return f"Hello, Flask is running on port {os.getenv('FLASK_PORT', '5000')}!"

@app.route("/predict", methods=["GET"])
def predict():
    handle = request.args.get("handle")
    target_rating = int(request.args.get("target", 1600))

    if not handle:
        return jsonify({"error": "Missing handle"}), 400

    result = fetch_codeforces_ratings(handle)
    if not result:
        return jsonify({"error": "Invalid handle or no rating history"}), 404

    timestamps, ratings = result

    if len(ratings) < 2:
        return jsonify({"error": "Not enough contest data"}), 400

    predicted_date = predict_reach_date(timestamps, ratings, target_rating)

    return jsonify({
        "handle": handle,
        "current_rating": int(ratings[-1]),
        "target_rating": target_rating,
        "predicted_date": predicted_date.strftime("%B %Y"),
    })


@app.route('/ratings', methods=['GET'])
def ratings():
    handle = request.args.get('handle')
    if not handle:
        return jsonify({"error": "Missing handle"}), 400

    result = fetch_codeforces_ratings(handle)
    if not result:
        return jsonify({"error": "Invalid handle or no rating history"}), 404

    timestamps, ratings = result
    indices = list(range(1, len(ratings) + 1))

    return jsonify({
        "handle": handle,
        "indices": indices,
        "timestamps": [int(t) for t in timestamps.tolist()],
        "ratings": [int(r) for r in ratings.tolist()],
    })


@app.route('/predict_price', methods=['POST'])
def predict_price():
    data = request.get_json(silent=True) or {}

    required = ["area", "bedrooms", "bathrooms", "stories", "parking"]
    values = {k: float(data[k]) for k in required}

    benefits = data.get("benefits") or {}
    score = sum(1 for v in benefits.values() if bool(v))

    house_info = {**values, "amenities_score": float(score)}

    price = round(calculate(house_info), 2)
    return jsonify({"price": price})


if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv("FLASK_PORT", "5000")))
