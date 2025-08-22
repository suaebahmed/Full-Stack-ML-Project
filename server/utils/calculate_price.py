import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

def calculate(house_info):
    # Load data
    # base_dir = os.path.dirname(os.path.abspath(__file__))
    # csv_path = os.path.join(base_dir, '..', 'Housing.csv') 
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(base_dir, 'Housing.csv')
    data = pd.read_csv(csv_path)
    # data = pd.read_csv('./Housing.csv')

    # Strip whitespace from column names
    data.columns = data.columns.str.strip()

    # Convert 'price' column to numeric, coercing errors to NaN
    data['price'] = pd.to_numeric(data['price'], errors='coerce')

    # Fill missing numeric values safely (avoid inplace on chained assignments)
    data['bathrooms'] = data['bathrooms'].fillna(data['bathrooms'].mean())
    data['price'] = data['price'].fillna(data['price'].mean())

    # Fill missing categorical values with the mode (most frequent value)
    for col in ['guestroom', 'airconditioning', 'furnishingstatus']:
        data[col] = data[col].fillna(data[col].mode()[0])

    # Create a new feature: price per sqft
    data['price_per_sqft'] = data['price'] / data['area']

    # Convert 'yes'/'no' to 1/0 in amenity columns
    amenity_cols = ['mainroad', 'guestroom', 'basement', 'hotwaterheating', 'airconditioning']
    for col in amenity_cols:
        data[col] = data[col].astype(str).map({'yes': 1, 'no': 0})

    # Create an amenities score
    data['amenities_score'] = data[amenity_cols].sum(axis=1)

    # Optional: Preview data
    # print(data[['price_per_sqft', 'amenities_score']].head())

    # Model Building (Linear Regression)
    X = data[['area', 'bedrooms', 'bathrooms', 'stories', 'parking', 'amenities_score']]
    y = data['price']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    # print(y_train)
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Model Evaluation
    y_pred = model.predict(X_test)
    print('R² score:', r2_score(y_test, y_pred))
    print('Mean Squared Error:', mean_squared_error(y_test, y_pred))

    input_data = pd.DataFrame([house_info])

    predicted_price = model.predict(input_data)
    # print(f"Predicted house price: {predicted_price[0]}")
    return predicted_price[0]
# house={
#     'area': 1200,
#     'bedrooms': 4,
#     'bathrooms': 2,
#     'stories': 2,
#     'parking': 1,
#     'amenities_score': 75
# }
# calculate(house)