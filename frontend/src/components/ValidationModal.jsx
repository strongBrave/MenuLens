import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Banknote, DollarSign, X, CheckCircle2 } from 'lucide-react';

export default function ValidationModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop with Blur */}
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
            <div className="bg-indigo-600 p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-50" 
                   style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4) 0%, transparent 70%)' }} 
              />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Almost Ready!</h2>
                <p className="text-indigo-100 text-sm">Please select your preferences first</p>
              </div>
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation List */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Output Language</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Which language should we use to describe the dishes to you? (e.g., Translate Japanese dishes into English)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Menu Currency (Source)</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    What currency is on the menu? This helps AI understand that "1200" means "1200 JPY", not USD.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">My Currency (Target)</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    We will instantly convert all prices into this currency for you (e.g., Show prices in USD).
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={onClose}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-slate-200 mt-2 active:scale-[0.98]"
              >
                Okay, I'll select them
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
