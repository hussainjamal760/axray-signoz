"use client";

import Link from "next/link";
import Image from "next/image";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

interface NavbarProps {
  activePath?: string;
  isSticky?: boolean;
}

export function Navbar({ activePath, isSticky = false }: NavbarProps) {
  const { data, isLoading } = useCurrentUser();
  const isAuthenticated = !!data?.authenticated;

  const navCta = isLoading ? null : (
    <Link
      href={isAuthenticated ? "/sessions" : "/auth"}
      className="group relative inline-flex h-8 md:h-9 items-center justify-center overflow-hidden border-[3px] border-primary-fixed bg-background px-4 md:px-6 font-cta-label text-[10px] md:text-xs uppercase text-primary-fixed transition-all hover:scale-105 active:scale-95"
    >
      <span className="absolute inset-0 -translate-y-full bg-primary-fixed transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:translate-y-0"></span>
      <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-black font-black tracking-widest whitespace-nowrap">
        {isAuthenticated ? "Sessions" : "Login GitHub"}
        <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
          arrow_outward
        </span>
      </span>
    </Link>
  );

  const links = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "How it Works" },
    { href: "/docs", label: "Docs" },
  ];

  return (
    <header className={`${isSticky ? "sticky" : "fixed"} top-0 z-50 h-16 flex w-full pointer-events-none`}>
      {/* Left Side Bar - Flexible width */}
      <div className="flex-1 max-w-[20px] md:max-w-[120px] h-10 bg-background z-20 relative min-w-0 pointer-events-auto border-b-[3px] border-primary-fixed"></div>

      {/* Responsive Notch Container */}
      <div className="flex h-16 relative z-10 shrink-0 flex-1 pointer-events-auto">
        {/* Left Curve */}
        <div className="w-[30px] h-full relative shrink-0">
          <div className="absolute inset-0 bg-background" style={{ clipPath: "path('M0 0 H30 V64 C15 64 15 40 0 40 Z')" }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 30 64">
            <path d="M0 38.5 C15 38.5 15 62.5 30 62.5" fill="none" className="stroke-primary-fixed" strokeWidth="3" />
          </svg>
        </div>

        {/* Center Content Area */}
        <div className="flex-1 h-full relative min-w-0 bg-background border-b-[3px] border-primary-fixed flex items-end justify-between pb-2.5 px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Image src="/logo/axray-logo.png" alt="AXRAY Logo" width={28} height={28} className="object-contain w-auto h-auto group-hover:rotate-12 transition-transform" />
            <span className="font-headline-lg text-lg font-black tracking-tighter text-white uppercase hidden sm:inline-block">AXRAY</span>
          </Link>

          {/* Links */}
          <div className="hidden lg:flex gap-6 items-center shrink-0">
            {links.map((link) => {
              const isActive = activePath === link.href;
              return (
                <Link
                  key={link.label}
                  className={
                    isActive
                      ? "text-primary-fixed font-cta-label underline decoration-3 underline-offset-8 transition-transform active:translate-x-[2px] active:translate-y-[2px]"
                      : "text-on-surface font-cta-label hover:text-primary-fixed transition-colors"
                  }
                  href={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="shrink-0 flex items-center mb-1">
            {navCta}
          </div>
        </div>

        {/* Right Curve */}
        <div className="w-[30px] h-full relative shrink-0">
          <div className="absolute inset-0 bg-background" style={{ clipPath: "path('M0 0 H30 V40 C15 40 15 64 0 64 Z')" }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 30 64">
            <path d="M0 62.5 C15 62.5 15 38.5 30 38.5" fill="none" className="stroke-primary-fixed" strokeWidth="3" />
          </svg>
        </div>
      </div>

      {/* Right Side Bar */}
      <div className="flex-1 max-w-[20px] md:max-w-[120px] h-10 bg-background z-20 relative min-w-0 pointer-events-auto border-b-[3px] border-primary-fixed"></div>
    </header>
  );
}
