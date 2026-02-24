import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Bot, Image, Sparkles, Check } from 'lucide-react';

// Available LLM models
const LLM_MODELS = [
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (推荐)' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash Lite' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
];

// Available image generation models
const IMAGE_MODELS = [
  { value: 'dall-e-3', label: 'DALL-E 3 (推荐)' },
  { value: 'dall-e-2', label: 'DALL-E 2' },
  { value: 'imagen-3-generate_002', label: 'Imagen 3' },
];

const STORAGE_KEY = 'menulens_model_settings';

export default function SettingsModal({ isOpen, onClose }) {
  const [llmModel, setLlmModel] = useState('gemini-2.5-flash-lite');
  const [imageModel, setImageModel] = useState('dall-e-3');
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setLlmModel(parsed.llmModel || 'gemini-2.5-flash-lite');
        setImageModel(parsed.imageModel || 'dall-e-3');
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    const settings = { llmModel, imageModel };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setLlmModel('gemini-2.5-flash-lite');
    setImageModel('dall-e-3');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-50" 
                style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4) 0%, transparent 70%)' }} 
              />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30">
                  <Settings className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">模型配置</h2>
                <p className="text-indigo-100 text-sm font-medium">Configure AI Models</p>
              </div>
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Settings Form */}
            <div className="p-6 md:p-8 space-y-6">
              {/* LLM Model */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                  <Bot className="w-4 h-4 text-violet-600" />
                  LLM 模型 (菜单识别)
                </label>
                <div className="relative">
                  <select 
                    value={llmModel}
                    onChange={(e) => setLlmModel(e.target.value)}
                    className="w-full appearance-none bg-violet-50 border border-violet-200 text-slate-800 text-sm font-medium py-3 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer hover:bg-violet-100 transition-colors"
                  >
                    {LLM_MODELS.map(model => (
                      <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                  </select>
                  <Bot className="absolute left-3 top-3 w-4 h-4 text-violet-500 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  用于识别菜单中的菜品、翻译和生成描述
                </p>
              </div>

              {/* Image Generation Model */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                  <Image className="w-4 h-4 text-indigo-600" />
                  图片生成模型
                </label>
                <div className="relative">
                  <select 
                    value={imageModel}
                    onChange={(e) => setImageModel(e.target.value)}
                    className="w-full appearance-none bg-indigo-50 border border-indigo-200 text-slate-800 text-sm font-medium py-3 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer hover:bg-indigo-100 transition-colors"
                  >
                    {IMAGE_MODELS.map(model => (
                      <option key={model.value} value={model.value}>{model.label}</option>
                    ))}
                  </select>
                  <Image className="absolute left-3 top-3 w-4 h-4 text-indigo-500 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  启用 AI 生图功能时使用 (实验性)
                </p>
              </div>

              {/* Info Badge */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  设置将保存在浏览器本地，重启后保留。如需更改模型，下次上传菜单时将使用新配置。
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                >
                  重置默认
                </button>
                <button
                  onClick={handleSave}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all shadow-lg ${
                    saved 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white'
                  }`}
                >
                  {saved ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" /> 已保存
                    </span>
                  ) : '保存设置'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Helper function to get settings from localStorage
export function getModelSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to get model settings:', e);
  }
  return { llmModel: null, imageModel: null };
}
