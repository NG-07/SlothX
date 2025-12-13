"""
FastAPI application for Credit Risk Prediction
This API provides endpoints to predict credit risk based on applicant data.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import joblib
import numpy as np
import pandas as pd
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
import logging
from joblib import load

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for caching
model = None
train_columns = None
imputer = None
scaler = None

# Initialize FastAPI app
app = FastAPI(
    title="Credit Risk Prediction API",
    description="API for predicting credit risk based on applicant financial data",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained model and preprocessing artifacts
try:
    model = joblib.load('random_forest_model.pkl')
    logger.info("Model loaded successfully")
    
    # Try to load saved preprocessing artifacts
    try:
        import json
        with open('feature_info.json', 'r') as f:
            feature_info = json.load(f)
            train_columns = feature_info['feature_columns']
        
        imputer = joblib.load('fitted_imputer.pkl')
        scaler = joblib.load('fitted_scaler.pkl')
        logger.info(f"Loaded preprocessing artifacts: {len(train_columns)} features")
        
    except FileNotFoundError:
        logger.warning("Preprocessing artifacts not found. Will generate from training data...")
        # Load training data to get column structure (need full dataset for all categories)
        train_data = pd.read_csv('credit_risk_data/application_train.csv')
        logger.info(f"Training data loaded: {train_data.shape}")
        
        # Label encode binary columns (same as training)
        le = LabelEncoder()
        for col in train_data:
            if train_data[col].dtype == 'object':
                if len(list(train_data[col].unique())) <= 2:
                    try:
                        le.fit(train_data[col])
                        train_data[col] = le.transform(train_data[col])
                    except:
                        pass
        
        # One-hot encode
        train_data = pd.get_dummies(train_data)
        
        # Drop target and other columns (same as training)
        columns_to_drop = ['TARGET']
        for col in ['CODE_GENDER_XNA', 'NAME_INCOME_TYPE_Maternity leave', 'NAME_FAMILY_STATUS_Unknown']:
            if col in train_data.columns:
                columns_to_drop.append(col)
        
        train_columns = [col for col in train_data.columns if col not in columns_to_drop]
        logger.info(f"Generated column structure: {len(train_columns)} features")
        
        # Create fresh imputer and scaler (will be fitted on first use)
        imputer = SimpleImputer(strategy='median')
        scaler = MinMaxScaler(feature_range=(0, 1))
        
        # Clean up to free memory
        del train_data
        logger.info("Created new preprocessing pipelines")
    
except Exception as e:
    logger.error(f"Error during initialization: {e}")
    import traceback
    traceback.print_exc()
    model = None


class ApplicantData(BaseModel):
    """
    Input data model for credit risk prediction
    """
    # Personal Information
    code_gender: str = Field(..., description="Gender: M/F", example="M")
    flag_own_car: str = Field(..., description="Does applicant own a car: Y/N", example="N")
    flag_own_realty: str = Field(..., description="Does applicant own property: Y/N", example="Y")
    cnt_children: int = Field(0, ge=0, description="Number of children", example=0)
    
    # Financial Information
    amt_income_total: float = Field(..., gt=0, description="Total income", example=202500.0)
    amt_credit: float = Field(..., gt=0, description="Credit amount", example=406597.5)
    amt_annuity: Optional[float] = Field(None, description="Loan annuity", example=24700.5)
    amt_goods_price: Optional[float] = Field(None, description="Goods price", example=351000.0)
    
    # Employment Information
    name_income_type: str = Field(..., description="Income type", example="Working")
    name_education_type: str = Field(..., description="Education level", example="Secondary / secondary special")
    name_family_status: str = Field(..., description="Family status", example="Single / not married")
    occupation_type: Optional[str] = Field(None, description="Occupation", example="Laborers")
    
    # Contact Information
    days_birth: int = Field(..., lt=0, description="Age in days (negative number)", example=-9461)
    days_employed: int = Field(..., description="Days employed (negative if currently employed)", example=-637)
    
    # Additional flags (optional)
    flag_mobil: int = Field(1, ge=0, le=1, description="Mobile phone", example=1)
    flag_work_phone: int = Field(0, ge=0, le=1, description="Work phone", example=0)
    flag_phone: int = Field(0, ge=0, le=1, description="Phone", example=1)
    flag_email: int = Field(0, ge=0, le=1, description="Email", example=0)
    
    # External scores (optional)
    ext_source_1: Optional[float] = Field(None, ge=0, le=1, description="External score 1", example=0.083)
    ext_source_2: Optional[float] = Field(None, ge=0, le=1, description="External score 2", example=0.263)
    ext_source_3: Optional[float] = Field(None, ge=0, le=1, description="External score 3", example=0.139)
    
    # Housing
    name_housing_type: str = Field(..., description="Housing type", example="House / apartment")
    region_population_relative: Optional[float] = Field(None, description="Relative population of region", example=0.0188)
    
    # Contract type
    name_contract_type: str = Field("Cash loans", description="Contract type", example="Cash loans")
    
    # Organization
    organization_type: Optional[str] = Field(None, description="Organization type", example="Business Entity Type 3")


class PredictionResponse(BaseModel):
    """
    Response model for credit risk prediction
    """
    prediction: int = Field(..., description="0 = Low Risk, 1 = High Risk")
    probability: float = Field(..., description="Probability of default (0-1)")
    risk_level: str = Field(..., description="Risk classification: Low/Medium/High")
    message: str = Field(..., description="Human-readable interpretation")


class BulkPredictionRequest(BaseModel):
    """
    Model for bulk predictions
    """
    applicants: List[ApplicantData]


class HealthResponse(BaseModel):
    """
    Health check response
    """
    status: str
    model_loaded: bool


def preprocess_input(data: ApplicantData) -> np.ndarray:
    """
    Preprocess input data to match training data format
    This creates a full feature set matching the 239 features the model expects
    """
    global train_columns, imputer, scaler
    
    if train_columns is None:
        raise HTTPException(status_code=500, detail="Training columns not initialized")
    
    # Create input features dictionary with numerical values
    features = {
        'CODE_GENDER': 1 if data.code_gender == 'M' else 0,
        'FLAG_OWN_CAR': 1 if data.flag_own_car == 'Y' else 0,
        'FLAG_OWN_REALTY': 1 if data.flag_own_realty == 'Y' else 0,
        'CNT_CHILDREN': data.cnt_children,
        'AMT_INCOME_TOTAL': data.amt_income_total,
        'AMT_CREDIT': data.amt_credit,
        'AMT_ANNUITY': data.amt_annuity if data.amt_annuity else data.amt_credit / 12,
        'AMT_GOODS_PRICE': data.amt_goods_price if data.amt_goods_price else data.amt_credit * 0.9,
        'DAYS_BIRTH': data.days_birth,
        'DAYS_EMPLOYED': data.days_employed,
        'FLAG_MOBIL': data.flag_mobil,
        'FLAG_WORK_PHONE': data.flag_work_phone,
        'FLAG_PHONE': data.flag_phone,
        'FLAG_EMAIL': data.flag_email,
        'EXT_SOURCE_1': data.ext_source_1 if data.ext_source_1 is not None else np.nan,
        'EXT_SOURCE_2': data.ext_source_2 if data.ext_source_2 is not None else np.nan,
        'EXT_SOURCE_3': data.ext_source_3 if data.ext_source_3 is not None else np.nan,
        'REGION_POPULATION_RELATIVE': data.region_population_relative if data.region_population_relative else 0.02,
    }
    
    # Add one-hot encoded categorical columns
    categorical_mappings = {
        f'NAME_INCOME_TYPE_{data.name_income_type}': 1,
        f'NAME_EDUCATION_TYPE_{data.name_education_type}': 1,
        f'NAME_FAMILY_STATUS_{data.name_family_status}': 1,
        f'NAME_HOUSING_TYPE_{data.name_housing_type}': 1,
        f'NAME_CONTRACT_TYPE_{data.name_contract_type}': 1,
    }
    
    if data.occupation_type:
        categorical_mappings[f'OCCUPATION_TYPE_{data.occupation_type}'] = 1
    if data.organization_type:
        categorical_mappings[f'ORGANIZATION_TYPE_{data.organization_type}'] = 1
    
    # Merge dictionaries
    features.update(categorical_mappings)
    
    # Create a dataframe with all training columns, filled with 0
    full_df = pd.DataFrame(0, index=[0], columns=train_columns, dtype=float)
    
    # Fill in the values we have
    for col, val in features.items():
        if col in full_df.columns:
            full_df.at[0, col] = val
    
    # If imputer/scaler aren't fitted yet, fit them on the current data
    # (This is a fallback and won't be as good as using training-fitted ones)
    if not hasattr(imputer, 'statistics_'):
        imputer.fit(full_df)
    if not hasattr(scaler, 'scale_'):
        scaler.fit(full_df)
    
    # Impute missing values using fitted imputer
    full_df_imputed = imputer.transform(full_df)
    
    # Scale features using fitted scaler
    full_df_scaled = scaler.transform(full_df_imputed)
    
    return full_df_scaled


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API information
    """
    return {
        "message": "Credit Risk Prediction API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "predict": "/predict",
            "predict_bulk": "/predict/bulk",
            "docs": "/docs"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_credit_risk(data: ApplicantData):
    """
    Predict credit risk for a single applicant
    
    Returns:
    - prediction: 0 (low risk) or 1 (high risk)
    - probability: Probability of default
    - risk_level: Low/Medium/High risk classification
    - message: Human-readable interpretation
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Preprocess input
        processed_data = preprocess_input(data)
        
        # Make prediction
        prediction = model.predict(processed_data)[0]
        probability = model.predict_proba(processed_data)[0][1]  # Probability of class 1 (default)
        
        # Determine risk level
        if probability < 0.3:
            risk_level = "Low"
            message = "Applicant shows low credit risk. Loan approval recommended."
        elif probability < 0.6:
            risk_level = "Medium"
            message = "Applicant shows moderate credit risk. Additional verification recommended."
        else:
            risk_level = "High"
            message = "Applicant shows high credit risk. Loan approval not recommended."
        
        return {
            "prediction": int(prediction),
            "probability": float(probability),
            "risk_level": risk_level,
            "message": message
        }
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/predict/bulk", tags=["Prediction"])
async def predict_bulk(request: BulkPredictionRequest):
    """
    Predict credit risk for multiple applicants
    
    Returns a list of predictions for each applicant
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        results = []
        for applicant in request.applicants:
            result = await predict_credit_risk(applicant)
            results.append(result)
        
        return {
            "count": len(results),
            "predictions": results
        }
    
    except Exception as e:
        logger.error(f"Bulk prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Bulk prediction failed: {str(e)}")


@app.get("/model/info", tags=["Model"])
async def model_info():
    """
    Get information about the loaded model
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        model_type = type(model).__name__
        n_features = model.n_features_in_ if hasattr(model, 'n_features_in_') else "Unknown"
        
        info = {
            "model_type": model_type,
            "n_features": n_features,
            "classes": model.classes_.tolist() if hasattr(model, 'classes_') else None
        }
        
        if hasattr(model, 'n_estimators'):
            info["n_estimators"] = model.n_estimators
            
        return info
    
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)