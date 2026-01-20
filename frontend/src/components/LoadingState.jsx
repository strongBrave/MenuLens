import React, { useState, useEffect } from 'react';

export default function LoadingState({ step }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-96">
      <div className="text-center">
        {/* 加载动画 */}
        <div className="flex justify-center mb-8">
          <div className="animate-spin">
            <div className="text-5xl">⚙️</div>
          </div>
        </div>

        {/* 进度阶段 */}
        <div className="mb-8">
          {step === 'analyzing' && (
            <div>
              <h2 className="text-2xl font-bold text-indigo-600 mb-2">
                Analyzing Menu{dots}
              </h2>
              <p className="text-gray-600">Using AI to identify dishes from your image</p>
              <div className="mt-4 w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-indigo-600 animate-pulse" style={{ width: '50%' }}></div>
              </div>
            </div>
          )}

          {step === 'searching' && (
            <div>
              <h2 className="text-2xl font-bold text-indigo-600 mb-2">
                Searching Images{dots}
              </h2>
              <p className="text-gray-600">Finding pictures for each dish</p>
              <div className="mt-4 w-48 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-indigo-600 animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* 提示文本 */}
        <p className="text-sm text-gray-500">This may take a few moments...</p>
      </div>
    </div>
  );
}
