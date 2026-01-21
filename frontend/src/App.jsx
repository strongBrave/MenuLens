import React, { useState } from 'react';
import MenuUpload from './components/MenuUpload';
import MenuGrid from './components/MenuGrid';
import LoadingState from './components/LoadingState';
import ErrorBoundary from './components/ErrorBoundary';
import DishDetailSidebar from './components/DishDetailSidebar';
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
      // 调用后端 API
      const response = await analyzeMenu(file);

      if (response.data.success) {
        setStep('searching');
        // 模拟搜索延迟以改善 UX
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
      <div className="min-h-screen bg-gray-50 selection:bg-indigo-100 selection:text-indigo-700 font-sans">
        <DishDetailSidebar 
            dish={selectedDish} 
            onClose={() => setSelectedDish(null)} 
        />

        {/* 页头 */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 transition-all duration-300">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={handleReset}>
              <span className="text-3xl transform group-hover:scale-110 transition-transform">🍜</span>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight group-hover:text-indigo-600 transition-colors">MenuGen</h1>
            </div>
            
            {/* 显示当前状态的小徽章 (可选) */}
            {step === 'done' && (
               <div className="hidden md:block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide rounded-full">
                 Analysis Complete
               </div>
            )}
          </div>
        </header>

        {/* 主内容 */}
        <main className="max-w-6xl mx-auto px-4 py-8 min-h-[80vh]">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm flex items-start animate-fade-in">
              <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <p className="font-semibold">Error Occurred</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {step === 'upload' && <MenuUpload onUpload={handleUpload} disabled={loading} />}
          {(step === 'analyzing' || step === 'searching') && <LoadingState step={step} />}
          {step === 'done' && (
            <MenuGrid 
                dishes={dishes} 
                onReset={handleReset} 
                onDishClick={setSelectedDish}
            />
          )}
        </main>

        {/* 页脚 */}
        <footer className="mt-auto py-8 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-sm">MenuGen © 2026</p>
            <p className="text-gray-300 text-xs mt-1">Powered by Gemini & Google Search</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
