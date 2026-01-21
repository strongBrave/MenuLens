import React from 'react';
import DishImage from './DishImage';

export default function MenuCard({ dish, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group h-full flex flex-col"
    >
      {/* 菜品图片 */}
      <div className="h-56 w-full overflow-hidden relative">
        <DishImage 
          url={dish.image_url} 
          alt={dish.english_name}
          className="h-full w-full"
        />
        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 text-white font-semibold bg-black/50 px-3 py-1 rounded-full text-sm transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            View Details
          </span>
        </div>
      </div>

      {/* 菜品信息 */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-xl text-gray-800 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">
          {dish.english_name}
        </h3>
        <p className="text-gray-500 text-sm font-medium mb-4">{dish.original_name}</p>

        {/* 口味标签 */}
        <div className="mt-auto flex flex-wrap gap-2">
          {dish.flavor_tags && dish.flavor_tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-block bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md text-xs font-medium"
            >
              {tag}
            </span>
          ))}
          {dish.flavor_tags && dish.flavor_tags.length > 3 && (
            <span className="text-xs text-gray-400 py-1 pl-1">+{dish.flavor_tags.length - 3}</span>
          )}
        </div>
      </div>
    </div>
  );
}
