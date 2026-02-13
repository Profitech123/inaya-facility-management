import React from 'react';
import { Snowflake, Wrench, HardHat } from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    icon: Snowflake,
    title: "AC Maintenance",
    description: "Cleaning, repairs & gas top-up",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    image: "/images/service-ac.jpg",
  },
  {
    icon: Wrench,
    title: "MEP Services",
    description: "Mechanical, Electrical, Plumbing",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    image: "/images/service-electrical.jpg",
  },
  {
    icon: HardHat,
    title: "Civil Works",
    description: "Painting, carpentry & masonry",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    image: "/images/service-cleaning.jpg",
  },
];

export default function SpecializedServices() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-slate-900"
          >
            Specialized Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-slate-500 max-w-2xl mx-auto"
          >
            Expert care for every corner of your home, handled by certified professionals.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-100 group"
              >
                <div className="h-44 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 ${service.iconBg} ${service.iconColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{service.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{service.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
