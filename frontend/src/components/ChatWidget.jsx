import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../api/client';

export default function ChatWidget({ dishes }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your AI Dining Assistant. Ask me anything about the menu! 🍽️" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // If no dishes, don't show the widget at all (or show disabled)
  if (!dishes || dishes.length === 0) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send context: dishes + history (excluding initial greeting)
      const history = messages.slice(1); 
      const response = await sendChatMessage(userMessage.content, dishes, history);
      
      if (response.data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.data.reply }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the chef right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-orange-200 flex flex-col overflow-hidden"
          >
            {/* Header - Explicit Orange-600 */}
            <div className="bg-orange-600 p-4 flex justify-between items-center text-white shrink-0 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-full border border-white/30 backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight">Dining Assistant</h3>
                  <p className="text-xs text-orange-100 flex items-center gap-1 opacity-90">
                    <Sparkles className="w-3 h-3" /> Powered by Gemini
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages - Explicit Cream Background */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FFF8F0] custom-scrollbar">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                    msg.role === 'assistant' 
                      ? 'bg-white border-orange-200 text-orange-600' 
                      : 'bg-orange-600 border-orange-600 text-white'
                  }`}>
                    {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'assistant' 
                      ? 'bg-white text-slate-700 border border-orange-100 rounded-tl-none' 
                      : 'bg-orange-600 text-white rounded-tr-none shadow-orange-200'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-orange-200 text-orange-600 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white border border-orange-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Explicit Styles */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-orange-100 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about budget, taste..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all text-sm text-slate-800 placeholder:text-slate-400"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:hover:bg-orange-600 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB - Explicit Orange-600 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-colors relative border-4 border-white/20 backdrop-blur-sm"
      >
        {isOpen ? <X className="w-8 h-8" /> : <Bot className="w-8 h-8" />}
        
        {/* Pulse effect if not open */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
