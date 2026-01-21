import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MenuGrid from './components/MenuGrid';
import LoadingState from './components/LoadingState';
import ErrorBoundary from './components/ErrorBoundary';
import DishDetailSidebar from './components/DishDetailSidebar';
import EmptyState from './components/EmptyState';
import { analyzeMenuText, searchDishImage } from './api/client';
import './index.css';

function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('upload'); // 'upload' | 'analyzing' | 'done'
  const [error, setError] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);

  const handleUpload = async (file) => {
    setError(null);
    setLoading(true);
    setStep('analyzing');
    setDishes([]);

    try {
      // 1. 快速获取文本结果
      const response = await analyzeMenuText(file);

      if (response.data.success) {
        const initialDishes = response.data.dishes || [];
        setDishes(initialDishes);
        setStep('done');
        setLoading(false);

        // 2. 异步加载图片 (乐观 UI)
        loadImagesForDishes(initialDishes);
      } else {
        setError(response.data.error || 'Failed to analyze menu');
        setStep('upload');
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      setStep('upload');
      setLoading(false);
      console.error('Error:', err);
    }
  };

  const loadImagesForDishes = async (initialDishes) => {
    // 并发控制：同时最多 3 个请求
    const CONCURRENT_LIMIT = 3;
    let index = 0;

    const fetchImage = async (dish) => {
      try {
        const res = await searchDishImage(dish);
        if (res.data.success && res.data.dishes && res.data.dishes.length > 0) {
          const updatedDish = res.data.dishes[0];
          
          setDishes(currentDishes => {
            const newDishes = [...currentDishes];
            const idx = newDishes.findIndex(d => d.original_name === dish.original_name); 
            if (idx !== -1) {
              newDishes[idx] = updatedDish;
            }
            return newDishes;
          });

          // 如果当前选中的菜品就是正在更新的这个，也需要同步更新 selectedDish
          setSelectedDish(currentSelected => {
            if (currentSelected && currentSelected.original_name === dish.original_name) {
              return updatedDish;
            }
            return currentSelected;
          });
        }
      } catch (e) {
        console.warn(`Failed to load image for ${dish.english_name}`, e);
      }
    };

    // 简单的并发执行器
    const runBatch = async () => {
      const promises = [];
      while (index < initialDishes.length) {
        const dish = initialDishes[index++];
        const p = fetchImage(dish);
        promises.push(p);
        
        if (promises.length >= CONCURRENT_LIMIT) {
          await Promise.race(promises);
          // 移除已完成的 promise (简化逻辑: 这里其实只是简单启动，更严谨的 pool 需要复杂逻辑，
          // 但对于 React 简单的 useEffect 场景，直接分批或者 map + limit 库更好。
          // 为了不引入新库，我们用简单的递归或者分块。)
        }
      }
      await Promise.all(promises);
    };

    // 更好的并发实现：递归
    const queue = [...initialDishes];
    const workers = Array(Math.min(CONCURRENT_LIMIT, queue.length))
      .fill(null)
      .map(async () => {
        while (queue.length > 0) {
          const dish = queue.shift();
          await fetchImage(dish);
        }
      });
      
    await Promise.all(workers);
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
              <div className="animate-fade-in w-full">
                 <MenuGrid dishes={dishes} onReset={()=>{}} onDishClick={setSelectedDish} />
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
