"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type TraceNode = {
  id: string;
  type: "session" | "llm" | "tool";
  title: string;
  status: "RUNNING" | "SUCCESS" | "FAILED";
  duration?: string;
  tokens?: number;
  model?: string;
  path?: string;
  exitCode?: number;
  error?: string;
  children?: TraceNode[];
};

const TRACE_DATA: TraceNode = {
  id: "root",
  type: "session",
  title: "agent.session",
  status: "RUNNING",
  duration: "14.2s",
  tokens: 1240,
  children: [
    {
      id: "node-1",
      type: "llm",
      title: "llm.call",
      status: "SUCCESS",
      duration: "1.2s",
      model: "gpt-4o"
    },
    {
      id: "node-2",
      type: "tool",
      title: "tool.write_file",
      status: "SUCCESS",
      path: "/src/auth.js",
      children: [
        {
          id: "node-2-1",
          type: "tool",
          title: "tool.run_tests",
          status: "FAILED",
          exitCode: 1,
          error: "Timeout"
        }
      ]
    },
    {
      id: "node-3",
      type: "llm",
      title: "llm.response",
      status: "SUCCESS",
      duration: "0.4s",
      tokens: 256
    }
  ]
};

function NodeRenderer({ node, isRoot = false, isLast = true }: { node: TraceNode; isRoot?: boolean; isLast?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const router = useRouter();
  const hasChildren = node.children && node.children.length > 0;

  const isLLM = node.type === "llm";
  const isTool = node.type === "tool";
  const isFailed = node.status === "FAILED";

  const borderColor = isFailed ? "border-error" : isLLM ? "border-[#00f0ff]" : "border-primary-fixed";
  const textColor = isFailed ? "text-error" : isLLM ? "text-[#00f0ff]" : "text-primary-fixed";
  const shadowClass = isLLM ? "hover:neo-shadow-blue" : isFailed ? "hover:shadow-[4px_4px_0px_0px_var(--color-error)]" : "hover:neo-shadow-primary";
  const lineClass = isLLM ? "bg-[#00f0ff]" : "bg-primary-fixed";
  
  // Base classes for the card
  const cardBase = "bg-background border-[3px] p-4 w-[380px] hover:-translate-x-1 hover:-translate-y-1 transition-all cursor-pointer relative z-10";

  return (
    <div className="relative">
      <div 
        onClick={() => {
          if (isFailed) {
            router.push('/analysis');
          }
        }}
        className={cn(
        cardBase,
        borderColor,
        shadowClass,
        isRoot ? "w-[400px] bg-surface-container-high neo-shadow-primary" : ""
      )}>
        <div className="flex justify-between items-start mb-3">
          <span className={cn("font-mono-label font-bold text-lg flex items-center gap-2", textColor)}>
            {/* Dynamic Icon */}
            <span className="material-symbols-outlined text-[20px]">
              {isRoot ? "rocket_launch" : isLLM ? "psychology" : "build"}
            </span>
            {node.title}
          </span>
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className={cn("text-xs font-black px-1 border border-current hover:bg-surface-variant transition-colors", textColor)}
              >
                {isExpanded ? "[-]" : "[+]"}
              </button>
            )}
            <span className={cn(
              "text-[9px] font-bold px-2 py-0.5 uppercase border",
              isFailed ? "border-error text-error" : isRoot ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed" : "border-green-400 text-green-400"
            )}>
              {node.status}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center font-mono-label text-[11px] text-on-surface-variant">
          {node.duration && <span>DUR: <span className="text-white">{node.duration}</span></span>}
          {node.tokens && <span>TOKENS: <span className="text-white">{node.tokens}</span></span>}
          {node.model && <span>MODEL: <span className="text-white">{node.model}</span></span>}
          {node.path && <span>PATH: <span className="text-white">{node.path}</span></span>}
          {node.exitCode !== undefined && <span>EXIT: <span className="text-white">{node.exitCode}</span></span>}
          {node.error && <span className="text-error">ERROR: {node.error}</span>}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="pl-12 flex flex-col gap-10 relative mt-10">
          {/* Vertical flow line container */}
          <div className="absolute left-6 -top-10 bottom-6 w-1 bg-outline-variant">
             {/* Actual Flowing Line */}
             <div className={cn("absolute inset-0", node.status === 'RUNNING' ? "data-flow-y" : lineClass)}></div>
          </div>
          
          {node.children!.map((child, index) => {
            const childIsLast = index === node.children!.length - 1;
            const childLineClass = child.type === "llm" ? "bg-[#00f0ff]" : "bg-primary-fixed";
            
            return (
              <div key={child.id} className="relative pl-10">
                {/* Horizontal flow line connecting vertical line to node */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-1 flex items-center bg-outline-variant">
                  <div className={cn("absolute inset-0", node.status === 'RUNNING' ? "data-flow-x" : childLineClass)}></div>
                  {/* Joint Dot */}
                  <div className={cn("absolute -left-1.5 w-3 h-3 rounded-full border-[3px] border-background z-20", childLineClass)}></div>
                  <div className={cn("absolute -right-1.5 w-3 h-3 rounded-full border-[3px] border-background z-20", childLineClass)}></div>
                </div>
                
                <NodeRenderer node={child} isLast={childIsLast} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TraceCanvas() {
  return (
    <div 
      className="flex-grow overflow-auto p-8 relative bg-surface-dim custom-scrollbar"
      style={{ backgroundImage: "radial-gradient(var(--color-surface-container-high) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      data-lenis-prevent="true"
    >
      <div className="flex flex-col gap-12 relative min-w-[800px]">
        <NodeRenderer node={TRACE_DATA} isRoot={true} />
      </div>
    </div>
  );
}
