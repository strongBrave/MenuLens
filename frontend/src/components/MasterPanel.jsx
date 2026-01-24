import React, { useState, useRef, useEffect } from 'react';
import DishListItem from './DishListItem';
import { Loader2, DollarSign, Globe, Banknote, ScanSearch, X, Upload, ZoomIn } from 'lucide-react';
import { AVAILABLE_CURRENCIES } from '../utils/currency';
import { motion, AnimatePresence } from 'framer-motion';

const DIETARY_FILTERS = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥦' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
  { id: 'spicy', label: 'Spicy', icon: '🌶️' },
  { id: 'contains-pork', label: 'Pork', icon: '🐷' },
];

const AVAILABLE_LANGUAGES = ['English', 'Chinese', 'Japanese', 'Korean', 'Thai', 'French', 'Spanish', 'German'];

export default function MasterPanel({ 
  onUpload, 
  isLoading, 
  onReset, 
  dishes,
  allDishesCount,
  selectedDish, 
  onSelectDish,
  imageProgress,
  targetCurrency,
  setTargetCurrency,
  sourceCurrency,
  setSourceCurrency,
  targetLanguage,
  setTargetLanguage,
  activeFilters,
  setActiveFilters,
  showValidationModal,
  currentMenuFile
}) {
  const showProgress = imageProgress && imageProgress.total > 0 && imageProgress.current < imageProgress.total;
  const progressPercent = showProgress ? Math.round((imageProgress.current / imageProgress.total) * 100) : 0;

  const toggleFilter = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId) 
        : [...prev, filterId]
    );
  };

  return (
    <aside className="w-full md:w-[380px] lg:w-[420px] bg-white border-r border-gray-200 flex flex-col h-full shrink-0 z-20 shadow-lg">
      
      {/* Top: Upload Area */}
      <div className="shrink-0 border-b border-gray-100 bg-gray-50/50">
         <div className="p-4 pb-2">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-4 px-1">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-md">M</div>
                   <h1 className="text-lg font-bold text-slate-800">MenuLens</h1>
                 </div>
               </div>
               
               {/* Controls Grid */}
               <div className="grid grid-cols-2 gap-2">
                 {/* Language Selector */}
                 <div className="relative col-span-2">
                   <select 
                     value={targetLanguage}
                     onChange={(e) => setTargetLanguage(e.target.value)}
                     disabled={allDishesCount > 0} 
                     className={`w-full appearance-none bg-white border ${!targetLanguage ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-200'} text-slate-700 text-xs font-bold py-1.5 pl-8 pr-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:border-indigo-300 transition-colors ${allDishesCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     <option value="" disabled>Select Output Language</option>
                     {AVAILABLE_LANGUAGES.map(l => (
                       <option key={l} value={l}>{l}</option>
                     ))}
                   </select>
                   <Globe className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                 </div>

                 {/* Menu Currency (Source) */}
                 <div className="relative">
                   <select 
                     value={sourceCurrency}
                     onChange={(e) => setSourceCurrency(e.target.value)}
                     disabled={allDishesCount > 0}
                     className={`w-full appearance-none bg-white border ${!sourceCurrency ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-200'} text-slate-700 text-xs font-bold py-1.5 pl-8 pr-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:border-indigo-300 transition-colors ${allDishesCount > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                   >
                     <option value="" disabled>Menu Currency</option>
                     {AVAILABLE_CURRENCIES.map(c => (
                       <option key={c} value={c}>{c}</option>
                     ))}
                   </select>
                   <Banknote className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                 </div>

                 {/* My Currency (Target) */}
                 <div className="relative">
                   <select 
                     value={targetCurrency}
                     onChange={(e) => setTargetCurrency(e.target.value)}
                     className={`w-full appearance-none bg-white border ${!targetCurrency ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-200'} text-slate-700 text-xs font-bold py-1.5 pl-8 pr-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:border-indigo-300 transition-colors`}
                   >
                     <option value="" disabled>My Currency</option>
                     {AVAILABLE_CURRENCIES.map(c => (
                       <option key={c} value={c}>{c}</option>
                     ))}
                   </select>
                   <DollarSign className="absolute left-2.5 top-1.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                 </div>
               </div>
            </div>

            {/* Upload Component Logic */}
            <UploadSection 
              onUpload={onUpload} 
              isLoading={isLoading} 
              onReset={onReset}
              hasDishes={allDishesCount > 0}
              validateConfig={() => {
                if (!targetLanguage || !sourceCurrency || !targetCurrency) {
                  showValidationModal();
                  return false;
                }
                return true;
              }}
              currentMenuFile={currentMenuFile}
            />
         </div>

         {/* Filter Bar */}
         {allDishesCount > 0 && (
            <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar mask-gradient-right">
              {DIETARY_FILTERS.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
                    ${activeFilters.includes(filter.id)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}
                  `}
                >
                  <span>{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>
         )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="px-6 py-2 bg-indigo-50 border-b border-indigo-100 animate-fade-in">
           <div className="flex justify-between items-center text-xs font-semibold text-indigo-700 mb-1.5">
             <span className="flex items-center gap-1.5">
               <Loader2 className="w-3 h-3 animate-spin" />
               Finding images...
             </span>
             <span>{imageProgress.current} / {imageProgress.total}</span>
           </div>
           <div className="w-full h-1.5 bg-indigo-200 rounded-full overflow-hidden">
             <div 
               className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
               style={{ width: `${progressPercent}%` }}
             />
           </div>
        </div>
      )}

      {/* Bottom: Dish List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {dishes && dishes.length > 0 ? (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 mt-2 flex justify-between items-center">
              <span>Detected Dishes</span>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{dishes.length}</span>
            </h3>
            {dishes.map((dish, index) => (
              <DishListItem 
                key={dish.original_name + index} 
                dish={dish} 
                targetCurrency={targetCurrency}
                isSelected={selectedDish && selectedDish.original_name === dish.original_name}
                onClick={() => onSelectDish(dish)}
              />
            ))}
          </div>
        ) : (
          !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="text-sm text-gray-500">Dishes will appear here</p>
            </div>
          )
        )}
      </div>
    </aside>
  );
}

function UploadSection({ onUpload, isLoading, onReset, hasDishes, validateConfig, currentMenuFile }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);

  // If external reset happens (e.g. after upload), clear local state
  useEffect(() => {
    if (!hasDishes && !isLoading && !selectedFile) {
      setPreviewUrl(null);
    }
  }, [hasDishes, isLoading, selectedFile]);

  // Handle uploaded file preview from parent
  useEffect(() => {
    if (currentMenuFile && hasDishes) {
      const url = URL.createObjectURL(currentMenuFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [currentMenuFile, hasDishes]);

  const handleFileSelect = (file) => {
    if (!file.type.startsWith('image/')) return alert('Image only');
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
  };

  const handleStartScan = (e) => {
    e.stopPropagation();
    if (validateConfig()) {
      if (selectedFile) {
        onUpload(selectedFile);
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onReset();
  };

  // If already uploaded and showing results
  if (hasDishes) {
    return (
      <div className="flex gap-2 h-[80px]">
        {/* Lightbox Modal */}
        <AnimatePresence>
          {showLightbox && previewUrl && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
              onClick={() => setShowLightbox(false)}
            >
              <img src={previewUrl} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Menu Original" />
              <button className="absolute top-4 right-4 text-white bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Left: Thumbnail Preview */}
        <div 
          className="relative w-[80px] h-full rounded-xl overflow-hidden border border-gray-200 cursor-zoom-in group"
          onClick={() => setShowLightbox(true)}
        >
          {previewUrl && <img src={previewUrl} className="w-full h-full object-cover" alt="Menu Thumbnail" />}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Right: Scan New Button */}
        <div 
          className="flex-1 relative overflow-hidden rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 transition-colors cursor-pointer flex items-center justify-center group"
          onClick={() => {
            onReset();
            setPreviewUrl(null);
            setSelectedFile(null);
            fileInputRef.current?.click();
          }}
        >
           <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} className="hidden" />
           <div className="flex flex-col items-center justify-center gap-1 text-indigo-600">
             <Upload className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
             <span className="text-xs font-bold">Scan New</span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div 
       className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 group h-[200px] flex flex-col items-center justify-center
         ${previewUrl ? 'border-transparent bg-slate-900' : (dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-dashed border-slate-300 bg-white hover:border-indigo-400')}
         ${isLoading ? 'pointer-events-none' : ''}
       `}
       onClick={() => !previewUrl && fileInputRef.current?.click()}
       onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
       onDragLeave={() => setDragActive(false)}
       onDrop={(e) => {
         e.preventDefault();
         setDragActive(false);
         if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
       }}
    >
       <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} className="hidden" />
       
       {previewUrl ? (
         <>
           <img src={previewUrl} className={`w-full h-full object-contain ${isLoading ? 'opacity-50 blur-sm' : ''}`} alt="Preview" />
           
           {/* Overlay Controls */}
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all p-4">
              
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-10 h-10 text-white animate-spin mb-2" />
                  <span className="text-white font-bold tracking-wide">Analysing Menu...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3 w-full max-w-[200px] animate-fade-in">
                  <button 
                    onClick={handleStartScan} 
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-xl flex items-center justify-center gap-2 transform transition-transform hover:scale-105 active:scale-95"
                  >
                    <ScanSearch className="w-4 h-4" />
                    Scan Menu
                  </button>
                  
                  <button 
                    onClick={handleClear}
                    className="w-full py-2 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg backdrop-blur-md transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                </div>
              )}
           </div>
         </>
       ) : (
         <div className="text-center p-4 cursor-pointer">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
              <ScanSearch className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-700 block">Upload Menu Photo</span>
            <p className="text-xs text-slate-400 mt-1">Drag & drop or click to browse</p>
         </div>
       )}
    </div>
  );
}
