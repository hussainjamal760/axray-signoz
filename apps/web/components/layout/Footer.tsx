"use client";

import Link from "next/link";
import Image from "next/image";

interface FooterProps {
  variant?: "home" | "standard";
}

export function Footer({ variant = "standard" }: FooterProps) {
  if (variant === "home") {
    return (
      <footer className="w-full mt-auto bg-surface-container-lowest border-t-[3px] border-outline-variant">
        <div className="flex flex-col lg:flex-row justify-between items-center w-full px-margin py-12 gap-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col gap-6 items-center lg:items-start text-center lg:text-left">
            <Link href="/" className="flex items-center gap-4 group">
              <Image
                src="/logo/axray-logo.png"
                alt="AXRAY Logo"
                width={32}
                height={32}
                className="object-contain w-auto h-auto group-hover:rotate-12 transition-transform"
              />
              <span className="font-headline-lg-mobile text-2xl font-black text-white uppercase tracking-tighter">
                AXRAY
              </span>
            </Link>
            <p className="font-mono-label text-xs text-on-surface-variant font-bold uppercase tracking-widest max-w-xs">
              © 2026 AXRAY. Built for the machine era by WeMakeDevs Track 01.
            </p>
          </div>

          <div className="flex gap-x-8 gap-y-4 flex-wrap justify-center">
            {['Terms', 'Privacy', 'Security', 'Changelog'].map((link) => (
              <Link key={link} className="text-on-surface font-mono-label text-xs font-black hover:text-primary-fixed transition-colors uppercase tracking-[0.2em]" href={`/${link.toLowerCase()}`}>
                {link}
              </Link>
            ))}
            <Link className="text-on-surface font-mono-label text-xs font-black hover:text-primary-fixed transition-colors uppercase tracking-[0.2em] flex items-center gap-3 bg-surface-container px-3 py-1 border-[2px] border-outline-variant" href="#">
              <div className="w-2 h-2 bg-primary-fixed shadow-[0_0_8px_var(--color-primary-fixed)] animate-pulse"></div>
              All Systems Operational
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t-[4px] border-black bg-surface relative z-30 py-12 md:py-16 mt-24">
      <div className="px-margin max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <Image
              src="/logo/axray-logo.png"
              alt="AXRAY Logo"
              width={32}
              height={32}
              className="object-contain w-auto h-auto group-hover:rotate-12 transition-transform"
            />
            <span className="font-headline-lg-mobile text-2xl font-black text-white uppercase tracking-tighter">
              AXRAY
            </span>
          </Link>
          <p className="font-mono-label text-xs text-on-surface-variant font-bold uppercase tracking-widest max-w-xs text-center md:text-left">
            © 2026 AXRAY. Built for the machine era by WeMakeDevs Track 01.
          </p>
        </div>

        <div className="flex gap-x-8 gap-y-4 flex-wrap justify-center">
          {['Terms', 'Privacy', 'Security', 'Changelog'].map((link) => (
            <Link key={link} className="text-on-surface font-mono-label text-xs font-black hover:text-primary-fixed transition-colors uppercase tracking-[0.2em]" href={`/${link.toLowerCase()}`}>
              {link}
            </Link>
          ))}
          <Link className="text-on-surface font-mono-label text-xs font-black hover:text-primary-fixed transition-colors uppercase tracking-[0.2em] flex items-center gap-3 bg-surface-container px-3 py-1 border-[2px] border-outline-variant" href="#">
            <div className="w-2 h-2 bg-primary-fixed shadow-[0_0_8px_var(--color-primary-fixed)] animate-pulse"></div>
            All Systems Operational
          </Link>
        </div>
      </div>
    </footer>
  );
}
