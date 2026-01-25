import React, { useState, useEffect } from 'react';
import { Volume2, X, ChevronLeft, ChevronRight, Maximize2, Tag, Info, UtensilsCrossed, Zap, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertCurrency } from '../utils/currency';

export default function DetailPanel({ dish, targetCurrency = 'USD' }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Reset index when dish changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsZoomed(false);
  }, [dish]);

  if (!dish) {
    return (
      <div className="flex-1 h-full bg-cream-50 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-brand-100 border border-brand-50">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/3081/3081840.png" 
            alt="Select Dish" 
            className="w-16 h-16 opacity-50" 
          />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-800 mb-2">Select a Dish</h2>
        <p className="text-slate-500 max-w-xs mx-auto">
          Choose a dish from the menu to see its delicious details, origin, and pronunciation.
        </p>
      </div>
    );
  }

  const convertedPrice = dish.price && dish.currency 
    ? convertCurrency(dish.price, dish.currency, targetCurrency)
    : null;

  const getCurrentImageUrl = () => {
    if (dish.image_urls && dish.image_urls.length > 0) {
      return dish.image_urls[currentImageIndex];
    }
    return dish.image_url;
  };

  // Get score for CURRENT image
  const getCurrentScore = () => {
    if (dish.image_scores && dish.image_scores.length > currentImageIndex) {
      return dish.image_scores[currentImageIndex];
    }
    return dish.match_score; // Fallback
  };

  const currentScore = getCurrentScore();

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    if (dish.image_urls && dish.image_urls.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % dish.image_urls.length);
    }
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    if (dish.image_urls && dish.image_urls.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + dish.image_urls.length) % dish.image_urls.length);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(dish.original_name);
      if (dish.language_code) {
        utterance.lang = dish.language_code;
      }
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex-1 h-full bg-white flex flex-col animate-fade-in overflow-y-auto custom-scrollbar relative">
      <AnimatePresence>
        {isZoomed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center">
               <motion.img 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 src={getCurrentImageUrl()} 
                 alt={dish.english_name}
                 className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl rounded-lg"
               />
               
               {/* Show score in lightbox too */}
               <div className="absolute top-4 left-4 z-50">
                 {currentScore && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white font-bold border border-white/20">
                     {currentScore >= 80 ? <Zap className="w-4 h-4 text-yellow-400 fill-current" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                     {currentScore}% Match
                   </div>
                 )}
               </div>

               <button 
                 className="absolute top-4 right-4 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all border border-white/20"
                 onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
               >
                 <X className="w-6 h-6" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className="relative w-full h-[45vh] min-h-[300px] shrink-0 bg-slate-900 group cursor-zoom-in overflow-hidden"
        onClick={() => setIsZoomed(true)}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-3xl scale-125 saturate-150"
            style={{ backgroundImage: `url(${getCurrentImageUrl()})` }}
          />
          <motion.img 
            key={getCurrentImageUrl()}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={getCurrentImageUrl()} 
            alt={dish.english_name} 
            className="relative h-full w-full object-contain z-10 transition-transform duration-700 group-hover:scale-[1.02]"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none z-20" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 pointer-events-none transform scale-90 group-hover:scale-100">
           <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border border-white/20 shadow-xl">
             <Maximize2 className="w-4 h-4" />
             <span>Expand View</span>
           </div>
        </div>

        {/* Dynamic Match Score Badge */}
        <div className="absolute top-4 right-4 z-30">
           {currentScore ? (
             <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border shadow-lg text-xs font-bold tracking-wide transition-colors duration-300
               ${currentScore >= 80 
                 ? 'bg-emerald-500/80 text-white border-emerald-400/50' 
                 : currentScore >= 50 
                   ? 'bg-amber-500/80 text-white border-amber-400/50' 
                   : 'bg-red-500/80 text-white border-red-400/50'}`}
             >
               {currentScore >= 80 ? <Zap className="w-3 h-3 fill-current" /> : <AlertTriangle className="w-3 h-3" />}
               {currentScore}% Match
             </div>
           ) : (
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white/80 text-xs font-bold shadow-lg">
               <Zap className="w-3 h-3" />
               AI Matched
             </div>
           )}
        </div>

        <div className="absolute bottom-6 right-6 flex items-center gap-2 z-30" onClick={e => e.stopPropagation()}>
           {dish.image_urls && dish.image_urls.length > 1 && (
             <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10 shadow-2xl">
               <button onClick={handlePrevImage} className="bg-transparent p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95 flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
               <span className="text-xs font-bold text-white tracking-widest min-w-[40px] text-center font-mono">{currentImageIndex + 1} / {dish.image_urls.length}</span>
               <button onClick={handleNextImage} className="bg-transparent p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all active:scale-95 flex items-center justify-center"><ChevronRight className="w-5 h-5" /></button>
             </div>
           )}
        </div>
      </div>

      <div className="relative -mt-8 bg-white rounded-t-[2.5rem] px-6 md:px-12 py-10 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] min-h-[500px]">
        <div className="flex flex-col gap-6 mb-8 border-b border-slate-100 pb-8">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2 leading-tight">{dish.english_name}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl text-slate-500 font-medium font-serif">{dish.original_name}</h2>
                <button 
                  onClick={handleSpeak}
                  disabled={isSpeaking}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${isSpeaking ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-200' : 'bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600'}`}
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                  {isSpeaking ? 'Playing...' : 'Pronounce'}
                </button>
              </div>
            </div>

            {dish.price && (
               <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm shrink-0 flex flex-col items-center min-w-[80px]">
                 <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Price</span>
                 <span className="text-xl font-bold font-serif">{dish.currency}{dish.price}</span>
                 {convertedPrice && (
                    <span className="text-xs text-emerald-600/70 font-mono mt-1 pt-1 border-t border-emerald-200/50 w-full text-center">
                      ≈ {convertedPrice}
                    </span>
                 )}
               </div>
            )}
          </div>
        </div>

        {/* Dietary & Flavor Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {dish.dietary_tags && dish.dietary_tags.map((tag, i) => (
             <span key={i} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-100 shadow-sm cursor-default capitalize">
               {tag === 'vegetarian' && '🥦 '}
               {tag === 'vegan' && '🌱 '}
               {tag === 'spicy' && '🌶️ '}
               {tag === 'contains-pork' && '🐷 '}
               {tag.replace('-', ' ')}
             </span>
          ))}
          {dish.flavor_tags && dish.flavor_tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium border border-slate-200 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-100 transition-colors cursor-default capitalize">
              <Tag className="w-3 h-3 opacity-60" />
              {tag}
            </span>
          ))}
        </div>

        {/* Ingredients Section (New) */}
        {dish.ingredients && dish.ingredients.length > 0 && (
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
              <UtensilsCrossed className="w-4 h-4" />
              Main Ingredients
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {dish.ingredients.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="prose prose-lg prose-indigo max-w-none text-slate-600 mb-12">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4 not-prose">
            <Info className="w-5 h-5 text-brand-500" />
            About this dish
          </h3>
          <p className="leading-relaxed font-serif text-lg text-slate-600/90">{dish.description}</p>
        </div>
        
        <div className="bg-cream-50 rounded-xl p-4 text-xs text-slate-400 flex justify-between items-center border border-slate-100">
           <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />Identified by Gemini Pro</div>
           <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200">Match: {dish.search_term}</span>
        </div>
      </div>
    </div>
  );
}
