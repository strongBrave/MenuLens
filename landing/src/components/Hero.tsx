import Link from 'next/link';
import Image from 'next/image';

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

      {/* Navigation/Brand Header */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 md:p-8 bg-[#FDFBF7]/90 backdrop-blur-md shadow-sm border-b border-black/5 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="MenuLens Logo" 
                width={40} 
                height={40} 
                className="w-8 h-8 md:w-10 md:h-10"
              />
              <span className="font-serif font-bold text-soft-black text-xl md:text-2xl tracking-wide">
                MenuLens
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6 md:gap-8">
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">
                How it works
              </Link>
            </div>
            <Link 
              href="https://app.menulens.com"
              className="bg-primary text-white hover:bg-orange-600 px-5 py-2.5 rounded-full font-medium text-sm transition-colors"
            >
              Get App
            </Link>
          </div>
        </div>
      </nav>

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
