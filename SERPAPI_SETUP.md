## 搜索 API 切换说明

### 配置 SerpAPI

1. **获取 API Key**：访问 [SerpAPI 官网](https://serpapi.com) 注册账户并获取 API Key

2. **更新 .env 文件**：
```dotenv
# 启用 SerpAPI
SEARCH_PROVIDER="serpapi"
SERPAPI_KEY="YOUR_ACTUAL_API_KEY_HERE"
SERPAPI_ENGINE="google"  # 或 "bing", "baidu" 等
```

3. **SerpAPI 优势**：
   - ✅ 自动绕过反爬虫机制
   - ✅ 返回高质量真实图片链接
   - ✅ 支持全球主要搜索引擎
   - ✅ 更稳定的链接（不易失效）
   - ✅ 更好的图片识别

### 回退到 Google Custom Search

如需使用旧的 Google Custom Search：

```dotenv
SEARCH_PROVIDER="google"
SEARCH_API_KEY="YOUR_GOOGLE_SEARCH_KEY"
SEARCH_ENGINE_ID="YOUR_SEARCH_ENGINE_ID"
```

### API 响应对比

**SerpAPI**：
```json
{
  "images_results": [
    {
      "position": 1,
      "thumbnail": "...",
      "original": "https://example.com/real-image.jpg",
      "title": "..."
    }
  ]
}
```

**Google Custom Search**：
```json
{
  "items": [
    {
      "link": "https://example.com/image.jpg",
      "title": "..."
    }
  ]
}
```

### 成本对比

- **SerpAPI**：$5/1000 次查询（图片搜索免费额度）
- **Google Custom Search**：$5/1000 次查询（需付费版）

### 故障排查

```
ERROR: SerpAPI: Invalid API key
→ 检查 SERPAPI_KEY 是否正确

WARNING: SerpAPI: Rate limit exceeded
→ 减少并发请求或升级 SerpAPI 计划

ERROR: SerpAPI timeout
→ 增加 SEARCH_TIMEOUT 配置值
```

### 性能优化建议

```env
# 搜索超时（秒）
SEARCH_TIMEOUT=15

# 并发数
MAX_CONCURRENT_SEARCHES=5

# 候选结果数（SerpAPI 返回更好质量，可用更少数量）
SEARCH_CANDIDATE_RESULTS=3
```
