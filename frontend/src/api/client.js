import axios from 'axios';

// Get API base URL from env or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
});

/**
 * 1. 快速分析文本 (Phase 1)
 * @param {File} imageFile 
 * @param {string} targetLanguage (Optional)
 * @param {string} sourceCurrency (Optional)
 * @returns {Promise}
 */
export const analyzeMenuText = async (imageFile, targetLanguage = 'English', sourceCurrency = null) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('target_language', targetLanguage);
  if (sourceCurrency) {
    formData.append('source_currency', sourceCurrency);
  }
  
  return client.post('/api/analyze-text-only', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 2. 搜索图片 (Phase 2)
 * @param {Object} dish 
 * @returns {Promise}
 */
export const searchDishImage = async (dish) => {
  return client.post('/api/search-dish-image', dish);
};

// Original full analyze (Legacy)
export const analyzeMenu = async (imageFile, targetLanguage = 'English', sourceCurrency = null) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('target_language', targetLanguage);
  if (sourceCurrency) {
    formData.append('source_currency', sourceCurrency);
  }
  
  return client.post('/api/analyze-menu', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 3. AI Chat Assistant
 * @param {string} message - User query
 * @param {Array} dishes - Current menu context
 * @param {Array} history - Chat history
 */
export const sendChatMessage = async (message, dishes, history = []) => {
  return client.post('/api/menu-chat', {
    message,
    dishes,
    history
  });
};

export default client;
