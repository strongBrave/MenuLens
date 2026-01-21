import React, { useRef, useState } from 'react';

export default function Sidebar({ onUpload, isLoading, onReset, hasResults }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) return alert('Please upload an image file');
    if (file.size > 10 * 1024 * 1024) return alert('File size must be less than 10MB');
    
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    onUpload(file);
  };

  const handleLocalReset = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onReset();
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  return (
    <aside className="w-full md:w-[400px] lg:w-[450px] bg-slate-50 border-r border-slate-200 flex flex-col h-full flex-shrink-0 relative z-20 shadow-xl">
      {/* Brand Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-1 cursor-pointer group" onClick={handleLocalReset}>
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-indigo-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
             M
           </div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">MenuLens</h1>
        </div>
        <p className="text-slate-500 text-sm ml-1">AI-Powered Menu Explorer</p>
      </div>

      {/* Main Action Area */}
      <div className="flex-1 px-8 py-6 flex flex-col justify-center">
        
        {/* Upload Card */}
        <div 
           className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 group h-[300px] flex flex-col items-center justify-center
             ${previewUrl ? 'border-transparent bg-slate-900 shadow-xl' : (dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02] border-dashed' : 'border-slate-300 border-dashed bg-white hover:border-indigo-400 hover:shadow-md')}
             ${isLoading ? 'pointer-events-none' : 'cursor-pointer'}
           `}
           onDragEnter={!previewUrl ? handleDrag : undefined}
           onDragLeave={!previewUrl ? handleDrag : undefined}
           onDragOver={!previewUrl ? handleDrag : undefined}
           onDrop={!previewUrl ? handleDrop : undefined}
           onClick={() => !previewUrl && fileInputRef.current?.click()}
        >
           <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
           
           {previewUrl ? (
             <>
               <img src={previewUrl} alt="Menu Preview" className={`w-full h-full object-contain transition-opacity duration-500 ${isLoading ? 'opacity-50' : 'opacity-100'}`} />
               
               {/* Overlay Actions */}
               <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/40 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin h-10 w-10 text-white mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span className="text-white font-semibold tracking-wide">Analyzing Menu...</span>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLocalReset();
                      }}
                      className="px-6 py-2 bg-white/20 backdrop-blur-md text-white border border-white/50 rounded-full font-medium hover:bg-white hover:text-slate-900 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Upload Another
                    </button>
                  )}
               </div>
             </>
           ) : (
             <div className="p-10 text-center relative z-10">
                {/* Animated Icon */}
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Upload Menu Photo
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 max-w-[200px] mx-auto">
                  Drag & drop a clear photo here to unlock the visual menu.
                </p>
                
                <button 
                    className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-base font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group-hover:from-indigo-700 group-hover:to-purple-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Select Image
                </button>
             </div>
           )}
        </div>

        {/* Status / Instructions */}
        {!hasResults && !previewUrl && (

          <div className="mt-12 space-y-6 px-2">
             <div className="flex items-center gap-4 group">
               <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">1</span>
               <div>
                 <h4 className="font-semibold text-slate-700 text-sm">Upload Photo</h4>
               </div>
             </div>
             <div className="h-4 w-0.5 bg-slate-200 ml-4 -my-2"></div>
             <div className="flex items-center gap-4 group">
               <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">2</span>
               <div>
                 <h4 className="font-semibold text-slate-700 text-sm">AI Analysis</h4>
               </div>
             </div>
             <div className="h-4 w-0.5 bg-slate-200 ml-4 -my-2"></div>
             <div className="flex items-center gap-4 group">
               <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">3</span>
               <div>
                 <h4 className="font-semibold text-slate-700 text-sm">Visual Menu</h4>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-200 bg-slate-50/50">
        <p className="text-xs text-slate-400 text-center font-medium">© 2026 MenuLens AI</p>
      </div>
    </aside>
  );
}
