"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Play,
  BookOpen,
  ShieldAlert
} from "lucide-react";

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchDemo: () => void;
}

export default function SetupGuideModal({
  isOpen,
  onClose,
  onWatchDemo,
}: SetupGuideModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      step: "Step 1",
      title: "Clone the Repository",
      command: `git clone https://github.com/hussainjamal760/axray-signoz.git\ncd axray-signoz`,
    },
    {
      step: "Step 2",
      title: "Deploy SigNoz + MCP Server (via Foundry)",
      command: `cd deploy\nfoundryctl cast -f casting.yaml`,
      note: "The first run pulls several large Docker images and may take a few minutes. Subsequent runs are much faster.",
      link: {
        label: "SigNoz UI",
        url: "http://localhost:8080",
      },
    },
    {
      step: "Step 3",
      title: "Configure Environment & Groq API Key",
      command: `cd ..\ncp .env.example .env`,
      envSnippet: `GROQ_API_KEY=gsk_your_groq_api_key_here`,
      note: "Everything else in .env is pre-configured with sensible defaults for local Docker containerization.",
    },
    {
      step: "Step 4",
      title: "Launch AXRAY",
      command: `docker compose up -d`,
      note: "Starts AXRAY backend (3001), frontend (3000), and MongoDB.",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          data-lenis-prevent="true"
        >
          {/* Backdrop with Heavy Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-all"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-4xl bg-surface-container-lowest/90 border border-outline-variant/40 rounded-[28px] shadow-[0_0_80px_rgba(220,238,0,0.12)] overflow-hidden my-auto max-h-[90vh] flex flex-col backdrop-blur-2xl ring-1 ring-white/10"
          >
            {/* Top Glow Accent Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-primary-fixed via-emerald-400 to-primary-fixed" />

            {/* Header Section */}
            <div className="p-6 sm:p-8 border-b border-outline-variant/20 relative flex flex-col gap-3 shrink-0 bg-gradient-to-b from-primary-fixed/5 to-transparent">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2.5 rounded-full bg-surface-container-lowest/80 border border-outline-variant/30 text-on-surface-variant hover:text-white hover:border-white/40 transition-all duration-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider w-fit">
                <ShieldAlert size={14} className="animate-pulse" />
                <span>Self-Hosted Architecture Notice</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight leading-tight">
                Run AXRAY Locally for Full Telemetry
              </h2>

              <p className="text-sm sm:text-base text-on-surface-variant/90 leading-relaxed max-w-2xl font-medium">
                AXRAY uses a self-hosted <strong className="text-white">SigNoz engine</strong>, <strong className="text-white">OpenTelemetry collector</strong>, and Docker sandbox. Follow these 4 quick steps to run the complete stack on your machine:
              </p>
            </div>

            {/* Steps Content Scrollable */}
            <div 
              className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1"
              data-lenis-prevent="true"
            >
              {steps.map((item, idx) => (
                <div
                  key={idx}
                  className="group relative bg-surface-container-lowest/50 border border-outline-variant/30 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-primary-fixed/40"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-primary-fixed/15 border border-primary-fixed/30 rounded-lg font-mono text-xs font-bold text-primary-fixed uppercase tracking-wider">
                        {item.step}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Code Snippet Box */}
                  {item.command && (
                    <div className="relative mt-3 rounded-xl bg-black/70 border border-outline-variant/30 p-4 font-mono text-xs text-primary-fixed/90 overflow-x-auto group/code">
                      <pre className="whitespace-pre-wrap leading-relaxed select-all">{item.command}</pre>
                      <button
                        onClick={() => copyToClipboard(item.command, idx)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/40 text-on-surface-variant hover:text-primary-fixed hover:border-primary-fixed/50 transition-all flex items-center gap-1.5 text-[11px]"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check size={14} className="text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* ENV Additional Snippet */}
                  {item.envSnippet && (
                    <div className="relative mt-2 rounded-xl bg-black/50 border border-outline-variant/20 p-3 font-mono text-xs text-gray-300">
                      <code>{item.envSnippet}</code>
                    </div>
                  )}

                  {/* Note / Extras */}
                  {item.note && (
                    <p className="text-xs text-on-surface-variant/70 mt-3 font-mono leading-relaxed">
                      💡 {item.note}
                    </p>
                  )}

                  {item.link && (
                    <div className="mt-3">
                      <a
                        href={item.link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary-fixed hover:underline"
                      >
                        <span>{item.link.label}: {item.link.url}</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-6 border-t border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <a
                  href="https://github.com/hussainjamal760/axray-signoz#readme"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-white/50 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm"
                >
                  <BookOpen size={16} className="text-primary-fixed" />
                  <span>Read Full Docs</span>
                  <ExternalLink size={12} className="text-on-surface-variant" />
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onWatchDemo();
                  }}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-fixed/15 border border-primary-fixed/40 hover:border-primary-fixed text-primary-fixed text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(220,238,0,0.15)]"
                >
                  <Play size={16} />
                  <span>Watch Demo</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary-fixed hover:bg-primary-fixed/90 text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_25px_rgba(220,238,0,0.3)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Dismiss / Explore Site
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
