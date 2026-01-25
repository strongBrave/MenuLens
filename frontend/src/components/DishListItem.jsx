import React from 'react';
import DishImage from './DishImage';
import { convertCurrency } from '../utils/currency';

export default function DishListItem({ dish, isSelected, onClick, targetCurrency = 'USD', isSearching }) {
  // Calculate converted price
  const convertedPrice = dish.price && dish.currency 
    ? convertCurrency(dish.price, dish.currency, targetCurrency)
    : null;

  return (
    <div 
      onClick={onClick}
      className={`group flex items-center p-3 mb-2 rounded-xl cursor-pointer transition-all duration-200 border
        ${isSelected 
          ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
          : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'}
      `}
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-100 mr-4 relative">
        <DishImage 
          url={dish.image_url} 
          urls={dish.image_urls}
          alt={dish.english_name}
          className="w-full h-full object-cover"
          isSearching={isSearching}
        />
        {/* Dietary Badges (Mini) */}
        {dish.dietary_tags && dish.dietary_tags.includes('vegetarian') && (
          <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white shadow-sm" title="Vegetarian" />
        )}
        {dish.dietary_tags && dish.dietary_tags.includes('spicy') && (
          <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white shadow-sm" title="Spicy" />
        )}
      </div>

      {/* Text Info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className={`font-bold text-sm truncate pr-2 ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>
            {dish.english_name}
          </h4>
          
          <div className="flex flex-col items-end">
            {/* Original Price */}
            {dish.price && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                {dish.price}
              </span>
            )}
            {/* Converted Price */}
            {convertedPrice && (
              <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                ≈ {convertedPrice}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          {dish.original_name}
        </p>
        
        {/* Tags */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {/* Prioritize Dietary Tags first */}
          {dish.dietary_tags && dish.dietary_tags.slice(0, 2).map(tag => (
             <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md capitalize">
               {tag.replace('-', ' ')}
             </span>
          ))}
          {/* Then Flavor Tags */}
          {dish.flavor_tags && dish.flavor_tags.slice(0, 1).map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md capitalize">
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      {/* Active Indicator */}
      {isSelected && (
        <div className="w-1 h-8 bg-indigo-500 rounded-full ml-2 shrink-0 animate-fade-in"></div>
      )}
    </div>
  );
}
