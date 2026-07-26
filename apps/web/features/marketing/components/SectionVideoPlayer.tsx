"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export default function SectionVideoPlayer() {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-12 rounded-[2rem] overflow-hidden border border-outline-variant/30 shadow-[0_0_60px_rgba(0,0,0,0.5)] group cursor-pointer" onClick={toggleMute}>
      {/* Logos in corners */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-sm pointer-events-none">
        <Image src="/logo/wemakedev.jpg" alt="WeMakeDevs" width={80} height={28} className="object-contain rounded" />
      </div>
      <div className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-sm pointer-events-none">
        <Image src="/logo/signoz.jpg" alt="SigNoz" width={80} height={28} className="object-contain rounded" />
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        src="/demo.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto aspect-video object-cover"
      />

      {/* Click to unmute overlay hint (disappears when hovered or unmuted) */}
      <motion.div 
        initial={{ opacity: 1 }}
        animate={{ opacity: isMuted ? 1 : 0 }}
        className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none transition-opacity duration-300 group-hover:bg-black/10"
      >
        {isMuted && (
          <div className="px-6 py-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-white flex items-center gap-3 shadow-lg transform transition-transform group-hover:scale-105">
            <VolumeX size={20} />
            <span className="font-semibold tracking-wide text-sm">Click to Unmute</span>
          </div>
        )}
      </motion.div>

      {/* Persistent sound indicator bottom right */}
      <div className="absolute bottom-4 right-4 z-20 p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-sm text-white transition-transform hover:scale-110 active:scale-95">
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-primary-fixed drop-shadow-[0_0_5px_currentColor]" />}
      </div>
    </div>
  );
}
