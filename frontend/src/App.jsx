import React, { useState } from 'react';
import MasterPanel from './components/MasterPanel';
import DetailPanel from './components/DetailPanel';
import LoadingState from './components/LoadingState';
import ErrorBoundary from './components/ErrorBoundary';
import { analyzeMenuText, searchDishImage } from './api/client';
import './index.css';

function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);

  const handleUpload = async (file) => {
    setError(null);
    setLoading(true);
    setDishes([]);
    setSelectedDish(null);

    try {
      // 1. 快速获取文本结果
      const response = await analyzeMenuText(file);

      if (response.data.success) {
        const initialDishes = response.data.dishes || [];
        setDishes(initialDishes);
        
        // 自动选中第一个菜品 (Optimistic)
        if (initialDishes.length > 0) {
          setSelectedDish(initialDishes[0]);
        }
        
        setLoading(false);

        // 2. 异步加载图片 (乐观 UI)
        loadImagesForDishes(initialDishes);
      } else {
        setError(response.data.error || 'Failed to analyze menu');
        setLoading(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      setLoading(false);
      console.error('Error:', err);
    }
  };

  const loadImagesForDishes = async (initialDishes) => {
    // 并发控制：同时最多 3 个请求
    const CONCURRENT_LIMIT = 3;
    let completedCount = 0;

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
      } finally {
        completedCount++;
      }
    };

    // 更好的并发实现：递归 Worker Queue
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
    setError(null);
    setSelectedDish(null);
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
        
        {/* Left: Master Panel (Input + List) */}
        <MasterPanel 
          onUpload={handleUpload}
          isLoading={loading}
          onReset={handleReset}
          dishes={dishes}
          selectedDish={selectedDish}
          onSelectDish={setSelectedDish}
          hasResults={dishes.length > 0}
        />

        {/* Right: Detail Panel (Main View) */}
        <main className="flex-1 relative h-full overflow-hidden bg-white shadow-xl z-10">
          {error ? (
            <div className="flex items-center justify-center h-full p-8 text-red-600 bg-red-50">
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2">Error</h3>
                <p>{error}</p>
              </div>
            </div>
          ) : loading ? (
            <div className="h-full flex items-center justify-center">
               <LoadingState step="analyzing" />
            </div>
          ) : (
            <DetailPanel dish={selectedDish} />
          )}
        </main>

      </div>
    </ErrorBoundary>
  );
}

export default App;
