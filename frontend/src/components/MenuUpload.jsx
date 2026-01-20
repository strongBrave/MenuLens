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
    <div className="flex justify-center items-center min-h-96">
      <div
        className={`w-full max-w-2xl p-12 border-4 border-dashed rounded-lg text-center transition ${
          dragActive
            ? 'border-indigo-600 bg-indigo-50'
            : 'border-blue-300 bg-blue-50 hover:border-blue-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-4xl mb-4">📸</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Menu Image</h2>
        <p className="text-gray-600 mb-4">
          Drag and drop your menu image here, or click to select
        </p>

        {fileName && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-green-300">
            <p className="text-sm text-green-700">✓ Selected: <strong>{fileName}</strong></p>
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={disabled}
          className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {disabled ? 'Processing...' : 'Choose Image'}
        </button>

        <p className="text-xs text-gray-500 mt-4">Supported: JPG, PNG, WebP (Max 10MB)</p>
      </div>
    </div>
  );
}
