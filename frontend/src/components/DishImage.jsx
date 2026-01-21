import React, { useState, useRef, useEffect } from 'react';

export default function DishImage({ url, alt, className }) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);

  // Reset states when url changes
  useEffect(() => {
    setImageLoading(true);
    setImageError(false);
  }, [url]);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    const img = imgRef.current;
    if (img && url && !img.src.includes('/api/proxy-image')) {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      img.src = proxyUrl;
      // We don't attach another onerror here to avoid infinite loops if proxy fails too frequently,
      // but in the original code:
      img.onerror = () => {
        setImageError(true);
        setImageLoading(false);
      };
    } else {
      setImageError(true);
      setImageLoading(false);
    }
  };

  const hasImage = url && !imageError;

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
