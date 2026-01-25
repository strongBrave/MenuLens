import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Eat like a local, <br className="hidden md:block" /> anywhere.
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-10 font-light max-w-2xl mx-auto">
          Instant menu translation with AI-powered visual discovery.
        </p>
        <Link 
          href="https://app.menulens.com"
          className="inline-block bg-primary hover:bg-orange-600 text-white font-medium text-lg px-8 py-4 rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Try it Now
        </Link>
      </div>
    </section>
  );
}
