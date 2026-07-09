import React from 'react';
import { 
  UploadCloud, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Database, 
  CheckCircle2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

// =====================================================================
// CLINICAL INGEST & RAG STUDIO VIEW COMPONENT
// =====================================================================
// Renders a 50/50 split viewport mimicking an AI document parser:
// - Left Pane: High-fidelity PDF viewer with highlighted RAG extraction.
// - Right Pane: PixelRAG dashboard with dropzone, metadata list, and indexing badge.

export default function ClinicalIngest() {
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full h-full">
      
      {/* LEFT PANE: PDF DOCUMENT VIEWER */}
      <div className="flex flex-col bg-slate-900/60 border border-white/10 rounded-2xl shadow-glass-inset shadow-card h-[550px] relative overflow-hidden">
        
        {/* PDF Viewer Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <FileText className="text-cyan-400" size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">NEJM-2026-889.pdf</span>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-800 border border-white/10 text-slate-400 rounded-lg">
            345 KB · Source Document
          </span>
        </div>

        {/* Scrollable PDF Canvas Container */}
        <div className="flex-1 overflow-y-auto bg-slate-950/80 p-6 flex justify-center items-start">
          
          {/* Mock Physical PDF Page */}
          <div className="w-full max-w-[420px] bg-white text-slate-900 p-6 md:p-8 rounded-sm shadow-2xl flex flex-col gap-4 aspect-[1/1.4] select-text">
            
            {/* Academic Paper Header */}
            <div className="flex flex-col border-b border-slate-200 pb-2.5">
              <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400">The New England Journal of Medicine</span>
              <h4 className="font-heading font-black text-xs text-slate-950 mt-1 leading-snug">
                Adjuvant V940 (mRNA-4157) plus Pembrolizumab in Resected High-Risk Stage III/IV Melanoma
              </h4>
              <span className="text-[6.5px] font-semibold text-slate-400 mt-0.5">
                Vol. 394 · No. 12 · Clinical Trial Report
              </span>
            </div>

            {/* Abstract Text with Teal Bounding Box Highlight */}
            <div className="flex flex-col gap-3 text-[9px] leading-relaxed text-slate-700">
              <p>
                <strong>BACKGROUND:</strong> Adjuvant immunotherapy has improved recurrence-free survival in patients with resected high-risk melanoma. However, the risk of recurrence remains substantial, and personalized therapeutic strategies targeting patient-specific neoantigens are warranted.
              </p>
              
              {/* Highlighted RAG sentence */}
              <p className="bg-teal-400/25 text-slate-950 font-medium px-1.5 py-1 border-l-2 border-teal-500 rounded-sm leading-normal">
                <strong>RESULTS:</strong> In this phase 2b trial, the combination of personalized mRNA vaccine V940 plus pembrolizumab demonstrated an unprecedented 24-month recurrence-free survival (RFS) rate of 78.4% compared to pembrolizumab monotherapy, translating to a Hazard Ratio of 0.58 (95% CI: 0.32-0.84) and a 42% reduction in distant metastasis risk.
              </p>
              
              <p>
                <strong>CONCLUSIONS:</strong> Adjuvant treatment with the V940 personalized mRNA vaccine in combination with pembrolizumab prolongs recurrence-free survival in patients with resected high-risk melanoma without adding significant toxicities. Further phase 3 trials are ongoing to validate these findings.
              </p>
            </div>

            {/* Page Footer */}
            <div className="mt-auto border-t border-slate-100 pt-2 flex items-center justify-between text-[6.5px] text-slate-400 font-semibold">
              <span>nejm.org/clinical-trials</span>
              <span>Page 1 of 14</span>
            </div>

          </div>

        </div>

        {/* Floating Glassmorphic PDF Toolbar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-4 text-slate-400 shadow-lg shadow-black/50 z-10 select-none">
          <button className="hover:text-slate-100 transition-colors"><ZoomOut size={13} /></button>
          <span className="text-[10px] font-bold text-slate-200">100%</span>
          <button className="hover:text-slate-100 transition-colors"><ZoomIn size={13} /></button>
          
          <div className="w-px h-3.5 bg-white/10"></div>
          
          <div className="flex items-center gap-1.5">
            <button className="hover:text-slate-100 transition-colors"><ChevronLeft size={13} /></button>
            <span className="text-[9.5px] font-semibold text-slate-200">1 / 14</span>
            <button className="hover:text-slate-100 transition-colors"><ChevronRight size={13} /></button>
          </div>
          
          <div className="w-px h-3.5 bg-white/10"></div>
          
          <button className="hover:text-slate-100 transition-colors"><Search size={13} /></button>
        </div>

      </div>

      {/* RIGHT PANE: PIXELRAG DASHBOARD */}
      <div className="flex flex-col gap-6">
        
        {/* 1. Dashed File Upload Drag-and-Drop Zone */}
        <div className="p-6 bg-slate-900/30 border-2 border-dashed border-slate-700 hover:border-cyan-500/40 hover:bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 group cursor-pointer h-40 select-none">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl group-hover:text-cyan-400 group-hover:border-cyan-500/20 group-hover:shadow-neon-cyan transition-all duration-300 text-slate-400">
            <UploadCloud size={20} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-400 transition-colors duration-300">
              Drag & drop clinical trials PDF or click to browse
            </span>
            <span className="text-[9px] text-slate-500">Supports PDF, PPTX, XLSX up to 25MB</span>
          </div>
        </div>

        {/* 2. Extracted Insights Panel (Glowing teal border card) */}
        <div className="relative p-5 bg-white/5 backdrop-blur-md border-2 border-teal-500/30 rounded-2xl shadow-neon-emerald flex items-center justify-between gap-4 overflow-hidden">
          {/* Subtle background glow circle */}
          <div className="absolute -left-8 -top-8 w-24 h-24 bg-teal-500/10 rounded-full filter blur-xl"></div>
          
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Extracted RAG Telemetry</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-heading font-black text-2xl text-teal-400 shadow-neon-emerald">Hazard Ratio: 0.58</span>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider bg-teal-400/10 border border-teal-400/20 px-2 py-0.5 rounded-full shadow-neon-emerald">
                42% Risk Reduction
              </span>
            </div>
            <span className="text-[9.5px] text-slate-300 font-medium leading-relaxed mt-1">
              Statistically significant OS improvement validated in adjuvant stage III/IV Melanoma trials.
            </span>
          </div>
          
          {/* Sparkline Visual */}
          <div className="w-20 h-10 bg-slate-950/50 border border-white/5 rounded-lg flex items-center justify-center p-1.5 shrink-0">
            <svg width="100%" height="100%" viewBox="0 0 100 25" preserveAspectRatio="none">
              <path 
                d="M 0 22 Q 20 2, 50 18 T 100 5" 
                fill="none" 
                stroke="#2dd4bf" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 4px rgba(45, 212, 191, 0.5))' }}
              />
            </svg>
          </div>
        </div>

        {/* 3. Extraction Summary Metadata List */}
        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-glass-inset shadow-card flex flex-col gap-4">
          <div className="border-b border-white/5 pb-2">
            <h4 className="font-heading font-extrabold text-[10px] uppercase tracking-wider text-slate-400">Extraction Summary</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Target Asset", val: "V940 (mRNA personalized)" },
              { label: "Oncology Indication", val: "High-Risk Stage III/IV Melanoma" },
              { label: "Telemetry Standard", val: "Adjuvant Sequencing Protocol" },
              { label: "Source Reference", val: "NEJM-2026-889 · Trial Phase 2b" }
            ].map((meta, idx) => (
              <div key={idx} className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{meta.label}</span>
                <span className="text-[11px] font-semibold text-slate-200">{meta.val}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3.5 mt-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase rounded-full shadow-neon-emerald">
              <CheckCircle2 size={10} /> Grounded & Indexed
            </div>
            <button className="flex items-center gap-1 text-[9.5px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
              View Citation Record <ExternalLink size={10} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
