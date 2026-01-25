import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, AlertTriangle, Mail, Zap } from 'lucide-react';

export default function AnnouncementModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Header Decoration */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-500 via-purple-500 to-pink-500" />

            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-brand-50 rounded-xl text-brand-600 shrink-0">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Welcome to MenuLens</h2>
                  <p className="text-slate-500 text-sm mt-1">System Announcement & Updates</p>
                </div>
                <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-cream-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content List */}
              <div className="space-y-4 mb-8">
                {/* Item 1: Trial Operation */}
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                     <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Beta Version</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                      MenuLens is currently in beta. Due to cost constraints, AI Image Generation is temporarily disabled; we are using high-accuracy search matching instead.
                    </p>
                  </div>
                </div>

                {/* Item 2: Performance */}
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                     <AlertTriangle className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Performance Notice</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                      Due to API rate limits, processing menus with more than 10 dishes may take a little longer. We appreciate your patience!
                    </p>
                  </div>
                </div>

                {/* Item 3: Contact */}
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                     <Mail className="w-5 h-5 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Contact & Support</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                      Have suggestions or feature requests? We'd love to hear from you:<br/>
                      <a href="mailto:yu1791046157@gmail.com" className="text-brand-600 font-medium hover:underline">
                        yu1791046157@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
