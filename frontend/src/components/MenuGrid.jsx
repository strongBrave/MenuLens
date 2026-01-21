import React from 'react';
import MenuCard from './MenuCard';

export default function MenuGrid({ dishes, onReset, onDishClick }) {
  return (
    <div className="w-full">
      {/* 页头 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Menu Results</h2>
          <p className="text-gray-600 mt-1">Found <strong className="text-indigo-600">{dishes.length}</strong> dishes</p>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Another
        </button>
      </div>

      {/* 菜品网格 */}
      {dishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map((dish) => (
            <MenuCard 
              key={dish.id || dish.english_name} 
              dish={dish} 
              onClick={() => onDishClick(dish)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">No dishes found</p>
        </div>
      )}
    </div>
  );
}
