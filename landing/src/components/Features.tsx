import { Scan, Sparkles, Utensils } from 'lucide-react';

const FEATURES = [
  {
    icon: Scan,
    title: "Snap a photo",
    desc: "Simply take a picture of any menu, in any language."
  },
  {
    icon: Sparkles,
    title: "AI Analysis",
    desc: "Our AI identifies dishes and translates them instantly."
  },
  {
    icon: Utensils,
    title: "Eat with confidence",
    desc: "See photos of every dish and know exactly what you're getting."
  }
];

export default function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12">
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
