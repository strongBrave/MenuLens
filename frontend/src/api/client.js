import axios from 'axios';

// Get API base URL from env or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 6000000, // 6000 seconds
});

// Get API settings from localStorage
function getApiSettings() {
  try {
    const savedApiSettings = localStorage.getItem('menulens_api_settings');
    if (savedApiSettings) {
      return JSON.parse(savedApiSettings);
    }

    // Backward compatibility for old key
    const legacySettings = localStorage.getItem('menulens_model_settings');
    if (legacySettings) {
      return JSON.parse(legacySettings);
    }
  } catch (e) {
    console.error('Failed to get API settings:', e);
  }
  return {};
}

function appendIfPresent(formData, key, value) {
  if (value === undefined || value === null) return;
  const normalized = typeof value === 'string' ? value.trim() : value;
  if (normalized === '') return;
  formData.append(key, String(normalized));
}

function normalizeOptionalString(value) {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized === '' ? undefined : normalized;
}

function normalizeOptionalInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function normalizeOptionalFloat(value) {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function normalizeOptionalBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return undefined;
}

function getRuntimeSettings() {
  const settings = getApiSettings();
  return {
    llm_api_key: normalizeOptionalString(settings.llmApiKey),
    llm_base_url: normalizeOptionalString(settings.llmBaseUrl),
    llm_model: normalizeOptionalString(settings.llmModel),
    llm_temperature: normalizeOptionalFloat(settings.llmTemperature),
    llm_timeout: normalizeOptionalInt(settings.llmTimeout),
    serpapi_key: normalizeOptionalString(settings.serpApiKey),
    search_candidate_results: normalizeOptionalInt(settings.searchCandidateResults),
    generation_api_key: normalizeOptionalString(settings.imageApiKey),
    generation_model: normalizeOptionalString(settings.imageModel),
    enable_image_generation: normalizeOptionalBoolean(settings.imageEnabled),
    enable_rag_pipeline: normalizeOptionalBoolean(settings.enableRagPipeline),
    image_verify_threshold: normalizeOptionalFloat(settings.imageVerifyThreshold),
  };
}

function appendRuntimeSettings(formData) {
  const runtimeSettings = getRuntimeSettings();
  Object.entries(runtimeSettings).forEach(([key, value]) => {
    appendIfPresent(formData, key, value);
  });
}

function getSearchRuntimeSettings() {
  return getRuntimeSettings();
}

function getChatRuntimeSettings() {
  const runtimeSettings = getRuntimeSettings();
  return {
    llm_api_key: runtimeSettings.llm_api_key,
    llm_base_url: runtimeSettings.llm_base_url,
    llm_model: runtimeSettings.llm_model,
    llm_temperature: runtimeSettings.llm_temperature,
    llm_timeout: runtimeSettings.llm_timeout,
  };
}

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
  
  appendRuntimeSettings(formData);
  
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
  return client.post('/api/search-dish-image', {
    dish,
    ...getSearchRuntimeSettings(),
  });
};

// Original full analyze (Legacy)
export const analyzeMenu = async (imageFile, targetLanguage = 'English', sourceCurrency = null) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('target_language', targetLanguage);
  if (sourceCurrency) {
    formData.append('source_currency', sourceCurrency);
  }

  appendRuntimeSettings(formData);
  
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
    history,
    ...getChatRuntimeSettings(),
  });
};

export default client;
