export default function DemoVideo() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* ... Header text ... */}

        {/* 修改点：移除 aspect-video，移除 absolute/relative 限制，让容器自适应 */}
        <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-2xl overflow-hidden group">
          
          <video 
            src="/demo.mp4" 
            poster="/demo.jpg" 
            controls 
            playsInline
            // 修改点：移除 h-full，确保 video 撑开父容器，使用 w-full
            className="w-full h-auto object-contain" 
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}