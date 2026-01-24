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
 * @returns {Promise}
 */
export const analyzeMenuText = async (imageFile, targetLanguage = 'English') => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('target_language', targetLanguage);
  
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
export const analyzeMenu = async (imageFile, targetLanguage = 'English') => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('target_language', targetLanguage);
  
  return client.post('/api/analyze-menu', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default client;
