import { useState, useRef } from "react";
import { FiPlay, FiPause, FiVolume2, FiVolumeX } from "react-icons/fi";

interface DemoVideoProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function DemoVideo({
  src,
  poster,
  className = "",
}: DemoVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className={`relative group rounded-2xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur shadow-2xl ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={poster}
        muted={isMuted}
        loop
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/quicktime" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
          >
            <FiPlay className="h-8 w-8 ml-1" />
          </button>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-200 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white transition-all duration-200 hover:bg-white/20"
          >
            {isPlaying ? (
              <FiPause className="h-4 w-4" />
            ) : (
              <FiPlay className="h-4 w-4 ml-0.5" />
            )}
          </button>

          <button
            onClick={toggleMute}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white transition-all duration-200 hover:bg-white/20"
          >
            {isMuted ? (
              <FiVolumeX className="h-4 w-4" />
            ) : (
              <FiVolume2 className="h-4 w-4" />
            )}
          </button>

          <div className="flex-1" />
          <span className="text-white/80 text-sm font-medium">SyncAI Demo</span>
        </div>
      </div>
    </div>
  );
}
