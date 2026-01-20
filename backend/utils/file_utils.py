import base64
from PIL import Image
import io
from config import settings


def encode_image_to_base64(image_bytes: bytes) -> str:
    """将图片字节转换为 Base64"""
    return base64.b64encode(image_bytes).decode("utf-8")


def validate_image(image_bytes: bytes, max_size_mb: int = None) -> tuple[bool, str]:
    """
    验证图片有效性
    
    Returns:
        (是否有效, 错误信息)
    """
    if max_size_mb is None:
        max_size_mb = settings.MAX_FILE_SIZE_MB
    
    # 检查文件大小
    if len(image_bytes) > max_size_mb * 1024 * 1024:
        return False, f"File size exceeds {max_size_mb}MB"
    
    # 检查图片格式
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.verify()
        return True, ""
    except Exception as e:
        return False, f"Invalid or corrupted image file: {str(e)}"
