import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const PROJECTS = [
  {
    label: "AC Deep Cleaning",
    before: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=700&q=70",
    after: "https://images.unsplash.com/photo-1631545806609-be9d37bfce84?w=700&q=70",
  },
  {
    label: "Plumbing Repair",
    before: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=700&q=70",
    after: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=700&q=70",
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
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-emerald-600 text-sm font-bold tracking-[0.15em] uppercase">Our Work</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mt-3">See the Difference</h2>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {PROJECTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveIdx(idx); setSliderPos(50); }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                idx === activeIdx ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
          className="relative rounded-2xl overflow-hidden shadow-xl cursor-ew-resize select-none h-[340px] md:h-[440px]"
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
          <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10" style={{ left: `${sliderPos}%` }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-r-[6px] border-transparent border-r-slate-400" />
                <div className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[6px] border-transparent border-l-slate-400" />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full z-20">Before</div>
          <div className="absolute top-4 right-4 bg-emerald-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full z-20">After</div>
        </motion.div>
      </div>
    </section>
  );
}