import React, { useState } from 'react';
import { motion } from 'framer-motion';

const projects = [
  {
    title: "AC Deep Cleaning",
    location: "Villa in Arabian Ranches",
    before: "/images/before-ac.jpg",
    after: "/images/after-ac.jpg",
  },
  {
    title: "Plumbing Repair",
    location: "Apartment in Dubai Marina",
    before: "/images/before-plumbing.jpg",
    after: "/images/after-plumbing.jpg",
  },
];

export default function BeforeAfterGallery() {
  const [activeProject, setActiveProject] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const project = projects[activeProject];

  const handleMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-emerald-500 font-bold text-sm uppercase tracking-wider"
          >
            Our Work
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold text-slate-900 mt-2"
          >
            See the Difference
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-500"
          >
            Drag the slider to compare before and after results.
          </motion.p>
        </div>

        {/* Project Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          {projects.map((p, i) => (
            <button
              key={i}
              onClick={() => { setActiveProject(i); setSliderPos(50); }}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                i === activeProject
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Before/After Slider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 aspect-[16/9] select-none cursor-col-resize"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleMove}
        >
          {/* After (full background) */}
          <img
            src={project.after}
            alt={`${project.title} - After`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          {/* Before (clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={project.before}
              alt={`${project.title} - Before`}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ minWidth: '100%', width: `${(100 / sliderPos) * 100}%`, maxWidth: 'none' }}
              loading="lazy"
            />
          </div>
          {/* Slider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
            style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-slate-600">
                <path d="M7 4L3 10L7 16M13 4L17 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {/* Labels */}
          <div className="absolute top-4 left-4 bg-slate-900/70 text-white text-xs font-bold px-3 py-1.5 rounded-full z-20">
            Before
          </div>
          <div className="absolute top-4 right-4 bg-emerald-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full z-20">
            After
          </div>
        </motion.div>

        <div className="text-center mt-6">
          <p className="font-bold text-slate-900">{project.title}</p>
          <p className="text-sm text-slate-500">{project.location}</p>
        </div>
      </div>
    </section>
  );
}
