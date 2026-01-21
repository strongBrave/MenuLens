import React, { useState, useRef, useEffect } from 'react';

export default function DishImage({ url, urls = [], alt, className }) {
  // 合并所有可用 URL：优先用 urls 列表，如果没有则用 url
  const allUrls = urls && urls.length > 0 ? urls : (url ? [url] : []);
  
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);

  const currentUrl = allUrls[currentUrlIndex];

  // 当 urls 或 url 属性本身改变时（比如父组件切图了），重置状态
  // 注意：如果 urls 列表内容变了，也要重置
  useEffect(() => {
    // 只有当传入的 url（作为主显图）不等于当前正在尝试的 URL 时，才重置
    // 这允许外部控制（比如点击切换）生效，但也允许内部自动跳过生效
    // 为了简化：每当外部 props 变了，我们重置到第一个
    setCurrentUrlIndex(0);
    setImageLoading(true);
    setImageError(false);
  }, [url, urls]); // 依赖项简化，实际可能需要更深比较，但对新对象通常足够

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    const img = imgRef.current;
    
    // 1. 尝试代理（如果是第一次失败且没有用过代理）
    if (img && currentUrl && !img.src.includes('/api/proxy-image')) {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(currentUrl)}`;
      img.src = proxyUrl;
      // 这里的 onerror 会在代理也失败时触发
      return; 
    }

    // 2. 代理也失败了（或者已经是代理链接了），尝试下一张图
    if (currentUrlIndex < allUrls.length - 1) {
      console.log(`Image failed: ${currentUrl}, trying next...`);
      setCurrentUrlIndex(prev => prev + 1);
      setImageLoading(true);
      // setImageError 保持 false，因为我们还在尝试
    } else {
      // 3. 所有图都试过了，彻底失败
      console.warn(`All images failed for ${alt}`);
      setImageError(true);
      setImageLoading(false);
    }
  };

  const hasImage = currentUrl && !imageError;

  return (
    <div className={`relative bg-gray-200 overflow-hidden ${className}`}>
      {hasImage ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse flex items-center justify-center z-10">
              <span className="text-gray-600 font-semibold text-sm">Loading...</span>
            </div>
          )}
          <img
            ref={imgRef}
            src={url}
            alt={alt}
            className="w-full h-full object-cover transition-opacity duration-300"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
          <svg
            className="w-10 h-10 text-gray-500 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-gray-600 font-semibold text-xs">No image</span>
        </div>
      )}
    </div>
  );
}
