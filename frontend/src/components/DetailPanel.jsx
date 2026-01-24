import React, { useState } from 'react';
import { Volume2, X, ChevronLeft, ChevronRight, Maximize2, Tag, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DetailPanel({ dish }) {
  // Key from parent ensures we reset state on new dish
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!dish) {
    return (
      <div className="flex-1 h-full bg-slate-50 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-100 border border-indigo-50">
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

  const getCurrentImageUrl = () => {
    if (dish.image_urls && dish.image_urls.length > 0) {
      return dish.image_urls[currentImageIndex];
    }
    return dish.image_url;
  };

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

        <div className="absolute bottom-6 right-6 flex items-center gap-2 z-30" onClick={e => e.stopPropagation()}>
           {dish.image_urls && dish.image_urls.length > 1 && (
             <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
               <button onClick={handlePrevImage} className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"><ChevronLeft className="w-4 h-4" /></button>
               <span className="text-xs font-medium text-white px-1 min-w-[30px] text-center">{currentImageIndex + 1}/{dish.image_urls.length}</span>
               <button onClick={handleNextImage} className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"><ChevronRight className="w-4 h-4" /></button>
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${isSpeaking ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
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
               </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {dish.flavor_tags && dish.flavor_tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-50/50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100/50 hover:bg-indigo-100 transition-colors cursor-default">
              <Tag className="w-3 h-3 opacity-60" />
              {tag}
            </span>
          ))}
        </div>

        <div className="prose prose-lg prose-indigo max-w-none text-slate-600 mb-12">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4 not-prose">
            <Info className="w-5 h-5 text-indigo-500" />
            About this dish
          </h3>
          <p className="leading-relaxed font-serif text-lg text-slate-600/90">{dish.description}</p>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-400 flex justify-between items-center border border-slate-100">
           <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />Identified by Gemini Pro</div>
           <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200">Match: {dish.search_term}</span>
        </div>
      </div>
    </div>
  );
}
