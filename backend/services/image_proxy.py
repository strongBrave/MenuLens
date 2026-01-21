"""图片代理服务 - 解决 CORS 和反爬虫问题"""

import aiohttp
import asyncio
import logging
from typing import Optional, Tuple, List
import base64

logger = logging.getLogger(__name__)

# 多个 User-Agent 列表，用于轮换（某些服务器会阻止特定的 UA）
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Mobile/15E148 Safari/604.1",
]

REFERERS = [
    "https://www.google.com/",
    "https://images.google.com/",
    "https://www.bing.com/",
    "https://www.baidu.com/",
]

# CDN 代理列表（当直接获取失败时尝试）
CDN_PROXIES = [
    "https://images.weserv.nl/?url=",
]


class ImageProxy:
    """图片代理 - 通过后端获取图片，绕过前端 CORS 限制"""
    
    def __init__(self):
        self.ua_index = 0
        self.referer_index = 0
    
    def _get_next_user_agent(self) -> str:
        """轮换使用不同的 User-Agent"""
        ua = USER_AGENTS[self.ua_index % len(USER_AGENTS)]
        self.ua_index += 1
        return ua
    
    def _get_next_referer(self) -> str:
        """轮换使用不同的 Referer"""
        referer = REFERERS[self.referer_index % len(REFERERS)]
        self.referer_index += 1
        return referer
    
    async def proxy_image(self, image_url: str, timeout: int = 10, retry: int = 3) -> Optional[Tuple[bytes, str]]:
        """
        通过后端获取图片，返回二进制内容和 Content-Type
        
        具备重试机制和多 User-Agent 支持
        
        Args:
            image_url: 原始图片 URL
            timeout: 超时时间（秒）
            retry: 重试次数
            
        Returns:
            (图片二进制内容, Content-Type) 或 None（如果失败）
        """
        if not image_url:
            logger.warning("Empty image URL provided")
            return None
        
        last_error = None
        
        # 重试机制
        for attempt in range(retry):
            try:
                headers = {
                    "User-Agent": self._get_next_user_agent(),
                    "Referer": self._get_next_referer(),
                    "Accept": "image/*,*/*;q=0.8",
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
                    "Accept-Encoding": "gzip, deflate",
                    "DNT": "1",
                    "Connection": "keep-alive",
                    "Upgrade-Insecure-Requests": "1",
                }
                
                timeout_obj = aiohttp.ClientTimeout(total=timeout)
                async with aiohttp.ClientSession() as session:
                    async with session.get(
                        image_url,
                        headers=headers,
                        timeout=timeout_obj,
                        allow_redirects=True,
                        ssl=False,  # 某些图片服务器的 SSL 证书可能有问题
                    ) as resp:
                        if resp.status == 200:
                            content_type = resp.headers.get('content-type', 'image/jpeg')
                            image_data = await resp.read()
                            
                            if image_data:
                                logger.info(f"✅ Proxied image (attempt {attempt+1}): {len(image_data)} bytes, {content_type}")
                                return (image_data, content_type)
                        
                        elif resp.status == 429:
                            last_error = f"Rate limited (HTTP {resp.status})"
                            if attempt < retry - 1:
                                # 被限流，等待后重试
                                await asyncio.sleep(1 * (attempt + 1))
                                continue
                        
                        last_error = f"HTTP {resp.status}"
                        logger.debug(f"❌ Failed to proxy image (HTTP {resp.status}): {image_url[:50]}... (attempt {attempt+1}/{retry})")
            
            except asyncio.TimeoutError:
                last_error = "Timeout"
                logger.debug(f"⏱️ Proxy timeout on attempt {attempt+1}/{retry}: {image_url[:50]}...")
                if attempt < retry - 1:
                    await asyncio.sleep(0.5 * (attempt + 1))
                    continue
            
            except Exception as e:
                last_error = f"{type(e).__name__}: {str(e)[:30]}"
                logger.debug(f"⚠️ Proxy error on attempt {attempt+1}/{retry}: {last_error}")
                if attempt < retry - 1:
                    await asyncio.sleep(0.5 * (attempt + 1))
                    continue
        
        # 如果重试多次都失败，尝试使用 CDN
        logger.warning(f"⚠️ Direct proxy failed after {retry} attempts, trying CDN fallback: {image_url[:50]}...")
        
        for cdn_base in CDN_PROXIES:
            try:
                # 移除 http:// 或 https:// 前缀，因为 weserv 有时处理不好双重协议头，或者直接拼接
                # weserv 文档建议：?url=example.com/image.jpg (without protocol) OR ?url=https://...
                # 这里直接拼接通常没问题: https://images.weserv.nl/?url=https://example.com/image.jpg
                cdn_url = f"{cdn_base}{image_url}"
                
                logger.info(f"🔄 Trying CDN fallback: {cdn_url[:60]}...")
                
                timeout_obj = aiohttp.ClientTimeout(total=timeout)
                async with aiohttp.ClientSession() as session:
                    async with session.get(cdn_url, timeout=timeout_obj) as resp:
                        if resp.status == 200:
                            content_type = resp.headers.get('content-type', 'image/jpeg')
                            image_data = await resp.read()
                            
                            if image_data:
                                logger.info(f"✅ CDN Proxy success: {len(image_data)} bytes via {cdn_base}")
                                return (image_data, content_type)
            except Exception as e:
                logger.debug(f"⚠️ CDN fallback failed ({cdn_base}): {str(e)}")
                continue

        logger.warning(f"❌ All proxy attempts (Direct + CDN) failed: {last_error} - {image_url[:50]}...")
        return None
    
    @staticmethod
    def encode_url_as_base64(url: str) -> str:
        """将 URL 编码为 Base64（用于 API 参数）"""
        return base64.urlsafe_b64encode(url.encode()).decode().rstrip('=')
    
    @staticmethod
    def decode_url_from_base64(encoded: str) -> str:
        """从 Base64 解码 URL"""
        # 补充填充字符
        padding = 4 - len(encoded) % 4
        if padding != 4:
            encoded += '=' * padding
        return base64.urlsafe_b64decode(encoded).decode()


# 全局实例
image_proxy = ImageProxy()
