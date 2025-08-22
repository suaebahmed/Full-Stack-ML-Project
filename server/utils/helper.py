from sklearn.linear_model import LinearRegression
import numpy as np
import requests
import datetime


def fetch_codeforces_ratings(handle: str):
	"""Fetch rating timeline for a Codeforces handle.

	Returns:
		tuple[np.ndarray, np.ndarray] | None: (timestamps, ratings) arrays or None if not found.
	"""
	url = f"https://codeforces.com/api/user.rating?handle={handle}"
	response = requests.get(url)
	data = response.json()

	if data.get("status") != "OK":
		return None

	rating_changes = data.get("result", [])
	ratings = []
	timestamps = []

	for change in rating_changes:
		ratings.append(change["newRating"])
		timestamps.append(change["ratingUpdateTimeSeconds"])

	return np.array(timestamps), np.array(ratings)


def predict_reach_date(timestamps: np.ndarray, ratings: np.ndarray, target_rating: int) -> datetime.datetime:
	"""Predict the UTC datetime when target_rating might be reached using linear regression."""
	days = (timestamps - timestamps[0]) / (60 * 60 * 24)
	X = days.reshape(-1, 1)
	y = ratings

	model = LinearRegression()
	model.fit(X, y)

	target_day = (target_rating - model.intercept_) / model.coef_[0]
	predicted_timestamp = timestamps[0] + target_day * (60 * 60 * 24)

	return datetime.datetime.utcfromtimestamp(predicted_timestamp)
