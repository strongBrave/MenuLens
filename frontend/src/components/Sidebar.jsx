import React, { useRef, useState } from 'react';

export default function Sidebar({ onUpload, isLoading, onReset, hasResults }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

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
    onUpload(file);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  return (
    <aside className="w-full md:w-[400px] lg:w-[450px] bg-slate-50 border-r border-slate-200 flex flex-col h-full flex-shrink-0 relative z-20 shadow-xl">
      {/* Brand Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-1 cursor-pointer" onClick={onReset}>
           <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-indigo-200 shadow-lg">
             M
           </div>
           <h1 className="text-2xl font-bold text-slate-800 tracking-tight">MenuGen</h1>
        </div>
        <p className="text-slate-500 text-sm ml-1">AI-Powered Menu Explorer</p>
      </div>

      {/* Main Action Area */}
      <div className="flex-1 px-8 py-6 flex flex-col justify-center">
        
        {/* Upload Card */}
        <div 
           className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 group
             ${dragActive ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-300 bg-white hover:border-indigo-400 hover:shadow-md'}
             ${isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
           `}
           onDragEnter={handleDrag}
           onDragLeave={handleDrag}
           onDragOver={handleDrag}
           onDrop={handleDrop}
           onClick={() => fileInputRef.current?.click()}
        >
           <input ref={fileInputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
           
           <div className="p-10 text-center">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                {isLoading ? (
                   <svg className="animate-spin h-8 w-8" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {isLoading ? 'Analyzing Menu...' : 'Upload Menu Photo'}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Drag & drop or click to browse.<br/>
                We'll identify dishes instantly.
              </p>
              
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition shadow-sm">
                Select Image
              </button>
           </div>
        </div>

        {/* Status / Instructions */}
        {!hasResults && !isLoading && (
          <div className="mt-12 space-y-6">
             <div className="flex items-start gap-4">
               <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">1</span>
               <div>
                 <h4 className="font-semibold text-slate-800 text-sm">Upload Photo</h4>
                 <p className="text-slate-500 text-xs mt-1">Take a clear photo of any menu.</p>
               </div>
             </div>
             <div className="flex items-start gap-4">
               <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">2</span>
               <div>
                 <h4 className="font-semibold text-slate-800 text-sm">AI Analysis</h4>
                 <p className="text-slate-500 text-xs mt-1">Gemini Pro reads the dish names.</p>
               </div>
             </div>
             <div className="flex items-start gap-4">
               <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">3</span>
               <div>
                 <h4 className="font-semibold text-slate-800 text-sm">Visual Discovery</h4>
                 <p className="text-slate-500 text-xs mt-1">We find the best photos for each dish.</p>
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-200">
        <p className="text-xs text-slate-400 text-center">© 2026 MenuGen • Powered by Google Cloud</p>
      </div>
    </aside>
  );
}
