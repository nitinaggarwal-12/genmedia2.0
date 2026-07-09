import React from 'react';
import { 
  Vote, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Users,
  Activity
} from 'lucide-react';

// =====================================================================
// CLAIMS EXPLORER & MLR REVIEW ROOM COMPONENT
// =====================================================================
// Renders the 60/40 split viewport:
// - Left Pane: Claims Ontology Graph showing spiderweb relationship mappings.
// - Right Pane: MLR Consensus Reviewer cards and progress state-aware gates.

export default function MlrReview() {
  
  // Claims spiderweb ontology graph coordinates (500x300 grid)
  const centerNode = { x: 250, y: 150 };
  const primaryNodes = [
    { id: 'audience', label: 'Target Audience', x: 100, y: 70, color: 'text-orange-400 border-orange-400/30 bg-orange-950/40 shadow-neon-amber' },
    { id: 'safety', label: 'Safety Data', x: 400, y: 70, color: 'text-emerald-400 border-emerald-400/30 bg-emerald-950/40 shadow-neon-emerald' },
    { id: 'efficacy', label: 'Product Efficacy', x: 100, y: 230, color: 'text-cyan-400 border-cyan-400/30 bg-cyan-950/40 shadow-neon-cyan' },
    { id: 'value', label: 'Payer Value', x: 400, y: 230, color: 'text-purple-400 border-purple-400/30 bg-purple-950/40 shadow-neon-rose' }
  ];

  const secondaryNodes = [
    { id: 'segment', label: 'Patient Segment', x: 30, y: 40, parentX: 100, parentY: 70, color: 'text-orange-300/80 border-orange-400/15 bg-slate-900/60' },
    { id: 'dosage', label: 'Dosage Toxicity', x: 470, y: 40, parentX: 400, parentY: 70, color: 'text-emerald-300/80 border-emerald-400/15 bg-slate-900/60' },
    { id: 'trials', label: 'Clinical Study X', x: 30, y: 260, parentX: 100, parentY: 230, color: 'text-cyan-300/80 border-cyan-400/15 bg-slate-900/60' },
    { id: 'rebates', label: 'Prior Auth Rebate', x: 470, y: 260, parentX: 400, parentY: 230, color: 'text-purple-300/80 border-purple-400/15 bg-slate-900/60' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 w-full h-full">
      
      {/* LEFT PANE: CLAIMS ONTOLOGY GRAPH (60%) */}
      <div className="lg:col-span-6 flex flex-col bg-slate-900/60 border border-white/10 rounded-2xl shadow-glass-inset shadow-card h-[550px] p-6 gap-4">
        
        <div className="border-b border-white/5 pb-3">
          <h3 className="font-heading font-extrabold text-sm text-slate-100 flex items-center gap-2">
            <Activity className="text-amber-400" size={14} /> Claims Ontology Graph
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Relational mapping of clinical trial primary endpoints to secondary marketing claims.</p>
        </div>

        {/* Spiderweb Graph Canvas */}
        <div className="flex-1 flex items-center justify-center bg-slate-950/40 border border-white/5 rounded-xl overflow-hidden p-4 relative">
          
          {/* Fixed coordinate space */}
          <div className="relative w-[500px] h-[300px] shrink-0" style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.03) 1.2px, transparent 1.2px)',
            backgroundSize: '14px 14px'
          }}>
            
            {/* SVG Spiderweb Connectors */}
            <svg width="100%" height="100%" className="absolute inset-0 z-0 pointer-events-none">
              <defs>
                <filter id="ontology-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#fbbf24" floodOpacity="0.3"/>
                </filter>
              </defs>
              
              {/* Core to Primary Lines */}
              {primaryNodes.map(node => (
                <line 
                  key={node.id}
                  x1={centerNode.x} 
                  y1={centerNode.y} 
                  x2={node.x} 
                  y2={node.y} 
                  stroke="rgba(251, 191, 36, 0.25)"
                  strokeWidth="2"
                  filter="url(#ontology-glow)"
                />
              ))}

              {/* Primary to Secondary Lines */}
              {secondaryNodes.map(node => (
                <line 
                  key={node.id}
                  x1={node.parentX} 
                  y1={node.parentY} 
                  x2={node.x} 
                  y2={node.y} 
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                />
              ))}
            </svg>

            {/* Center Node (Core Product Claim) */}
            <div 
              className="absolute z-10 flex flex-col items-center justify-center w-24 h-24 bg-slate-900 border-2 border-amber-400 rounded-full shadow-neon-amber select-none cursor-pointer hover:scale-105 transition-transform duration-300"
              style={{ left: `${centerNode.x - 48}px`, top: `${centerNode.y - 48}px` }}
            >
              <span className="text-[14px]">⚖️</span>
              <span className="text-[8.5px] font-black tracking-tight text-white mt-1 uppercase text-center px-1">
                Core Claim
              </span>
            </div>

            {/* Primary Nodes */}
            {primaryNodes.map(node => (
              <div 
                key={node.id}
                className={`absolute z-10 flex flex-col items-center justify-center w-16 h-16 border rounded-full transition-all duration-300 hover:scale-105 cursor-pointer select-none ${node.color}`}
                style={{ left: `${node.x - 32}px`, top: `${node.y - 32}px` }}
              >
                <span className="text-[7px] font-black text-slate-200 text-center uppercase tracking-wider leading-tight px-1 whitespace-normal">
                  {node.label}
                </span>
              </div>
            ))}

            {/* Secondary Nodes */}
            {secondaryNodes.map(node => (
              <div 
                key={node.id}
                className={`absolute z-10 flex flex-col items-center justify-center w-14 h-14 border rounded-full transition-all duration-300 hover:scale-105 cursor-pointer select-none ${node.color}`}
                style={{ left: `${node.x - 28}px`, top: `${node.y - 28}px` }}
              >
                <span className="text-[6.5px] font-extrabold text-slate-400 text-center leading-tight px-1 whitespace-normal">
                  {node.label}
                </span>
              </div>
            ))}

          </div>

          {/* Indicators */}
          <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-wider text-slate-400">
            <span>FDA Compliance Map</span>
          </div>

        </div>

      </div>

      {/* RIGHT PANE: MLR CONSENSUS VOTING (40%) */}
      <div className="lg:col-span-4 flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-glass-inset shadow-card h-[550px] p-6 gap-6 justify-between">
        
        <div className="border-b border-white/5 pb-3">
          <h3 className="font-heading font-extrabold text-sm text-slate-100 flex items-center gap-2">
            <Users className="text-cyan-400" size={14} /> MLR Review consensus
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Real-time voting alignment of Medical, Legal, and Regulatory leads.</p>
        </div>

        {/* Reviewer Cards Stack */}
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
          
          {/* Medical Lead Card (Approved) */}
          <div className="p-3.5 bg-emerald-500/[0.02] border border-emerald-500/20 rounded-xl flex items-center justify-between shadow-glass-inset">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                SJ
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10.5px] font-bold text-slate-200">Sarah Jenkins, MD</span>
                <span className="text-[8.5px] text-slate-400">Medical Affairs Review Director</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-lg shadow-neon-emerald">
              <CheckCircle2 size={10} /> Approved
            </div>
          </div>

          {/* Legal Lead Card (Approved) */}
          <div className="p-3.5 bg-emerald-500/[0.02] border border-emerald-500/20 rounded-xl flex items-center justify-between shadow-glass-inset">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                RL
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10.5px] font-bold text-slate-200">Robert Lee, JD</span>
                <span className="text-[8.5px] text-slate-400">Legal & Commercial Compliance Lead</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-lg shadow-neon-emerald">
              <CheckCircle2 size={10} /> Approved
            </div>
          </div>

          {/* Regulatory Lead Card (Pending) */}
          <div className="p-3.5 bg-amber-500/[0.02] border border-amber-500/20 rounded-xl flex items-center justify-between shadow-glass-inset">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                MG
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10.5px] font-bold text-slate-200">Maria Garcia</span>
                <span className="text-[8.5px] text-slate-400">Global Regulatory Affairs Lead</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg shadow-neon-amber">
              <AlertTriangle size={10} /> Pending
            </div>
          </div>

        </div>

        {/* Footer Consensus Gate */}
        <div className="border-t border-white/5 pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>Consensus Progress (2/3 Leads Approved)</span>
              <span className="text-amber-400">Pending Regulatory Sign-Off</span>
            </div>
            
            {/* Glass progress bar */}
            <div className="w-full h-2.5 bg-slate-900 border border-white/5 rounded-full overflow-hidden p-0.5">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full" style={{ width: '66.6%' }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="btn btn-secondary py-2.5 text-[9px] font-bold text-rose-400 border-rose-500/10 hover:bg-rose-500/5 hover:border-rose-500/20">
              Request Revisions
            </button>
            <button 
              disabled 
              className="btn btn-primary py-2.5 text-[9px] font-bold"
            >
              Final Approval ➔
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
