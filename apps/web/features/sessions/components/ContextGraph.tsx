"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { AgentRunSummary, TimelineEvent } from "@/features/agent-runs/types";

interface ContextGraphProps {
  activeRun?: AgentRunSummary | null;
  events?: TimelineEvent[];
}

export default function ContextGraph({ activeRun, events = [] }: ContextGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 350, height: 250 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Parse actual graph data from live events
  const graphData = useMemo(() => {
    const runIdStr = activeRun?.id.slice(-4).toUpperCase() || "INTL";
    
    const nodes: any[] = [{ id: "agent", name: `Agent [${runIdStr}]`, val: 12, color: "#10b981" }]; // Emerald 500
    const links: any[] = [];
    const addedNodes = new Set<string>();

    for (const evt of events) {
      if (evt.phase === 'tool' && (evt.title.startsWith("Tool: ") || evt.eventType === "agent.tool_call")) {
        // Fallbacks for extracting tool information depending on how it was logged
        const toolName = evt.metadata?.toolName || evt.title.replace("Tool: ", "");
        const argsStr = typeof evt.metadata?.args === 'string' ? evt.metadata.args : JSON.stringify(evt.metadata?.args || {});
        
        // Extract File Interactions
        if (toolName === "view_file" || toolName === "multi_replace_file_content" || toolName === "replace_file_content" || toolName === "write_to_file") {
          const filePath = evt.metadata?.TargetFile || evt.metadata?.AbsolutePath || "file";
          const fileName = String(filePath).split(/[/\\]/).pop() || "file.tsx";
          const nodeId = `file_${fileName}`;
          
          if (!addedNodes.has(nodeId)) {
            nodes.push({ id: nodeId, name: fileName, val: 5, color: "#3b82f6" }); // Blue 500
            links.push({ source: "agent", target: nodeId, value: 2 });
            addedNodes.add(nodeId);
          }
        } 
        // Extract Terminal Commands
        else if (toolName === "run_command") {
          const cmd = evt.metadata?.CommandLine || evt.metadata?.commandSummary || "cmd";
          const shortCmd = String(cmd).split(" ")[0] || "sh"; // just the first word
          const nodeId = `cmd_${shortCmd}`;
          
          if (!addedNodes.has(nodeId)) {
            nodes.push({ id: nodeId, name: `> ${shortCmd}`, val: 4, color: "#f59e0b" }); // Amber 500
            links.push({ source: "agent", target: nodeId, value: 1.5 });
            addedNodes.add(nodeId);
          }
        }
        // Extract Search / Read interactions (Often KIs or Web searches)
        else if (toolName === "grep_search" || toolName === "search_web" || toolName === "read_url_content") {
          const query = evt.metadata?.Query || evt.metadata?.query || evt.metadata?.Url || "Search";
          // Truncate query
          const shortQuery = String(query).length > 10 ? String(query).substring(0, 10) + '...' : String(query);
          const nodeId = `search_${evt.id}`;
          
          if (!addedNodes.has(nodeId)) {
             nodes.push({ id: nodeId, name: shortQuery, val: 3, color: "#a855f7" }); // Purple 500
             links.push({ source: "agent", target: nodeId, value: 1 });
             addedNodes.add(nodeId);
          }
        }
      }
    }

    // Fallback if no tools were called yet (or no events parsed)
    if (nodes.length === 1) {
       return {
         nodes: [
            ...nodes,
            { id: "idle", name: "Standby", val: 4, color: "#4b5563" } // Gray 600
         ],
         links: [
            { source: "agent", target: "idle", value: 1 }
         ]
       }
    }

    return { nodes, links };
  }, [activeRun, events]);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center">
      {/* Absolute positioning overlay text */}
      <div className="absolute top-0 left-0 w-full p-4 pointer-events-none z-10 flex justify-between items-start">
        <span className="text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-widest">
          Context Graph
        </span>
        <div className="flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping delay-75"></div>
        </div>
      </div>

      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        backgroundColor="transparent"
        nodeRelSize={4}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={d => (d as any).value * 0.005}
        linkDirectionalParticleWidth={2.5}
        linkColor={() => "rgba(255, 255, 255, 0.15)"}
        linkWidth={1.5}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name as string;
          const fontSize = 12 / globalScale;
          const nodeColor = node.color as string;
          const r = Math.sqrt(Math.max(0, (node.val as number) || 1)) * 3;
          
          // Draw Outer Glow
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, r * 1.8, 0, 2 * Math.PI, false);
          ctx.fillStyle = nodeColor;
          ctx.globalAlpha = 0.2;
          ctx.fill();

          // Draw Core Node
          ctx.beginPath();
          ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI, false);
          ctx.fillStyle = nodeColor;
          ctx.globalAlpha = 1;
          ctx.fill();
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 0.5 / globalScale;
          ctx.stroke();

          // Draw Text Label
          ctx.font = `600 ${fontSize}px "Inter", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.globalAlpha = 1;
          ctx.fillText(label, node.x!, node.y! + r + (8 / globalScale));
        }}
        d3VelocityDecay={0.2}
      />
    </div>
  );
}
