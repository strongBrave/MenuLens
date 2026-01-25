import { Play } from 'lucide-react';

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
          
          {/* Placeholder Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/20">
              <Play size={32} className="ml-1" fill="currentColor" />
            </div>
            <span className="font-medium text-lg tracking-wide">Watch Demo</span>
          </div>

          {/* 
            TODO: Replace the placeholder above with your video embed code.
            
            Example for YouTube:
            <iframe 
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID" 
              title="MenuLens Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>

            Example for HTML5 Video:
            <video 
              className="absolute inset-0 w-full h-full object-cover"
              controls
              poster="/path/to/poster.jpg"
            >
              <source src="/path/to/video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          */}
        </div>
      </div>
    </section>
  );
}
