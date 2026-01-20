import React, { useState, useRef } from 'react';

export default function MenuCard({ dish }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    // 如果直接加载失败，尝试使用代理
    const img = imgRef.current;
    if (img && dish.image_url && !img.src.includes('/api/proxy-image')) {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(dish.image_url)}`;
      img.src = proxyUrl;
      img.onerror = () => {
        // 代理也失败了，显示占位图
        setImageError(true);
        setImageLoading(false);
      };
    } else {
      // 代理也失败了，显示占位图
      setImageError(true);
      setImageLoading(false);
    }
  };

  const hasImage = dish.image_url && !imageError;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {/* 菜品图片 */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        {hasImage ? (
          <>
            {imageLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 animate-pulse flex items-center justify-center">
                <span className="text-gray-600 font-semibold">Loading...</span>
              </div>
            )}
            <img
              ref={imgRef}
              src={dish.image_url}
              alt={dish.english_name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <svg
              className="w-12 h-12 text-gray-600 mb-2"
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
            <span className="text-gray-600 font-semibold text-sm">No image</span>
          </div>
        )}
      </div>

      {/* 菜品信息 */}
      <div className="p-4">
        {/* 名称 */}
        <h3 className="font-bold text-lg text-gray-800 mb-1">
          {dish.english_name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 font-medium">{dish.original_name}</p>

        {/* 描述 */}
        <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-3">
          {dish.description}
        </p>

        {/* 口味标签 */}
        <div className="flex flex-wrap gap-2">
          {dish.flavor_tags && dish.flavor_tags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-indigo-200 transition"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 搜索词 */}
        <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
          Search: {dish.search_term}
        </p>
      </div>
    </div>
  );
}
