import React, { useState, useEffect } from 'react';
import DishImage from './DishImage';

export default function DetailPanel({ dish }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false); // Lightbox state

  // 当 dish 改变时，重置图片索引
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsZoomed(false);
  }, [dish]);

  // 如果没有选中菜品，显示空状态
  if (!dish) {
    return (
      <div className="flex-1 h-full bg-gray-50 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Select a Dish</h2>
        <p className="text-gray-500">Choose a dish from the list to view details.</p>
      </div>
    );
  }

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
      if (dish.language_code) {
        utterance.lang = dish.language_code;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex-1 h-full bg-white flex flex-col animate-fade-in overflow-y-auto">
      {/* Lightbox Overlay */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center">
             <img 
               src={getCurrentImageUrl()} 
               alt={dish.english_name}
               className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
             />
             <button 
               className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
               onClick={() => setIsZoomed(false)}
             >
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <div className="absolute bottom-4 text-white/80 text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
               Click anywhere to close
             </div>
          </div>
        </div>
      )}

      {/* Hero Image Section - 占据上半部分 */}
      <div 
        className="relative w-full h-[45vh] min-h-[300px] shrink-0 bg-gray-900 group cursor-zoom-in"
        onClick={() => setIsZoomed(true)}
      >
        <DishImage 
          url={getCurrentImageUrl()} 
          urls={dish.image_urls}
          alt={dish.english_name} 
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
        />
        
        {/* 背景渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

        {/* Zoom Hint Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="bg-black/30 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
             Click to Expand
           </div>
        </div>

        {/* Image Controls - Prevent zoom click propagation */}
        <div className="absolute bottom-6 right-6 flex items-center gap-3" onClick={e => e.stopPropagation()}>
           {/* Counter */}
           {dish.image_urls && dish.image_urls.length > 1 && (
             <div className="bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wider border border-white/10 shadow-lg">
               {currentImageIndex + 1} / {dish.image_urls.length}
             </div>
           )}

           {/* Switch Button */}
           {dish.image_urls && dish.image_urls.length > 1 && (
              <button
                onClick={handleNextImage}
                className="bg-white text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-full shadow-xl transition-all active:scale-95 border-2 border-indigo-100"
                title="Next Image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
           )}
        </div>
      </div>

      {/* Content Section - 下半部分 */}
      <div className="p-8 md:p-12 max-w-4xl mx-auto w-full">
        
        {/* Header Title & Price */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight leading-tight">
              {dish.english_name}
            </h1>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl text-gray-500 font-medium font-serif">
                {dish.original_name}
              </h2>
              <button 
                onClick={handleSpeak}
                className="text-indigo-400 hover:text-indigo-600 bg-indigo-50 p-1.5 rounded-full transition-colors"
                title="Pronounce"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </button>
            </div>
          </div>

          {dish.price && (
             <div className="bg-emerald-50 text-emerald-700 px-5 py-2 rounded-xl border border-emerald-100 shadow-sm shrink-0">
               <span className="text-sm font-semibold uppercase tracking-wide opacity-70 block text-xs">Price</span>
               <span className="text-2xl font-bold">{dish.currency} {dish.price}</span>
             </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {dish.flavor_tags && dish.flavor_tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <div className="prose prose-lg prose-indigo max-w-none text-gray-600">
          <h3 className="text-lg font-bold text-gray-900 mb-3">About this dish</h3>
          <p className="leading-relaxed text-lg">
            {dish.description}
          </p>
        </div>
        
        {/* Footer Meta */}
        <div className="mt-16 pt-6 border-t border-gray-100 text-sm text-gray-400 flex justify-between">
           <span>Identified by Gemini Pro</span>
           <span>Search Term: {dish.search_term}</span>
        </div>
      </div>
    </div>
  );
}
