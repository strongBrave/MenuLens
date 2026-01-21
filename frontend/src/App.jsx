import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MenuGrid from './components/MenuGrid';
import LoadingState from './components/LoadingState';
import ErrorBoundary from './components/ErrorBoundary';
import DishDetailSidebar from './components/DishDetailSidebar';
import EmptyState from './components/EmptyState';
import { analyzeMenu } from './api/client';
import './index.css';

function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // 'upload' | 'analyzing' | 'searching' | 'done'
  const [error, setError] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);

  const handleUpload = async (file) => {
    setError(null);
    setLoading(true);
    setStep('analyzing');

    try {
      const response = await analyzeMenu(file);

      if (response.data.success) {
        setStep('searching');
        await new Promise(r => setTimeout(r, 500));
        setDishes(response.data.dishes || []);
        setStep('done');
      } else {
        setError(response.data.error || 'Failed to analyze menu');
        setStep('upload');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      setStep('upload');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDishes([]);
    setStep('upload');
    setError(null);
    setSelectedDish(null);
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
        
        {/* Detail Drawer (Fixed Overlay) */}
        <DishDetailSidebar 
            dish={selectedDish} 
            onClose={() => setSelectedDish(null)} 
        />

        {/* Left Sidebar (Control Center) */}
        <Sidebar 
           onUpload={handleUpload} 
           isLoading={loading}
           onReset={handleReset}
           hasResults={dishes.length > 0}
        />

        {/* Right Main Content (Scrollable Gallery) */}
        <main className="flex-1 relative h-full overflow-y-auto overflow-x-hidden bg-white">
          
          {/* Top Bar (Mobile/Status) - Optional */}
          {dishes.length > 0 && (
             <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-8 py-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Results Gallery</h2>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {dishes.length} Dishes Found
                </span>
             </div>
          )}

          <div className="p-8 pb-20 min-h-full">
            {error && (
              <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 animate-fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Content Switcher */}
            {step === 'upload' && <EmptyState />}
            
            {(step === 'analyzing' || step === 'searching') && (
               <div className="h-full flex flex-col items-center justify-center -mt-20">
                  <LoadingState step={step} />
               </div>
            )}
            
            {step === 'done' && (
              <div className="animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                    {dishes.map((dish, index) => (
                      <div key={dish.id || index} style={{animationDelay: `${index * 50}ms`}} className="animate-slide-in opacity-0 fill-mode-forwards">
                          {/* Import MenuCard directly here or use the existing component but we need to pass onClick */}
                          {/* We are reusing MenuGrid internal logic but let's just map MenuCard directly for better control if needed, 
                              BUT for now let's use MenuGrid but customized via CSS/wrapper 
                              Actually, App.jsx was using MenuGrid. Let's keep it simple and just use MenuGrid logic here to avoid rewriting MenuGrid entirely if not needed.
                              Wait, MenuGrid has headers we might not want. Let's just import MenuCard directly to build the grid manually here for perfect control.
                          */}
                      </div>
                    ))}
                    {/* Wait, let's just use MenuGrid but maybe remove its header? 
                        Or better, let's use MenuGrid but pass a flag or just accept its header is ok. 
                        Actually MenuGrid has a "Upload Another" button which is now redundant.
                        Let's quick-fix MenuGrid to be cleaner.
                    */}
                    <div className="w-full">
                       <MenuGrid dishes={dishes} onReset={()=>{}} onDishClick={setSelectedDish} />
                    </div>
                  </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
