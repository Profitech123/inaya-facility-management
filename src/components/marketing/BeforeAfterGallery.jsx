import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const PROJECTS = [
  {
    label: "AC Deep Cleaning",
    before: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/f7d629820_generated_image.png",
    after: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/e70a4957e_generated_image.png",
  },
  {
    label: "Plumbing Repair",
    before: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/39db25e27_generated_image.png",
    after: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/698ae0b22bb1c388335ba480/b06641488_generated_image.png",
  },
];

export default function BeforeAfterGallery() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const project = PROJECTS[activeIdx];

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseDown = () => { dragging.current = true; };
  const handleMouseUp = () => { dragging.current = false; };
  const handleMouseMove = (e) => { if (dragging.current) updatePosition(e.clientX); };
  const handleTouchMove = (e) => { updatePosition(e.touches[0].clientX); };

  return (
    <section className="py-28 bg-white relative">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-5 py-2 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-semibold text-xs uppercase tracking-widest">Our Work</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">See the Difference</h2>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-10">
          {PROJECTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveIdx(idx); setSliderPos(50); }}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                idx === activeIdx ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          ref={containerRef}
          className="relative rounded-3xl overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] cursor-ew-resize select-none h-[340px] md:h-[480px] border border-slate-200"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {/* After (full) */}
          <img src={project.after} alt="After" className="absolute inset-0 w-full h-full object-cover" />
          
          {/* Before (clipped) */}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
            <img src={project.before} alt="Before" className="w-full h-full object-cover" />
          </div>

          {/* Divider line */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-lg z-10" style={{ left: `${sliderPos}%` }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border border-slate-100">
              <div className="flex gap-1">
                <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-r-[7px] border-transparent border-r-slate-400" />
                <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[7px] border-transparent border-l-slate-400" />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-5 left-5 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full z-20 border border-white/10">Before</div>
          <div className="absolute top-5 right-5 bg-emerald-600/80 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full z-20 border border-emerald-400/20">After</div>
        </motion.div>
      </div>
    </section>
  );
}