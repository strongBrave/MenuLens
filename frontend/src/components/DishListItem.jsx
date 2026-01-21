import React from 'react';
import DishImage from './DishImage';

export default function DishListItem({ dish, isSelected, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`group flex items-center p-3 mb-2 rounded-xl cursor-pointer transition-all duration-200 border
        ${isSelected 
          ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
          : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'}
      `}
    >
      {/* 缩略图 */}
      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-100 mr-4">
        <DishImage 
          url={dish.image_url} 
          urls={dish.image_urls}
          alt={dish.english_name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 文本信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className={`font-bold text-sm truncate pr-2 ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
            {dish.english_name}
          </h4>
          {dish.price && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
              {dish.price}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {dish.original_name}
        </p>
        
        {/* 标签 (仅显示第一个) */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {dish.flavor_tags && dish.flavor_tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* 选中指示箭头 */}
      {isSelected && (
        <div className="w-1 h-8 bg-indigo-500 rounded-full ml-2 shrink-0 animate-fade-in"></div>
      )}
    </div>
  );
}
