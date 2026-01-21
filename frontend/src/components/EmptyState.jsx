import React from 'react';

export default function EmptyState() {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50/50">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 rounded-full animate-pulse"></div>
        <img 
          src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Food/Bento%20Box.png" 
          alt="Food Icon" 
          className="w-48 h-48 relative z-10 animate-float"
        />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-800 mb-4">
        Ready to Order?
      </h2>
      <p className="text-slate-500 max-w-md text-lg leading-relaxed">
        Upload a menu photo on the left to start exploring delicious dishes visually.
      </p>
    </div>
  );
}
