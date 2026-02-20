import React from 'react';
import { Snowflake, Wrench, HardHat, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const services = [
  {
    icon: Snowflake,
    title: "AC Maintenance",
    description: "Deep cleaning, gas top-up, filter replacement and full system diagnostics by certified technicians.",
    image: "/images/service-ac.jpg",
    link: "HardServices",
  },
  {
    icon: Wrench,
    title: "MEP Services",
    description: "Complete mechanical, electrical, and plumbing solutions for residential and commercial properties.",
    image: "/images/service-electrical.jpg",
    link: "HardServices",
  },
  {
    icon: HardHat,
    title: "Civil Works",
    description: "Professional painting, carpentry, masonry, and renovation services with meticulous attention to detail.",
    image: "/images/service-cleaning.jpg",
    link: "HardServices",
  },
];

export default function SpecializedServices() {
  return (
    <section className="py-24 lg:py-32" style={{ backgroundColor: 'hsl(210,20%,6%)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-8 h-[1px]" style={{ backgroundColor: 'hsl(160,60%,45%)' }} />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: 'hsl(160,60%,45%)' }}>
                Our Expertise
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl lg:text-5xl font-bold text-white"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Specialized{' '}
              <span className="italic" style={{ color: 'hsl(160,60%,45%)' }}>services.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-white/50 max-w-md text-sm leading-relaxed"
          >
            Expert care for every aspect of your property, delivered by certified professionals with years of experience.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <Link
                  to={createPageUrl(service.link)}
                  className="block group rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(210,20%,6%)] via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="p-6 bg-white/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(160,60%,38%)', color: 'white' }}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{service.title}</h3>
                          <p className="text-white/40 text-sm mt-1">{service.description}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
