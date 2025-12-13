"""
Test script for Credit Risk Prediction API
Run this after starting the FastAPI server
"""

import requests
import json

# API base URL
BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n" + "="*50)
    print("Testing Health Endpoint")
    print("="*50)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200

def test_single_prediction():
    """Test single prediction endpoint"""
    print("\n" + "="*50)
    print("Testing Single Prediction")
    print("="*50)
    
    # Sample applicant data
    applicant_data = {
        "code_gender": "M",
        "flag_own_car": "N",
        "flag_own_realty": "Y",
        "cnt_children": 0,
        "amt_income_total": 202500.0,
        "amt_credit": 406597.5,
        "amt_annuity": 24700.5,
        "amt_goods_price": 351000.0,
        "name_income_type": "Working",
        "name_education_type": "Secondary / secondary special",
        "name_family_status": "Single / not married",
        "occupation_type": "Laborers",
        "days_birth": -9461,
        "days_employed": -637,
        "flag_mobil": 1,
        "flag_work_phone": 0,
        "flag_phone": 1,
        "flag_email": 0,
        "ext_source_1": 0.083,
        "ext_source_2": 0.263,
        "ext_source_3": 0.139,
        "name_housing_type": "House / apartment",
        "region_population_relative": 0.0188,
        "name_contract_type": "Cash loans",
        "organization_type": "Business Entity Type 3"
    }
    
    print("Applicant Data:")
    print(json.dumps(applicant_data, indent=2))
    
    response = requests.post(f"{BASE_URL}/predict", json=applicant_data)
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\nPrediction Results:")
        print(f"  Prediction: {result['prediction']} ({'High Risk' if result['prediction'] == 1 else 'Low Risk'})")
        print(f"  Probability: {result['probability']:.2%}")
        print(f"  Risk Level: {result['risk_level']}")
        print(f"  Message: {result['message']}")
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_minimal_data():
    """Test with minimal required fields"""
    print("\n" + "="*50)
    print("Testing with Minimal Data")
    print("="*50)
    
    minimal_data = {
        "code_gender": "F",
        "flag_own_car": "Y",
        "flag_own_realty": "N",
        "amt_income_total": 150000.0,
        "amt_credit": 250000.0,
        "name_income_type": "Working",
        "name_education_type": "Higher education",
        "name_family_status": "Married",
        "days_birth": -12000,
        "days_employed": -2000,
        "name_housing_type": "House / apartment"
    }
    
    print("Minimal Applicant Data:")
    print(json.dumps(minimal_data, indent=2))
    
    response = requests.post(f"{BASE_URL}/predict", json=minimal_data)
    print(f"\nStatus Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\nPrediction Results:")
        print(f"  Risk Level: {result['risk_level']}")
        print(f"  Probability: {result['probability']:.2%}")
        print(f"  Message: {result['message']}")
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_model_info():
    """Test model info endpoint"""
    print("\n" + "="*50)
    print("Testing Model Info Endpoint")
    print("="*50)
    
    response = requests.get(f"{BASE_URL}/model/info")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print(f"Model Info: {json.dumps(response.json(), indent=2)}")
        return True
    else:
        print(f"Error: {response.text}")
        return False

def test_bulk_prediction():
    """Test bulk prediction endpoint"""
    print("\n" + "="*50)
    print("Testing Bulk Prediction")
    print("="*50)
    
    bulk_data = {
        "applicants": [
            {
                "code_gender": "M",
                "flag_own_car": "Y",
                "flag_own_realty": "Y",
                "amt_income_total": 300000.0,
                "amt_credit": 500000.0,
                "name_income_type": "Working",
                "name_education_type": "Higher education",
                "name_family_status": "Married",
                "days_birth": -15000,
                "days_employed": -3000,
                "name_housing_type": "House / apartment"
            },
            {
                "code_gender": "F",
                "flag_own_car": "N",
                "flag_own_realty": "N",
                "amt_income_total": 80000.0,
                "amt_credit": 150000.0,
                "name_income_type": "Working",
                "name_education_type": "Secondary / secondary special",
                "name_family_status": "Single / not married",
                "days_birth": -8000,
                "days_employed": -500,
                "name_housing_type": "Rented apartment"
            }
        ]
    }
    
    print(f"Testing with {len(bulk_data['applicants'])} applicants")
    
    response = requests.post(f"{BASE_URL}/predict/bulk", json=bulk_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\nBulk Prediction Results:")
        print(f"  Total predictions: {result['count']}")
        for i, pred in enumerate(result['predictions'], 1):
            print(f"\n  Applicant {i}:")
            print(f"    Risk Level: {pred['risk_level']}")
            print(f"    Probability: {pred['probability']:.2%}")
        return True
    else:
        print(f"Error: {response.text}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("CREDIT RISK PREDICTION API - TEST SUITE")
    print("="*60)
    print(f"Testing API at: {BASE_URL}")
    print("Make sure the FastAPI server is running!")
    
    tests = [
        ("Health Check", test_health),
        ("Single Prediction", test_single_prediction),
        ("Minimal Data", test_minimal_data),
        ("Model Info", test_model_info),
        ("Bulk Prediction", test_bulk_prediction)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            success = test_func()
            results.append((test_name, success))
        except requests.exceptions.ConnectionError:
            print(f"\n❌ Connection Error: Could not connect to {BASE_URL}")
            print("Make sure the API server is running: python app.py")
            return
        except Exception as e:
            print(f"\n❌ Error in {test_name}: {e}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    for test_name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")
    print("="*60)

if __name__ == "__main__":
    run_all_tests()