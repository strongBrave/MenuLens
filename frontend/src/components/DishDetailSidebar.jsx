import React, { useEffect } from 'react';
import DishImage from './DishImage';

export default function DishDetailSidebar({ dish, onClose }) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!dish) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="relative w-full md:w-[480px] h-full bg-white shadow-2xl overflow-y-auto animate-slide-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Hero Image */}
        <div className="h-72 w-full">
          <DishImage 
            url={dish.image_url} 
            alt={dish.english_name} 
            className="w-full h-full"
          />
        </div>

        {/* Content */}
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {dish.english_name}
          </h1>
          <h2 className="text-xl text-gray-500 font-medium mb-6">
            {dish.original_name}
          </h2>

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
