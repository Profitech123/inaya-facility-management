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
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600"
  },
  {
    icon: Shield,
    title: "Our People",
    desc: "With over 700 people from diverse backgrounds working throughout our portfolio, they are by far our greatest asset.",
    link: "OurPeople",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600"
  },
  {
    icon: Target,
    title: "Integrated FM Services",
    desc: "Our integrated FM offering provides the most comprehensive range of both 'hard' maintenance and 'soft' cleaning/specialised services.",
    link: "IntegratedFM",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600"
  }
];

export default function CoreValuesPreview() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-5">
          {values.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={createPageUrl(item.link)}
                  className="group block bg-slate-50 border border-slate-100 rounded-2xl p-7 hover:bg-white hover:shadow-lg hover:border-slate-200 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-11 h-11 rounded-lg ${item.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
