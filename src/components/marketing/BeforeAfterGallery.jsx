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
    <section className="py-24 lg:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="w-8 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,38%)' }} />
            <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'hsl(160,60%,38%)' }}>
              Our Work
            </span>
            <div className="w-8 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,38%)' }} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold"
            style={{ color: 'hsl(210,20%,10%)', fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            See the{' '}
            <span className="italic" style={{ color: 'hsl(160,60%,38%)' }}>difference.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4"
            style={{ color: 'hsl(210,10%,46%)' }}
          >
            Drag the slider to compare before and after results.
          </motion.p>
        </div>

        {/* Project Tabs */}
        <div className="flex justify-center gap-3 mb-10">
          {projects.map((p, i) => (
            <button
              key={i}
              onClick={() => { setActiveProject(i); setSliderPos(50); }}
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
              style={{
                backgroundColor: i === activeProject ? 'hsl(210,20%,6%)' : 'transparent',
                color: i === activeProject ? 'white' : 'hsl(210,10%,46%)',
                border: i === activeProject ? 'none' : '1px solid hsl(40,10%,90%)',
              }}
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
          className="relative rounded-3xl overflow-hidden shadow-xl border aspect-[16/9] select-none cursor-col-resize"
          style={{ borderColor: 'hsl(40,10%,90%)' }}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMove}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleMove}
        >
          <img
            src={project.after}
            alt={`${project.title} - After`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
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
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10"
            style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M7 4L3 10L7 16M13 4L17 10L13 16" stroke="hsl(210,20%,10%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="absolute top-4 left-4 text-white text-xs font-semibold px-4 py-2 rounded-full z-20 tracking-wide" style={{ backgroundColor: 'hsl(210,20%,6%)', opacity: 0.9 }}>
            Before
          </div>
          <div className="absolute top-4 right-4 text-white text-xs font-semibold px-4 py-2 rounded-full z-20 tracking-wide" style={{ backgroundColor: 'hsl(160,60%,38%)', opacity: 0.9 }}>
            After
          </div>
        </motion.div>

        <div className="text-center mt-8">
          <p className="font-bold" style={{ color: 'hsl(210,20%,10%)' }}>{project.title}</p>
          <p className="text-sm mt-1" style={{ color: 'hsl(210,10%,46%)' }}>{project.location}</p>
        </div>
      </div>
    </section>
  );
}
