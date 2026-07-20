"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function Preloader({ children }: { children: React.ReactNode }) {
  const [isPreloading, setIsPreloading] = useState(true);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const lastShown = localStorage.getItem("axray_preloader_time");
    const now = new Date().getTime();

    // Show if never shown, or if it's been more than 15 mins (900000 ms)
    const shouldShow = !lastShown || (now - parseInt(lastShown) > 900000);

    if (shouldShow) {
      setIsPreloading(true);
      document.body.style.overflow = "hidden";

      // Hide the preloader after 4.5 seconds (gives time for slow drop + stay)
      const timer = setTimeout(() => {
        setIsPreloading(false);
        document.body.style.overflow = "auto";
        localStorage.setItem("axray_preloader_time", now.toString());
      }, 4500);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "auto";
      };
    } else {
      setIsPreloading(false);
    }
  }, []);

  if (!hasMounted) {
    return <div className="fixed inset-0 bg-[#131408] z-[99999]" />;
  }

  return (
    <>
      <AnimatePresence>
        {isPreloading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.4 } }}
            className="fixed inset-0 z-[99999] bg-[#131408] flex items-start justify-center overflow-hidden font-geist"
          >
            {/* The Yellow Board/Banner moving down */}
            <motion.div
              initial={{ y: "-150%" }}
              animate={{ y: 0 }}
              exit={{ y: "-150%", transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] } }}
              transition={{
                duration: 2.5,
                ease: [0.16, 0.1, 0.3, 1], // Slow, heavy ease out
              }}
              className="relative mt-0 w-full"
            >
              {/* The Main Yellow Screen/Board */}
              <div className="relative w-full bg-[#dcee00] border-b-[12px] sm:border-[12px] border-[#131408] shadow-[0_16px_0px_0px_rgba(229,227,207,0.1)] sm:shadow-[24px_24px_0px_0px_rgba(229,227,207,0.15)] p-6 sm:p-12 flex flex-col items-center justify-between min-h-[60vh] z-30">

                {/* Header Texts - "Bhara Bhara" */}
                <div className="w-full flex justify-between items-start mb-8 border-b-[6px] border-[#131408] pb-6">
                  <div className="flex flex-col">
                    <span className="font-mono-label font-bold text-xs md:text-sm uppercase tracking-[0.2em] text-[#131408]/70">Initiative By</span>
                    <span className="font-headline-lg font-black text-2xl md:text-4xl lg:text-5xl text-[#131408] uppercase tracking-tighter">We Make Devs</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-mono-label font-bold text-xs md:text-sm uppercase tracking-[0.2em] text-[#131408]/70">Powered By</span>
                    <span className="font-headline-lg font-black text-2xl md:text-4xl lg:text-5xl text-[#131408] uppercase tracking-tighter">SigNoz</span>
                  </div>
                </div>

                {/* Main AXRAY Title */}
                <div className="flex flex-col items-center my-auto w-full py-12">
                  <div className="flex items-center gap-6 md:gap-12 w-full justify-center">
                    <div className="hidden md:flex w-24 h-6 bg-[#131408]" />
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 md:w-28 md:h-28 bg-[#131408] border-[6px] border-[#dcee00] flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(19,20,8,0.3)] mb-8 transform -rotate-3 hover:rotate-0 transition-transform">
                        <Image src="/logo/axray-logo.png" alt="AXRAY Logo" width={56} height={56} className="object-contain w-auto h-auto" />
                      </div>
                      <h1 className="font-headline-lg text-7xl sm:text-8xl md:text-[140px] font-black text-[#131408] tracking-tighter uppercase leading-none text-center">
                        AXRAY
                      </h1>
                    </div>
                    <div className="hidden md:flex w-24 h-6 bg-[#131408]" />
                  </div>

                  <div className="mt-8 bg-[#131408] text-[#e5e3cf] px-8 py-3 font-bold text-sm md:text-xl tracking-[0.4em] uppercase shadow-[6px_6px_0px_0px_rgba(19,20,8,0.3)]">
                    Core Engine v1.0.0
                  </div>
                </div>

                {/* Footer text of the banner */}
                <div className="w-full flex justify-between items-end mt-12 border-t-[6px] border-[#131408] pt-6">
                  <p className="font-mono-label font-bold text-sm md:text-lg uppercase tracking-widest text-[#131408]/80">
                    SYSTEM_STARTUP //
                  </p>
                  <p className="font-headline-lg font-black text-xl md:text-3xl uppercase tracking-tighter text-[#131408]">
                    Exclusive Hackathon Build
                  </p>
                </div>

              </div>

              {/* Hanging Ropes and Logos at the bottom edge */}
              {/* Left Hanging Logo (WeMakeDevs) */}
              <div className="absolute top-[100%] left-[20%] md:left-[25%] flex flex-col items-center">
                {/* The Rope (Yellow so it's visible on black) */}
                <div className="w-4 h-24 md:h-32 bg-[#dcee00] z-20" />
                {/* The Logo Box */}
                <div className="w-24 h-24 md:w-36 md:h-36 bg-white border-[6px] border-[#dcee00] flex items-center justify-center relative -mt-2 z-30">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-[6px] border-[#dcee00] bg-[#131408] z-[-1]" />
                  <Image src="/logo/wemakedev.jpg" alt="WeMakeDevs" width={120} height={120} className="object-contain p-2" priority />
                </div>
              </div>

              {/* Right Hanging Logo (SigNoz) */}
              <div className="absolute top-[100%] right-[20%] md:right-[25%] flex flex-col items-center">
                {/* The Rope (Yellow so it's visible on black) */}
                <div className="w-4 h-32 md:h-48 bg-[#dcee00] z-20" />
                {/* The Logo Box */}
                <div className="w-24 h-24 md:w-36 md:h-36 bg-white border-[6px] border-[#dcee00] flex items-center justify-center relative -mt-2 z-30">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-[6px] border-[#dcee00] bg-[#131408] z-[-1]" />
                  <Image src="/logo/signoz.jpg" alt="SigNoz" width={120} height={120} className="object-contain p-3" priority />
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {!isPreloading && children}
    </>
  );
}
