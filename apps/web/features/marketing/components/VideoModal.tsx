import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
}

export default function VideoModal({ isOpen, onClose, videoSrc }: VideoModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-2xl transition-all"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-6xl mx-4 aspect-video bg-black/50 border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(220,238,0,0.1)] ring-1 ring-white/5"
          >
            {/* Header/Controls bar */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-end z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
              <button
                onClick={onClose}
                className="pointer-events-auto bg-black/40 hover:bg-white/10 text-white/70 hover:text-white p-3 rounded-full backdrop-blur-xl transition-all duration-300 border border-white/10 hover:border-white/30 hover:scale-105 active:scale-95"
              >
                <X size={24} />
              </button>
            </div>

            {/* Video Player */}
            <video
              src={videoSrc}
              autoPlay
              controls
              className="w-full h-full object-cover"
              style={{ outline: 'none' }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
