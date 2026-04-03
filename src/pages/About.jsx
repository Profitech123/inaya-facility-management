import React from 'react';
import { Shield, Award, Heart, Users, Target, TrendingUp } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import CertificationsBar from '../components/marketing/CertificationsBar';

const coreValues = [
  { icon: Heart,      title: "Honesty",         desc: "We'll always tell the entire truth, be sincere and refrain from withholding important information in relationships of trust." },
  { icon: Shield,     title: "Integrity",        desc: "We'll firmly adhere to a standard of values. We will only say things that we mean and consistently honour what we say." },
  { icon: Target,     title: "Accountability",   desc: "We'll take responsibility for our performance in all our decisions and actions, owning up to any of our shortcomings." },
  { icon: Award,      title: "Reliability",      desc: "We'll be a dependable service provider who can be relied upon to deliver the desired outcomes to our customers." },
  { icon: Users,      title: "Customer Focus",   desc: "We'll listen to our customers, understand their needs and continually focus on delivering what they truly value." },
];

const stats = [
  { icon: Users,      value: "700+",   label: "Team Members",    bg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { icon: Shield,     value: "24/7",   label: "Support",         bg: "bg-blue-50",    iconColor: "text-blue-600" },
  { icon: Award,      value: "ISO",    label: "Certified",       bg: "bg-orange-50",  iconColor: "text-orange-600" },
  { icon: TrendingUp, value: "549+",   label: "Ha. Managed",     bg: "bg-purple-50",  iconColor: "text-purple-600" },
];

// Shared variants
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

export default function About() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ── Hero ── */}
      <div ref={heroRef} className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-28 overflow-hidden">
        {/* Parallax background blobs */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-700/20 rounded-full blur-[160px] -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-800/15 rounded-full blur-[120px]" />
        </motion.div>
        {/* Fine grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '72px 72px'
        }} />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="max-w-7xl mx-auto px-6 relative"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold text-[11px] tracking-[0.2em] uppercase">About INAYA</span>
          </motion.div>

          <div className="overflow-hidden mb-6">
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl lg:text-6xl font-bold leading-tight tracking-tight max-w-3xl"
            >
              INAYA Facilities<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                Management Services
              </span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-slate-300 max-w-3xl font-light leading-relaxed"
          >
            Part of Belhasa Group, one of the UAE's most established group of companies, we have both the resources and solid financial base to offer our leading expertise.
          </motion.p>
        </motion.div>
      </div>

      {/* ── Company Overview ── */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >
              <motion.div variants={fadeUp} custom={0}>
                <div className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-full px-4 py-1.5 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-semibold text-[11px] tracking-[0.2em] uppercase">Company Overview</span>
                </div>
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Leading FM Company in UAE</motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-600 mb-4 leading-relaxed font-light">
                INAYA Facilities Management Services develops, manages and executes FM strategies to maximise the performance and lifecycle of client assets. From residential and commercial through to large-scale retail properties, we offer maintenance, cleaning and specialist services with best-in-class service delivery.
              </motion.p>
              <motion.p variants={fadeUp} custom={3} className="text-lg text-slate-600 mb-4 leading-relaxed font-light">
                We understand how buildings are designed and the systems that make them work smoothly. Our management team has a solid body of knowledge built from working with some of the most respected FM firms regionally and internationally.
              </motion.p>
              <motion.p variants={fadeUp} custom={4} className="text-lg text-slate-600 leading-relaxed font-light">
                We pride ourselves on our honesty, dependability, accountability and accessibility. The relationships we forge with our clients are meaningful and enduring.
              </motion.p>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    whileHover={{ y: -4, scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
                    className={`${s.bg} p-7 rounded-2xl border border-white`}
                  >
                    <Icon className={`w-10 h-10 ${s.iconColor} mb-3`} />
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{s.value}</div>
                    <div className="text-slate-600 font-medium mt-0.5">{s.label}</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Technical Excellence */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 md:p-14 mb-24 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-700/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-800/15 rounded-full blur-[80px]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-300 font-semibold text-[11px] tracking-[0.2em] uppercase">Technical Excellence</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-5 tracking-tight">World-Class Technical Capability</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <p className="text-lg text-slate-300 leading-relaxed font-light">
                  Our on-the-ground technical team stays completely up-to-date with emerging international practices and technologies, and works with clients at every stage to ensure FM requirements are met to the last detail.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed font-light">
                  Through our ongoing energy management programmes, we gain complete efficiency from the buildings we maintain, providing our clients with real cost savings in the longer-term.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Core Values */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-full px-4 py-1.5 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-semibold text-[11px] tracking-[0.2em] uppercase">Our Foundation</span>
              </div>
              <h2 className="font-display text-4xl lg:text-[3.25rem] font-bold text-slate-900 tracking-tight">Our Core Values</h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid md:grid-cols-5 gap-6"
            >
              {coreValues.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    custom={idx}
                    whileHover={{ y: -6, transition: { type: 'spring', stiffness: 260, damping: 18 } }}
                    className="text-center group"
                  >
                    <div className="w-16 h-16 bg-emerald-100 group-hover:bg-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-colors duration-300 shadow-sm group-hover:shadow-md group-hover:shadow-emerald-200/50">
                      <Icon className="w-8 h-8 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 text-[15px]">{value.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-light">{value.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Certifications ── */}
      <CertificationsBar />
    </div>
  );
}