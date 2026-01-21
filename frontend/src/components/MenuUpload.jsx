import React, { useRef, useState } from 'react';

export default function MenuUpload({ onUpload, disabled }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

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
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setFileName(file.name);
    onUpload(file);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`relative group cursor-pointer transition-all duration-300 ease-out transform
          ${dragActive ? 'scale-[1.02]' : 'hover:scale-[1.01]'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? handleClick : undefined}
      >
        {/* Background Glow Effect */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 ${dragActive ? 'opacity-60' : ''}`}></div>

        {/* Main Card Content */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 shadow-xl p-12 text-center overflow-hidden">
            
            {/* Dotted Pattern Background */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              disabled={disabled}
            />

            {/* Icon Circle */}
            <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
               <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {dragActive ? 'Drop it here!' : 'Upload Menu Photo'}
            </h3>
            
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Drag & drop your menu image here, or click to browse.
              <br/>
              <span className="text-xs text-gray-400 mt-2 block">Supports JPG, PNG, WebP • Max 10MB</span>
            </p>

            {/* Upload Button */}
            <button
              onClick={(e) => {
                  e.stopPropagation();
                  if(!disabled) handleClick();
              }}
              disabled={disabled}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              {disabled ? (
                  <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                  </span>
              ) : (
                  'Select File'
              )}
            </button>

            {fileName && (
              <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm font-medium animate-fade-in">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {fileName}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
