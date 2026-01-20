import React, { useState } from 'react';
import MenuUpload from './components/MenuUpload';
import MenuGrid from './components/MenuGrid';
import LoadingState from './components/LoadingState';
import ErrorBoundary from './components/ErrorBoundary';
import { analyzeMenu } from './api/client';
import './index.css';

function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // 'upload' | 'analyzing' | 'searching' | 'done'
  const [error, setError] = useState(null);

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
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 页头 */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🍜</span>
              <h1 className="text-3xl font-bold text-indigo-600">MenuGen</h1>
            </div>
            {step === 'done' && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Upload Another Menu
              </button>
            )}
          </div>
        </header>

        {/* 主内容 */}
        <main className="max-w-6xl mx-auto px-4 py-8 min-h-96">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-semibold">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {step === 'upload' && <MenuUpload onUpload={handleUpload} disabled={loading} />}
          {(step === 'analyzing' || step === 'searching') && <LoadingState step={step} />}
          {step === 'done' && <MenuGrid dishes={dishes} onReset={handleReset} />}
        </main>

        {/* 页脚 */}
        <footer className="mt-12 py-6 bg-gray-800 text-white text-center">
          <p>MenuGen © 2026 | Powered by Gemini & Google Search</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
