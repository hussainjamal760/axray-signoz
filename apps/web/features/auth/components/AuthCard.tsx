"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { GithubLogo } from "@phosphor-icons/react";
import { startGithubAuth } from "../api/auth.api";

export const AuthCard = () => {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const moveX = useTransform(smoothX, [0, 1], [-30, 30]);
  const moveY = useTransform(smoothY, [0, 1], [-30, 30]);
  const moveXInverse = useTransform(smoothX, [0, 1], [30, -30]);
  const moveYInverse = useTransform(smoothY, [0, 1], [30, -30]);

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen w-full bg-black font-geist selection:bg-primary-fixed selection:text-black relative overflow-hidden flex items-center justify-center p-4">

      {/* 1. CRAZY BACKGROUND NOISE & GRID */}
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-primary-fixed) 2px, transparent 2px),
            linear-gradient(90deg, var(--color-primary-fixed) 2px, transparent 2px)
          `,
          backgroundSize: "100px 100px"
        }}
      ></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay pointer-events-none"></div>

      {/* 2. BACKGROUND SCROLLING MARQUEE (GIANT TEXT) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] -rotate-12 z-0 pointer-events-none flex flex-col gap-4 mix-blend-difference">
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 15 }}
          className="font-headline-xl text-[200px] md:text-[300px] text-white/5 whitespace-nowrap leading-none uppercase font-black"
        >
          SIGNOZ • WEMAKEDEVS • AXRAY • SIGNOZ • WEMAKEDEVS • AXRAY •
        </motion.div>
        <motion.div
          animate={{ x: [-2000, 0] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
          className="font-headline-xl text-[200px] md:text-[300px] text-transparent whitespace-nowrap leading-none uppercase font-black"
          style={{ WebkitTextStroke: "2px rgba(220, 238, 0, 0.2)" }}
        >
          OBSERVABILITY • FLIGHT RECORDER • OBSERVABILITY • FLIGHT RECORDER •
        </motion.div>
      </div>

      {/* TOP NAVIGATION */}
      <header className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-start z-50 pointer-events-auto">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-primary-fixed border-[4px] border-black flex items-center justify-center shadow-[4px_4px_0px_0px_theme(colors.primary-fixed)] group-hover:rotate-90 transition-transform duration-500">
            <div className="w-4 h-4 bg-black rounded-full animate-ping"></div>
          </div>
          <span className="font-headline-xl text-3xl font-black text-white uppercase tracking-tighter">
            AXRAY
          </span>
        </Link>
        <Link href="/" className="group flex items-center gap-2 border-[4px] border-outline-variant bg-black px-6 py-3 font-mono-label text-xs uppercase text-white hover:border-primary-fixed hover:bg-primary-fixed hover:text-black transition-all duration-300 shadow-[6px_6px_0px_0px_theme(colors.outline-variant)] hover:shadow-[6px_6px_0px_0px_theme(colors.primary-fixed)]">
          Back Home
        </Link>
      </header>

      {/* 3. MAIN CENTER PIECE (INTERACTIVE PARALLAX CONTAINER) */}
      <motion.div
        className="relative z-20 w-full max-w-4xl"
        style={{ x: moveX, y: moveY }}
      >
        {/* CROSSHAIRS */}
        <div className="absolute -top-12 -left-12 w-8 h-8 border-t-[4px] border-l-[4px] border-primary-fixed"></div>
        <div className="absolute -top-12 -right-12 w-8 h-8 border-t-[4px] border-r-[4px] border-primary-fixed"></div>
        <div className="absolute -bottom-12 -left-12 w-8 h-8 border-b-[4px] border-l-[4px] border-primary-fixed"></div>
        <div className="absolute -bottom-12 -right-12 w-8 h-8 border-b-[4px] border-r-[4px] border-primary-fixed"></div>

        <div className="bg-surface border-[8px] border-black p-8 md:p-16 shadow-[16px_16px_0px_0px_theme(colors.primary-fixed)] flex flex-col items-center text-center relative">

          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border-[4px] border-primary-fixed px-6 py-2">
            <span className="font-mono-label text-primary-fixed font-black uppercase tracking-[0.3em] text-xs">
              SYSTEM OVERRIDE REQUIRED
            </span>
          </div>

          <h1 className="font-headline-xl text-6xl md:text-[100px] leading-[0.85] text-white uppercase font-black tracking-tighter mt-8 mb-6 relative">
            Identify
            <br />
            <span className="text-primary-fixed">Yourself</span>
            {/* Glitch Layer */}
            <span className="absolute top-0 left-[2px] -z-10 text-error opacity-70">Identify<br />Yourself</span>
            <span className="absolute top-0 -left-[2px] -z-10 text-secondary-fixed opacity-70">Identify<br />Yourself</span>
          </h1>

          <p className="font-mono-label text-on-surface-variant max-w-lg mb-12 uppercase tracking-widest leading-loose text-sm">
            You are entering the AXRAY tracing mainframe. Connect your developer identity to initiate the flight recorder.
          </p>

          {/* MASSIVE BUTTON */}
          <button
            onClick={startGithubAuth}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative w-full max-w-lg bg-primary-fixed text-black border-[6px] border-black h-24 sm:h-32 flex items-center justify-center overflow-hidden active:scale-95 transition-transform duration-150 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[12px] hover:translate-y-[12px]"
          >
            {/* Sliding background on hover */}
            <div className="absolute inset-0 bg-black translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] z-0"></div>

            {/* Marquee text on hover */}
            <div className="absolute inset-0 flex items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-difference overflow-hidden">
              <motion.div
                animate={{ x: [0, -1000] }}
                transition={{ repeat: Infinity, ease: "linear", duration: 5 }}
                className="whitespace-nowrap font-headline-xl text-4xl text-primary-fixed uppercase font-black tracking-widest"
              >
                INITIALIZE • INITIALIZE • INITIALIZE • INITIALIZE • INITIALIZE •
              </motion.div>
            </div>

            <div className="relative z-20 flex items-center gap-6 group-hover:opacity-0 transition-opacity duration-300">
              <GithubLogo weight="fill" className="w-12 h-12 sm:w-16 sm:h-16" />
              <span className="font-headline-xl text-3xl sm:text-5xl font-black uppercase tracking-tighter">
                Access
              </span>
            </div>
          </button>

          <p className="font-mono-label text-[8px] text-on-surface-variant/80 uppercase mt-8 tracking-widest max-w-sm">
            By continuing, you approve our{" "}
            <Link href="/terms" className="text-primary-fixed hover:text-white underline decoration-2 underline-offset-4 font-black transition-colors">
              Terms
            </Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-primary-fixed hover:text-white underline decoration-2 underline-offset-4 font-black transition-colors">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </motion.div>

      {/* 4. FLOATING STICKERS (LOGOS) WITH PARALLAX REVERSE */}
      {/* We Make Devs Sticker */}
      <motion.div
        className="absolute top-20 right-10 md:right-32 z-30 group"
        style={{ x: moveXInverse, y: moveYInverse, rotate: 12 }}
        whileHover={{ scale: 1.1, rotate: 0 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 z-0"></div>
          <div className="bg-white border-[6px] border-black p-4 relative z-10 flex flex-col items-center">
            <div className="bg-black text-white font-mono-label text-[10px] uppercase font-black tracking-widest px-2 py-1 absolute -top-4 -left-4 border-[2px] border-black">
              TRACK 01
            </div>
            <Image src="/logo/wemakedev.jpg" alt="WeMakeDevs" width={160} height={60} className="object-contain filter contrast-125" />
          </div>
          <div className="absolute -right-6 -bottom-6 w-12 h-12 bg-primary-fixed rounded-full border-[4px] border-black flex items-center justify-center z-20 animate-[spin_10s_linear_infinite]">
            <span className="font-mono-label text-[10px] font-black">*</span>
          </div>
        </div>
      </motion.div>

      {/* SigNoz Sticker */}
      <motion.div
        className="absolute bottom-20 left-10 md:left-32 z-30 group"
        style={{ x: moveXInverse, y: moveYInverse, rotate: -8 }}
        whileHover={{ scale: 1.1, rotate: 0 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary-fixed translate-x-3 translate-y-3 z-0 border-[4px] border-black"></div>
          <div className="bg-black border-[6px] border-black p-4 relative z-10 flex flex-col items-center shadow-inner">
            <div className="bg-primary-fixed text-black font-mono-label text-[10px] uppercase font-black tracking-widest px-2 py-1 absolute -bottom-4 -right-4 border-[2px] border-black">
              POWERED BY
            </div>
            <div className="bg-white px-4 py-2 border-[4px] border-black">
              <Image src="/logo/signoz.jpg" alt="SigNoz" width={140} height={50} className="object-contain" />
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
};
