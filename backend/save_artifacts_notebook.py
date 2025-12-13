"""
Script to save preprocessing artifacts after training
Run this in your notebook after training the model
"""
import joblib
import json
import pandas as pd
import numpy as np

# Assuming you have these from your training:
# - X: the feature matrix after preprocessing
# - imputer: the fitted SimpleImputer
# - scaler: the fitted MinMaxScaler

# Save the column names that the model expects
if hasattr(X, 'columns'):
    feature_columns = X.columns.tolist()
else:
    # If X is a numpy array, you need to get columns before imputation
    print("Warning: X should be a DataFrame to save column names")
    feature_columns = None

# Save feature information
feature_info = {
    'n_features': len(feature_columns) if feature_columns else 239,
    'feature_columns': feature_columns
}

with open('feature_info.json', 'w') as f:
    json.dump(feature_info, f, indent=2)

# Save the fitted imputer and scaler
joblib.dump(imputer, 'fitted_imputer.pkl')
joblib.dump(scaler, 'fitted_scaler.pkl')

print(f"Saved preprocessing artifacts:")
print(f"  - Features: {feature_info['n_features']}")
print(f"  - Imputer: fitted_imputer.pkl")
print(f"  - Scaler: fitted_scaler.pkl")