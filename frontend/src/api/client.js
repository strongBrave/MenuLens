import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 120000,  // 增加到 120 秒用于 RAG Pipeline 处理
});

/**
 * 分析菜单图片
 * @param {File} imageFile - 图片文件
 * @returns {Promise} API 响应
 */
export async function analyzeMenu(imageFile) {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  return apiClient.post('/api/analyze-menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,  // 明确指定请求超时
  });
}

export default apiClient;
