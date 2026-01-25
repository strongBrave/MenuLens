import Hero from '@/components/Hero';
import DemoVideo from '@/components/DemoVideo';
import MagicDemo from '@/components/MagicDemo';
import Features from '@/components/Features';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <DemoVideo />
      <MagicDemo />
      <Features />
      <Footer />
    </main>
  );
}
