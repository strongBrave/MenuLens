import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-soft-black text-white py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <h2 className="font-serif text-2xl font-bold">MenuLens</h2>
          <p className="text-gray-400 text-sm mt-2">© {new Date().getFullYear()} MenuLens. All rights reserved.</p>
        </div>
        
        <div className="flex gap-8">
          <Link href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
          <Link href="#" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
