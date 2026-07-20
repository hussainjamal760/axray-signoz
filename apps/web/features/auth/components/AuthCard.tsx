import Image from "next/image";
import Link from "next/link";
import {
  GithubLogo,
  ShieldCheck,
  LockKey,
  Key,
  GitBranch,
  Cpu,
  CodeSimple,
  Database,
} from "@phosphor-icons/react";
import { startGithubAuth } from "../api/auth.api";

export const AuthCard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background font-geist selection:bg-primary-fixed selection:text-on-primary relative overflow-hidden w-full">
      {/* Background Decoratives - Filling the page */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-surface-container-highest/50 border-l-[3px] border-on-background -z-20"></div>
      <div className="absolute top-1/4 left-0 w-[40vw] h-[40vw] bg-primary-fixed/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] bg-secondary-fixed/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Floating abstract code background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden select-none -z-15 font-mono text-[10px] whitespace-pre p-4 leading-relaxed">
        {`const axray = new Agent();\naxray.connect({ repo: 'user/app' });\nwhile(!axray.solved) { axray.plan().execute(); }\nconsole.log("Deployed successfully.");\n`.repeat(100)}
      </div>

      {/* TopNavBar */}
      <header className="w-full top-0 sticky z-50 bg-background/95 backdrop-blur-sm border-b-[3px] border-on-background shadow-sm">
        <div className="flex justify-between items-center w-full px-margin py-4 max-w-full mx-auto">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo/axray-logo.png"
              alt="AXRAY Logo"
              width={32}
              height={32}
              className="object-contain group-hover:scale-110 transition-transform w-auto h-auto"
            />
            <span className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-surface uppercase">
              AXRAY
            </span>
          </Link>
          <div className="hidden md:flex gap-8 items-center bg-surface-container border-2 border-on-background px-6 py-2 shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all">
            <Link
              className="text-on-surface-variant font-mono-label text-mono-label uppercase hover:text-primary-fixed transition-colors"
              href="/"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 w-full max-w-[1400px] mx-auto">
        {/* Wide Card Container */}
        <div className="border-[3px] border-on-background bg-[#181912] shadow-block relative z-10 w-full flex flex-col lg:flex-row overflow-hidden">
          {/* Left Side: Auth Section (Wider) */}
          <div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            {/* Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-bright border-2 border-on-background mb-8 w-fit shadow-[2px_2px_0px_rgba(220,238,0,0.5)]">
              <div className="w-2 h-2 bg-primary-fixed animate-pulse"></div>
              <span className="font-mono-label text-[10px] text-primary-fixed uppercase tracking-widest font-bold">
                Awaiting Identity Verification
              </span>
            </div>

            {/* Headline Area */}
            <h1 className="font-headline-xl text-5xl sm:text-6xl lg:text-7xl uppercase leading-[0.9] mb-4 text-on-background">
              Initialize Your
              <br />
              Workspace
            </h1>
            <p className="font-body-md text-on-surface-variant/80 text-sm sm:text-base mb-12 max-w-lg">
              Join the next era of machine-led engineering. Connect your repository and watch AXRAY autonomously plan, code, and test.
            </p>

            {/* GitHub Auth Button */}
            <button
              onClick={startGithubAuth}
              className="w-full max-w-md flex items-center justify-center gap-3 bg-primary-fixed text-on-primary border-[3px] border-on-background px-6 py-5 font-cta-label text-xl uppercase shadow-block hover:shadow-block-hover hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all mb-12"
            >
              <GithubLogo weight="fill" className="w-7 h-7" />
              Continue with GitHub
            </button>

            {/* Divider */}
            <div className="w-full max-w-md flex items-center gap-4 mb-10">
              <div className="flex-1 h-[2px] bg-on-background/20"></div>
              <span className="font-mono-label text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-bold">
                Authorized Flow Only
              </span>
              <div className="flex-1 h-[2px] bg-on-background/20"></div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg mb-8">
              <div className="bg-surface-container-low p-4 border-2 border-on-background/20 hover:border-primary-fixed/50 transition-colors group">
                <ShieldCheck
                  weight="bold"
                  className="text-primary-fixed w-6 h-6 mb-2 group-hover:scale-110 transition-transform"
                />
                <h4 className="font-mono-label font-bold text-[10px] text-on-background uppercase mb-1">
                  10k+ Engineers
                </h4>
              </div>
              <div className="bg-surface-container-low p-4 border-2 border-on-background/20 hover:border-primary-fixed/50 transition-colors group">
                <LockKey
                  weight="bold"
                  className="text-primary-fixed w-6 h-6 mb-2 group-hover:scale-110 transition-transform"
                />
                <h4 className="font-mono-label font-bold text-[10px] text-on-background uppercase mb-1">
                  SSL Encryption
                </h4>
              </div>
              <div className="bg-surface-container-low p-4 border-2 border-on-background/20 hover:border-primary-fixed/50 transition-colors group">
                <Key
                  weight="bold"
                  className="text-primary-fixed w-6 h-6 mb-2 group-hover:scale-110 transition-transform"
                />
                <h4 className="font-mono-label font-bold text-[10px] text-on-background uppercase mb-1">
                  OAuth 2.0
                </h4>
              </div>
            </div>

            {/* Footer Text */}
            <p className="font-mono-label text-[9px] text-on-surface-variant/60 uppercase leading-relaxed max-w-sm">
              By continuing, you agree to our{" "}
              <Link href="#" className="text-primary-fixed font-bold hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary-fixed font-bold hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* Right Side: Visuals / Simulation */}
          <div className="w-full lg:w-[45%] border-t-[3px] lg:border-t-0 lg:border-l-[3px] border-on-background bg-surface-container flex flex-col">
            {/* Top decorative header for right side */}
            <div className="flex border-b-[3px] border-on-background">
              <div className="flex-1 p-4 border-r-[3px] border-on-background bg-surface-container-high flex items-center gap-3">
                <Cpu weight="fill" className="text-primary-fixed w-5 h-5" />
                <span className="font-mono-label text-[10px] uppercase tracking-widest">
                  Agent Core Active
                </span>
              </div>
              <div className="w-16 flex items-center justify-center bg-primary-fixed/10">
                <div className="w-3 h-3 rounded-full bg-primary-fixed animate-ping"></div>
              </div>
            </div>

            {/* The Terminal Simulation */}
            <div className="flex-1 p-6 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-[120px] font-headline-xl opacity-5 leading-none -rotate-12 translate-x-1/4 -translate-y-1/4 select-none pointer-events-none">
                TRACE
              </div>

              {/* Fake Dashboard Elements to make it feel 'bhara bhara' */}
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="border-2 border-on-background/30 p-3 bg-background/50 backdrop-blur-sm">
                  <Database weight="fill" className="text-secondary-fixed w-4 h-4 mb-2" />
                  <div className="font-mono-label text-[9px] text-on-surface-variant uppercase mb-1">
                    Vector DB
                  </div>
                  <div className="font-mono-label text-sm text-on-background">Connected</div>
                </div>
                <div className="border-2 border-on-background/30 p-3 bg-background/50 backdrop-blur-sm">
                  <GitBranch weight="fill" className="text-error w-4 h-4 mb-2" />
                  <div className="font-mono-label text-[9px] text-on-surface-variant uppercase mb-1">
                    Pull Requests
                  </div>
                  <div className="font-mono-label text-sm text-on-background">Automated</div>
                </div>
              </div>

              {/* Welcome Message Box */}
              <div className="flex-1 border-2 border-on-background shadow-inner bg-background relative overflow-hidden flex flex-col justify-center items-center p-8 text-center group">
                {/* Grid Pattern overlay */}
                <div
                  className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(#e5e3cf 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                ></div>

                <CodeSimple className="w-12 h-12 text-primary-fixed mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />

                <h2 className="font-headline-lg-mobile text-2xl uppercase mb-4 text-on-background">
                  You're Almost There.
                </h2>

                <p className="font-mono-label text-sm text-on-surface-variant/80 leading-relaxed max-w-sm uppercase tracking-widest">
                  Just a few clicks away from unlocking complete observability. Connect your identity
                  to start tracing, debugging, and controlling your autonomous agents with surgical
                  precision.
                </p>

                <div className="mt-8 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-fixed/30"></div>
                  <div className="w-2 h-2 rounded-full bg-primary-fixed/60"></div>
                  <div className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
