# Add this cell to your notebook after training the model to save preprocessing artifacts

import joblib
import json

# Save the feature columns that the model was trained on
# This should be done right after creating X but before train/test split
feature_columns = X.columns.tolist() if hasattr(X, 'columns') else None

# Save preprocessing artifacts
preprocessing_artifacts = {
    'feature_columns': feature_columns,
    'n_features': X.shape[1] if hasattr(X, 'shape') else 239,
    'dropped_columns': ['TARGET', 'CODE_GENDER_XNA', 'NAME_INCOME_TYPE_Maternity leave', 'NAME_FAMILY_STATUS_Unknown']
}

# Save to file
with open('preprocessing_config.json', 'w') as f:
    json.dump(preprocessing_artifacts, f, indent=2)

# Also save the imputer and scaler if they were fitted
joblib.dump(imputer, 'imputer.pkl')
joblib.dump(scaler, 'scaler.pkl')

print("Preprocessing artifacts saved successfully!")
print(f"Number of features: {preprocessing_artifacts['n_features']}")