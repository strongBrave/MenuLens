import React from 'react';

export default function MenuCard({ dish }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {/* 菜品图片 */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        {dish.image_url ? (
          <img
            src={dish.image_url}
            alt={dish.english_name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
            <span className="text-gray-600 font-semibold">No image</span>
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
