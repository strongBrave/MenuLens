

export default function DemoVideo() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-serif text-4xl text-gray-900 mb-6">See MenuLens in Action</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Watch how easy it is to translate and visualize any menu in seconds.
          </p>
        </div>

        {/* Video Container - 16:9 Aspect Ratio */}
        <div className="relative w-full max-w-4xl mx-auto aspect-video bg-gray-900 rounded-2xl shadow-2xl overflow-hidden group cursor-pointer">
          
          <video 
            src="/demo.mp4" 
            poster="/demo.jpg" 
            controls 
            playsInline
            className="w-full h-full object-cover rounded-xl shadow-2xl"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
