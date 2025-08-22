from flask import Flask, request, jsonify
from utils.calculate_price import calculate
from flask_cors import CORS
from dotenv import load_dotenv
from utils.helper import fetch_codeforces_ratings, predict_reach_date
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
        "predicted_date": predicted_date.strftime("%Y-%m-%d"),
    })


@app.route('/predict_price', methods=['POST'])
def predict_price():
    data = request.get_json()
    print(data)
    benefits = data.get("benefits", {})
    score=0
    for feature, is_enabled in benefits.items():
        if is_enabled:
            score+=1
        else:
            score+=0
        print(f"{feature}: {is_enabled}")
    print(score)

    house_info={
                'area': data.get("area"),
                'bedrooms': data.get("bedrooms"),
                'bathrooms': data.get("bathrooms"),
                'stories': data.get("stories"),
                'parking': data.get("parking"),
                'amenities_score': score
            }
    print(house_info)
    pr=calculate(house_info)
    rounded = round(pr, 2)
    print(rounded)
    return jsonify({"price":rounded})


if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv("FLASK_PORT", "5000")))
