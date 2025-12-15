import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health check
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get model info
export const getModelInfo = async () => {
  try {
    const response = await api.get('/model/info');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Make a single prediction
export const predictCreditRisk = async (applicantData) => {
  try {
    const response = await api.post('/predict', applicantData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Make bulk predictions
export const predictBulk = async (applicants) => {
  try {
    const response = await api.post('/predict/bulk', { applicants });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
