from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Dict, Iterable, Tuple

import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


# Features expected from the caller (client/backend route)
FEATURES: Tuple[str, ...] = (
    "area",
    "bedrooms",
    "bathrooms",
    "stories",
    "parking",
    "amenities_score",
)


def _dataset_path() -> Path:
    """Return absolute path to Housing.csv located next to this module."""
    here = Path(__file__).resolve().parent
    csv_path = here / "Housing.csv"
    if not csv_path.is_file():
        raise FileNotFoundError(f"Housing.csv not found at {csv_path}")
    return csv_path


def _load_and_clean_data() -> pd.DataFrame:
    """Load and minimally clean the housing dataset.

    - Strips column whitespace
    - Ensures numeric 'price'
    - Fills missing values for selected columns
    - Encodes yes/no amenities to 1/0 and adds 'amenities_score'
    """
    df = pd.read_csv(_dataset_path())
    df.columns = df.columns.str.strip()

    df["price"] = pd.to_numeric(df["price"], errors="coerce")
    df["bathrooms"] = df["bathrooms"].fillna(df["bathrooms"].mean())
    df["price"] = df["price"].fillna(df["price"].mean())

    for col in ["guestroom", "airconditioning", "furnishingstatus"]:
        df[col] = df[col].fillna(df[col].mode()[0])

    amenity_cols = [
        "mainroad",
        "guestroom",
        "basement",
        "hotwaterheating",
        "airconditioning",
    ]
    for col in amenity_cols:
        df[col] = df[col].astype(str).str.lower().map({"yes": 1, "no": 0})

    df["amenities_score"] = df[amenity_cols].sum(axis=1)
    return df


@lru_cache(maxsize=1)
def _get_model() -> Tuple[LinearRegression, float, float]:
    """Train the LinearRegression model once and cache it.

    Returns a tuple: (model, r2, mse)
    """
    df = _load_and_clean_data()
    X = df.loc[:, list(FEATURES)]
    y = df["price"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    model = LinearRegression()
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = float(r2_score(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    return model, r2, mse


def calculate(house_info: Dict[str, float]) -> float:
    """Predict a house price using a trained linear model.

    Expects house_info to include the numeric keys in FEATURES.
    Returns the predicted price as a float.
    """
    model, _, _ = _get_model()

    missing: Iterable[str] = [k for k in FEATURES if k not in house_info]
    if missing:
        raise ValueError(f"Missing required features: {', '.join(missing)}")

    input_df = pd.DataFrame([{k: house_info[k] for k in FEATURES}])
    pred = model.predict(input_df)
    return float(pred[0])
