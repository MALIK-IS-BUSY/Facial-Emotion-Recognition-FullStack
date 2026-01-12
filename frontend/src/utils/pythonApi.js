import axios from 'axios';

// Python API URL (Flask server)
// Default to localhost:8000, but can be overridden via environment variable
// const PYTHON_API_URL = process.env.REACT_APP_PYTHON_API_URL || 'http://localhost:8000';
const PYTHON_API_URL = 'https://fermodel.up.railway.app';

const pythonApi = axios.create({
  baseURL: PYTHON_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Reduced to 5 seconds for faster failure detection
});

/**
 * Convert canvas/video frame to base64
 * @param {HTMLCanvasElement} canvas - Canvas element to convert
 * @param {number} quality - JPEG quality (0-1), default 0.5 for faster processing
 */
export const frameToBase64 = (canvas, quality = 0.5) => {
  try {
    return canvas.toDataURL('image/jpeg', quality);
  } catch (error) {
    console.error('Error converting frame to base64:', error);
    return null;
  }
};

/**
 * Predict emotion from image frame
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} clientId - Client identifier for state management
 * @returns {Promise} Prediction result
 */
export const predictEmotion = async (imageBase64, clientId = 'default') => {
  try {
    const response = await pythonApi.post('/predict', {
      image: imageBase64,
      client_id: clientId,
    });
    return response.data;
  } catch (error) {
    console.error('Error predicting emotion:', error);
    // Return structured error response instead of throwing
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || !error.response) {
      return {
        success: false,
        error: 'Cannot connect to Python API. Please make sure the Flask server is running on port 8000.',
        emotion: null,
        confidence: 0
      };
    }
    // If API responded with error, return the error data
    return error.response?.data || {
      success: false,
      error: error.message || 'Error predicting emotion',
      emotion: null,
      confidence: 0
    };
  }
};

/**
 * Check if Python API is healthy
 */
export const checkPythonApiHealth = async () => {
  try {
    const response = await pythonApi.get('/health');
    return response.data;
  } catch (error) {
    console.error('Python API health check failed:', error);
    return null;
  }
};

/**
 * Reset client state in Python API
 */
export const resetClientState = async (clientId = 'default') => {
  try {
    await pythonApi.post('/reset', { client_id: clientId });
  } catch (error) {
    console.error('Error resetting client state:', error);
  }
};

export default pythonApi;

