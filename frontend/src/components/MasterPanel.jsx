import React from 'react';
import MenuUpload from './MenuUpload'; // We will likely reuse MenuUpload logic but simplify it or just embed it
import DishListItem from './DishListItem';
import Sidebar from './Sidebar'; // Reusing the Upload logic from Sidebar but stripping layout

// 为了简化，我们直接在 MasterPanel 里实现上传逻辑的 UI，或者复用 Sidebar 的逻辑
// 鉴于 MenuUpload 组件是一个独立的上传框，我们可以直接用它。
// 但我们需要 Sidebar.jsx 里的 "预览+重新上传" 逻辑。
// 让我们重用 Sidebar.jsx 的逻辑，但把它的布局改成适合 MasterPanel 的样子。
// 或者，更简单：MasterPanel 包含两部分：Top (Sidebar 简化版) + Bottom (Dish List)。

export default function MasterPanel({ 
  onUpload, 
  isLoading, 
  onReset, 
  dishes, 
  selectedDish, 
  onSelectDish,
  hasResults 
}) {
  return (
    <aside className="w-full md:w-[380px] lg:w-[420px] bg-white border-r border-gray-200 flex flex-col h-full shrink-0 z-20 shadow-lg">
      
      {/* Top: Upload Area (Fixed) */}
      <div className="shrink-0 border-b border-gray-100 bg-gray-50/50">
         {/* Reusing Sidebar Logic but passing specific className/props if needed */}
         {/* Actually Sidebar.jsx has a lot of internal state (previewUrl etc). 
             Ideally we should lift that state up or reuse Sidebar component but hide its footer/instructions when hasResults.
             Let's use Sidebar component but we need to tell it to render differently or just use it as the top part.
             Wait, Sidebar component is designed to be full height.
             Let's extract the "Upload Card" part from Sidebar to a new component or just inline a simple uploader here.
             
             Better approach: Use Sidebar.jsx but wrap it in a div with max-height? No.
             Let's duplicate the Upload Logic here for now to ensure perfect control of the split layout.
         */}
         <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 px-2">
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-md">M</div>
               <h1 className="text-lg font-bold text-slate-800">MenuGen</h1>
            </div>

            {/* Upload Component Logic */}
            <UploadSection 
              onUpload={onUpload} 
              isLoading={isLoading} 
              onReset={onReset} 
              hasResults={hasResults} 
            />
         </div>
      </div>

      {/* Bottom: Dish List (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {dishes && dishes.length > 0 ? (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 mt-2">
              Detected Dishes ({dishes.length})
            </h3>
            {dishes.map((dish, index) => (
              <DishListItem 
                key={dish.original_name + index} 
                dish={dish} 
                isSelected={selectedDish && selectedDish.original_name === dish.original_name}
                onClick={() => onSelectDish(dish)}
              />
            ))}
          </div>
        ) : (
          /* Empty State for List */
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

// Internal Sub-component for Upload Logic (Simplified from Sidebar)
function UploadSection({ onUpload, isLoading, onReset, hasResults }) {
  const fileInputRef = React.useRef(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState(null);

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) return alert('Image only');
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onUpload(file);
  };

  const handleReset = () => {
    setPreviewUrl(null);
    onReset();
  };

  return (
    <div 
       className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 group h-[180px] flex flex-col items-center justify-center
         ${previewUrl ? 'border-transparent bg-slate-900' : (dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-dashed border-slate-300 bg-white hover:border-indigo-400')}
         ${isLoading ? 'pointer-events-none' : 'cursor-pointer'}
       `}
       onClick={() => !previewUrl && fileInputRef.current?.click()}
       onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
       onDragLeave={() => setDragActive(false)}
       onDrop={(e) => {
         e.preventDefault();
         setDragActive(false);
         if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
       }}
    >
       <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} className="hidden" />
       
       {previewUrl ? (
         <>
           <img src={previewUrl} className={`w-full h-full object-contain ${isLoading ? 'opacity-50' : ''}`} alt="Preview" />
           <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); handleReset(); }} 
                className="px-5 py-2 bg-indigo-600 text-white text-sm font-bold rounded-full shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all border border-indigo-400"
              >
                Upload New
              </button>
           </div>
           {isLoading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <svg className="animate-spin h-8 w-8 text-white mb-2" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <span className="text-white text-xs font-bold">Processing...</span>
             </div>
           )}
         </>
       ) : (
         <div className="text-center p-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-sm font-bold text-slate-700">Upload Menu</span>
            <p className="text-xs text-slate-400 mt-1">Drag & drop or click</p>
         </div>
       )}
    </div>
  );
}
