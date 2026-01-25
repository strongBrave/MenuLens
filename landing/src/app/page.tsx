import Hero from '@/components/Hero';
import MagicDemo from '@/components/MagicDemo';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <MagicDemo />
      <Features />
      <Footer />
    </main>
  );
}
