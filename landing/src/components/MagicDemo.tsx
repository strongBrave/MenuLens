"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

const MENU_ITEMS = [
  {
    id: 'pizza',
    name: 'Pizza Margherita',
    desc: 'Classic tomato and mozzarella',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'sushi',
    name: 'Omakase Nigiri',
    desc: 'Chef\'s selection of premium fish',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'tacos',
    name: 'Tacos Al Pastor',
    desc: 'Marinated pork with pineapple',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=1000&auto=format&fit=crop'
  }
];

export default function MagicDemo() {
  const [activeId, setActiveId] = useState<string>(MENU_ITEMS[0].id);

  return (
    <section className="py-24 bg-warm-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl text-soft-black mb-4">
            See what you're ordering
          </h2>
          <p className="text-lg text-gray-600">
            Hover over the menu items to reveal the magic.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Menu List */}
          <div className="space-y-4">
            {MENU_ITEMS.map((item) => (
              <div
                key={item.id}
                onMouseEnter={() => setActiveId(item.id)}
                className={clsx(
                  "p-6 rounded-xl cursor-pointer transition-all duration-300 border-2",
                  activeId === item.id
                    ? "bg-white border-primary shadow-lg scale-105"
                    : "bg-white/50 border-transparent hover:bg-white hover:shadow-md"
                )}
              >
                <h3 className="font-serif text-2xl text-soft-black mb-1">{item.name}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Magic Window */}
          <div className="relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
            <AnimatePresence mode="wait">
              {MENU_ITEMS.map((item) => (
                activeId === item.id && (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${item.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 text-white">
                      <p className="text-sm font-medium uppercase tracking-wider mb-2 text-primary">Detected</p>
                      <h4 className="font-serif text-3xl">{item.name}</h4>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
