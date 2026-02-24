import React, { useState, useEffect } from 'react';
import MasterPanel from './components/MasterPanel';
import DetailPanel from './components/DetailPanel';
import LoadingState from './components/LoadingState';
import ErrorBoundary from './components/ErrorBoundary';
import MobileDrawer from './components/MobileDrawer';
import AnnouncementModal from './components/AnnouncementModal';
import ValidationModal from './components/ValidationModal';
import SettingsModal from './components/SettingsModal';
import ChatWidget from './components/ChatWidget';
import { analyzeMenuText, searchDishImage } from './api/client';
import './index.css';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);
  return matches;
}

function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [showValidation, setShowValidation] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [imageProgress, setImageProgress] = useState({ current: 0, total: 0 });
  const [targetCurrency, setTargetCurrency] = useState('');
  const [sourceCurrency, setSourceCurrency] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);
  
  // New: Store the uploaded file URL for reference
  const [menuImageFile, setMenuImageFile] = useState(null);
  
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleUpload = async (file) => {
    // Note: Validation is now handled inside MasterPanel before calling this
    setError(null);
    setLoading(true);
    setDishes([]);
    setSelectedDish(null);
    setImageProgress({ current: 0, total: 0 });
    setMenuImageFile(file); // Store the file

    try {
      const response = await analyzeMenuText(file, targetLanguage, sourceCurrency);

      if (response.data.success) {
        const initialDishes = (response.data.dishes || []).map(d => ({ ...d, is_searching: true }));
        setDishes(initialDishes);
        setImageProgress({ current: 0, total: initialDishes.length });
        
        if (initialDishes.length > 0) {
          setSelectedDish(initialDishes[0]);
        }
        
        setLoading(false);
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
    const CONCURRENT_LIMIT = 3;
    let completed = 0;

    const fetchImage = async (dish) => {
      let finalDish = { ...dish, is_searching: false };

      try {
        const res = await searchDishImage(dish);
        if (res.data.success && res.data.dishes && res.data.dishes.length > 0) {
          finalDish = { ...res.data.dishes[0], is_searching: false };
        }
      } catch (e) {
        console.warn(`Failed to load image for ${dish.english_name}`, e);
      } finally {
        setDishes(currentDishes => {
          const newDishes = [...currentDishes];
          const idx = newDishes.findIndex(d => d.original_name === dish.original_name); 
          if (idx !== -1) {
            newDishes[idx] = finalDish;
          }
          return newDishes;
        });

        setSelectedDish(currentSelected => {
          if (currentSelected && currentSelected.original_name === dish.original_name) {
            return finalDish;
          }
          return currentSelected;
        });

        completed++;
        setImageProgress(prev => ({ ...prev, current: completed }));
      }
    };

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
    setImageProgress({ current: 0, total: 0 });
    setActiveFilters([]);
    setMenuImageFile(null);
  };

  // Filter Logic
  const filteredDishes = dishes.filter(dish => {
    if (activeFilters.length === 0) return true;
    if (!dish.dietary_tags) return false;
    return activeFilters.every(filter => dish.dietary_tags.includes(filter));
  });

  return (
    <ErrorBoundary>
      <div className="flex h-screen w-screen overflow-hidden bg-cream-50 font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-700">
        
        <AnnouncementModal 
          isOpen={showAnnouncement} 
          onClose={() => setShowAnnouncement(false)} 
        />

        <ValidationModal
          isOpen={showValidation}
          onClose={() => setShowValidation(false)}
        />

        {/* Left: Master Panel */}
        <MasterPanel 
          onUpload={handleUpload}
          isLoading={loading}
          onReset={handleReset}
          dishes={filteredDishes}
          allDishesCount={dishes.length}
          selectedDish={selectedDish}
          onSelectDish={setSelectedDish}
          imageProgress={imageProgress}
          targetCurrency={targetCurrency}
          setTargetCurrency={setTargetCurrency}
          sourceCurrency={sourceCurrency}
          setSourceCurrency={setSourceCurrency}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          activeFilters={activeFilters}
          setActiveFilters={setActiveFilters}
          showValidationModal={() => setShowValidation(true)}
          currentMenuFile={menuImageFile}
          showSettingsModal={showSettingsModal}
          setShowSettingsModal={setShowSettingsModal}
        />

        {/* Right: Detail Panel (Desktop Only) */}
        <main className="hidden md:block flex-1 relative h-full overflow-hidden bg-white shadow-xl z-10 border-l border-slate-100">
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
            <DetailPanel 
              dish={selectedDish} 
              key={selectedDish ? (selectedDish.original_name + selectedDish.english_name) : 'empty'}
              targetCurrency={targetCurrency}
            />
          )}
        </main>

        {/* AI Chat Widget */}
        <ChatWidget dishes={dishes} />

        {/* Mobile Drawer */}
        {isMobile && (
          <MobileDrawer 
            isOpen={!!selectedDish && !loading && !error} 
            onClose={() => setSelectedDish(null)} 
            dish={selectedDish} 
            targetCurrency={targetCurrency}
          />
        )}

      </div>
    </ErrorBoundary>
  );
}

export default App;
