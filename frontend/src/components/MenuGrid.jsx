import React from 'react';
import MenuCard from './MenuCard';

export default function MenuGrid({ dishes, onReset }) {
  return (
    <div className="w-full">
      {/* 页头 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Menu Results</h2>
          <p className="text-gray-600 mt-1">Found <strong>{dishes.length}</strong> dishes</p>
        </div>
        <button
          onClick={onReset}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
        >
          Upload Another
        </button>
      </div>

      {/* 菜品网格 */}
      {dishes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <MenuCard key={dish.id || dish.english_name} dish={dish} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No dishes found</p>
        </div>
      )}
    </div>
  );
}
