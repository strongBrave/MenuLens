import React from 'react';
import MenuCard from './MenuCard';

export default function MenuGrid({ dishes, onReset, onDishClick }) {
  // We removed the header and "Upload Another" button because those are now handled by the Sidebar layout
  
  if (!dishes || dishes.length === 0) return null;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
        {dishes.map((dish, index) => (
          <div 
             key={dish.id || dish.english_name || index} 
             className="animate-slide-in"
             style={{ animationDelay: `${index * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}
          >
            <MenuCard 
              dish={dish} 
              onClick={() => onDishClick(dish)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
