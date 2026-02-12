import React from 'react';
import { Heart, Shield, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const values = [
  {
    icon: Heart,
    title: "Our Core Values",
    desc: "At INAYA, meaning 'care' in Arabic, we understand that our reputation rests on providing our services responsibly, ethically and sustainably.",
    link: "About"
  },
  {
    icon: Shield,
    title: "Our People",
    desc: "With over 700 people from diverse backgrounds working throughout our portfolio, they are by far our greatest asset.",
    link: "OurPeople"
  },
  {
    icon: Target,
    title: "Integrated FM Services",
    desc: "Our integrated FM offering provides the most comprehensive range of both 'hard' maintenance and 'soft' cleaning/specialised services.",
    link: "IntegratedFM"
  }
];

export default function CoreValuesPreview() {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link key={idx} to={createPageUrl(item.link)} 
                className="group bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}