import React, { useEffect, useState } from 'react';
import DishImage from './DishImage';

export default function DishDetailSidebar({ dish, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 当 dish 改变时，重置图片索引
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [dish]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!dish) return null;

  // 获取当前显示的图片 URL
  const getCurrentImageUrl = () => {
    if (dish.image_urls && dish.image_urls.length > 0) {
      return dish.image_urls[currentImageIndex];
    }
    return dish.image_url;
  };

  // 切换下一张图片
  const handleNextImage = () => {
    if (dish.image_urls && dish.image_urls.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % dish.image_urls.length);
    }
  };

  // 朗读菜品原名
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(dish.original_name);
      // 尝试使用检测到的语言，如果不支持则回退到默认
      if (dish.language_code) {
        utterance.lang = dish.language_code;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="relative w-full md:w-[600px] lg:w-[700px] h-full bg-white shadow-2xl overflow-y-auto animate-slide-in flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-105"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero Image */}
        <div className="relative w-full h-[400px] md:h-[500px] shrink-0 bg-gray-100 group">
          <DishImage 
            url={getCurrentImageUrl()} 
            urls={dish.image_urls}
            alt={dish.english_name} 
            className="w-full h-full object-cover"
          />
          
          {/* Image Controls Container */}
          <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between items-end pointer-events-none">
             {/* Image Counter */}
             {dish.image_urls && dish.image_urls.length > 1 && (
               <div className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-sm pointer-events-auto">
                 {currentImageIndex + 1} / {dish.image_urls.length}
               </div>
             )}

             {/* Switch Image Button */}
             {dish.image_urls && dish.image_urls.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="bg-white/90 hover:bg-white text-indigo-600 p-3 rounded-full shadow-xl transition-all transform hover:scale-110 border border-indigo-100 flex items-center justify-center pointer-events-auto"
                  title="Next Image"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
             )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-10 flex-1">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl font-bold text-gray-900 flex-1 mr-4 leading-tight">
              {dish.english_name}
            </h1>
            {/* Price Display */}
            {dish.price && (
               <div className="text-right shrink-0">
                 <span className="block text-2xl font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                   {dish.currency} {dish.price}
                 </span>
               </div>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl text-gray-600 font-medium">
              {dish.original_name}
            </h2>
            {/* TTS Button */}
            <button 
              onClick={handleSpeak}
              className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors p-2 rounded-full"
              title="Speak"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>

          {/* Flavor Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {dish.flavor_tags && dish.flavor_tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="prose prose-indigo max-w-none">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {dish.description}
            </p>
          </div>
          
          {/* Metadata / Footer */}
          <div className="mt-12 pt-6 border-t border-gray-100 text-sm text-gray-400">
             <p>Search Term: {dish.search_term}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
