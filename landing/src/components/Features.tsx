import { Languages, Coins, Bot, Image as ImageIcon } from 'lucide-react';

const FEATURES = [
  {
    icon: Languages,
    title: "Global Translation",
    desc: "Instantly translate menus from any language to your native tongue."
  },
  {
    icon: Coins,
    title: "Smart Currency",
    desc: "Convert prices to your home currency with real-time exchange rates."
  },
  {
    icon: Bot,
    title: "AI Assistant",
    desc: "Get personalized recommendations and dietary advice from our AI."
  },
  {
    icon: ImageIcon,
    title: "Visual Discovery",
    desc: "See delicious photos of every dish before you order."
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-serif text-4xl text-soft-black mb-6">Understand what you eat, anywhere in the world.</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            MenuLens combines advanced AI vision with real-time data to turn confusing text menus into clear, visual, and translated experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-50 text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon size={32} />
              </div>
              <h3 className="font-serif text-2xl text-soft-black mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
