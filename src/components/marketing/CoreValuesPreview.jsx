import React from 'react';
import { Heart, Shield, Target, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const values = [
  {
    icon: Heart,
    title: "Our Core Values",
    desc: "At INAYA, meaning 'care' in Arabic, we understand that our reputation rests on providing our services responsibly, ethically and sustainably.",
    link: "About",
    accent: "from-rose-500 to-pink-600",
    lightBg: "bg-rose-50",
    iconColor: "text-rose-600"
  },
  {
    icon: Shield,
    title: "Our People",
    desc: "With over 700 people from diverse backgrounds working throughout our portfolio, they are by far our greatest asset.",
    link: "OurPeople",
    accent: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50",
    iconColor: "text-emerald-600"
  },
  {
    icon: Target,
    title: "Integrated FM Services",
    desc: "Our integrated FM offering provides the most comprehensive range of both 'hard' maintenance and 'soft' cleaning/specialised services.",
    link: "IntegratedFM",
    accent: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50",
    iconColor: "text-blue-600"
  }
];

export default function CoreValuesPreview() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 }}
              >
                <Link
                  to={createPageUrl(item.link)}
                  className="group relative block bg-slate-50 rounded-3xl p-8 lg:p-10 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Gradient accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-3xl`} />

                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${item.lightBg} flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${item.iconColor}`} />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:-translate-y-1 group-hover:translate-x-1 transition-all" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}