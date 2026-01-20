"""测试图片代理 - 诊断哪个 URL 有问题"""

import asyncio
import sys
from services.image_proxy import image_proxy
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# 测试 URL 列表（从最近的 API 响应中提取）
TEST_URLS = [
    # 在这里添加无法显示的图片 URL
    # 示例：
    # "https://example.com/image1.jpg",
    # "https://example.com/image2.jpg",
]


async def test_single_url(url: str):
    """测试单个 URL"""
    print(f"\n🔍 Testing: {url[:60]}...")
    result = await image_proxy.proxy_image(url, timeout=15, retry=3)
    if result:
        image_data, content_type = result
        print(f"✅ SUCCESS - Size: {len(image_data)} bytes, Type: {content_type}")
        return True
    else:
        print(f"❌ FAILED - Could not retrieve image")
        return False


async def main():
    """测试所有 URL"""
    if not TEST_URLS:
        print("❌ No test URLs configured in TEST_URLS")
        print("\n📋 Usage:")
        print("1. 在 test_image_proxy.py 的 TEST_URLS 中添加无法显示的图片 URL")
        print("2. 运行：python test_image_proxy.py")
        print("\n📝 Example:")
        print('TEST_URLS = [')
        print('    "https://example.com/image1.jpg",')
        print('    "https://example.com/image2.jpg",')
        print(']')
        return
    
    print(f"🧪 Testing {len(TEST_URLS)} images...\n")
    
    results = []
    for url in TEST_URLS:
        success = await test_single_url(url)
        results.append((url, success))
    
    # 摘要
    print("\n" + "="*60)
    print("📊 Test Summary:")
    print("="*60)
    
    success_count = sum(1 for _, success in results if success)
    print(f"✅ Success: {success_count}/{len(TEST_URLS)}")
    print(f"❌ Failed: {len(TEST_URLS) - success_count}/{len(TEST_URLS)}")
    
    if success_count < len(TEST_URLS):
        print("\n❌ Failed URLs:")
        for url, success in results:
            if not success:
                print(f"   - {url[:60]}...")
    
    print("\n💡 Tips:")
    print("   1. 检查 URL 是否仍然有效")
    print("   2. 尝试在浏览器中直接打开 URL")
    print("   3. 检查是否是反爬虫问题（HTTP 403/429）")
    print("   4. 某些图片服务器可能需要特定的 Referer 或 User-Agent")


if __name__ == "__main__":
    asyncio.run(main())
