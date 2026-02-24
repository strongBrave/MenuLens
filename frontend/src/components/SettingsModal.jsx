import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Bot, Image, Sparkles, Check, Eye, EyeOff, Save, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'menulens_api_settings';

const DEFAULT_SETTINGS = {
  llmApiKey: '',
  llmBaseUrl: 'https://www.dmxapi.cn/v1',
  llmModel: 'gemini-2.5-flash-lite',
  llmTemperature: '0.2',
  llmTimeout: '30',
  imageApiKey: '',
  imageModel: 'dall-e-3',
  imageEnabled: false,
  enableRagPipeline: true,
  imageVerifyThreshold: '0.7',
};

export default function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [showApiKeys, setShowApiKeys] = useState({ llm: false, image: false });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] flex flex-col"
          >
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-center relative overflow-hidden shrink-0">
              <div className="absolute top-0 left-0 w-full h-full bg-white/10" 
                style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4) 0%, transparent 70%)' }} 
              />
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Settings className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">API 配置</h2>
              </div>
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
                  <Bot className="w-4 h-4 text-violet-600" />
                  LLM API 配置
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKeys.llm ? 'text' : 'password'}
                      value={settings.llmApiKey}
                      onChange={(e) => updateSetting('llmApiKey', e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm py-2.5 pl-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKeys(prev => ({ ...prev, llm: !prev.llm }))}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showApiKeys.llm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Base URL</label>
                    <input
                      type="text"
                      value={settings.llmBaseUrl}
                      onChange={(e) => updateSetting('llmBaseUrl', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm py-2.5 pl-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Model</label>
                    <input
                      type="text"
                      value={settings.llmModel}
                      onChange={(e) => updateSetting('llmModel', e.target.value)}
                      placeholder="gemini-2.5-flash-lite"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm py-2.5 pl-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Temperature</label>
                    <input
                      type="text"
                      value={settings.llmTemperature}
                      onChange={(e) => updateSetting('llmTemperature', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm py-2.5 pl-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Timeout (秒)</label>
                    <input
                      type="text"
                      value={settings.llmTimeout}
                      onChange={(e) => updateSetting('llmTimeout', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm py-2.5 pl-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Image className="w-4 h-4 text-indigo-600" />
                    图片生成 API
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-slate-500">启用</span>
                    <div 
                      onClick={() => updateSetting('imageEnabled', !settings.imageEnabled)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${settings.imageEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.imageEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                </div>
                
                {settings.imageEnabled && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">API Key</label>
                      <div className="relative">
                        <input
                          type={showApiKeys.image ? 'text' : 'password'}
                          value={settings.imageApiKey}
                          onChange={(e) => updateSetting('imageApiKey', e.target.value)}
                          placeholder="sk-..."
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm py-2.5 pl-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKeys(prev => ({ ...prev, image: !prev.image }))}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {showApiKeys.image ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Model</label>
                      <input
                        type="text"
                        value={settings.imageModel}
                        onChange={(e) => updateSetting('imageModel', e.target.value)}
                        placeholder="dall-e-3"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm py-2.5 pl-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  高级选项
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">启用 RAG Pipeline</span>
                  <div 
                    onClick={() => updateSetting('enableRagPipeline', !settings.enableRagPipeline)}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${settings.enableRagPipeline ? 'bg-green-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.enableRagPipeline ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">图片匹配阈值</label>
                  <input
                    type="text"
                    value={settings.imageVerifyThreshold}
                    onChange={(e) => updateSetting('imageVerifyThreshold', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm py-2.5 pl-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center justify-center gap-2 flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  saved 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white'
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" /> 已保存
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> 保存配置
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function getApiSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to get API settings:', e);
  }
  return null;
}
