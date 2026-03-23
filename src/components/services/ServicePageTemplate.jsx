import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import QuoteRequestForm from './QuoteRequestForm';

/**
 * ServicePageTemplate
 * 
 * Props:
 *  - category: string (tag above headline, e.g. "Facilities Management")
 *  - title: string
 *  - subtitle: string
 *  - heroImage: string (Unsplash or CDN URL)
 *  - description: string[] (paragraphs shown in the intro section)
 *  - subServices: { icon: LucideIcon, title: string, desc: string, color?: string }[]
 *  - highlights: string[] (bullet list of key benefits)
 *  - highlightsTitle?: string
 *  - ctaLink?: string (page name for "Book Now" button)
 *  - ctaLabel?: string
 *  - extraSection?: React.ReactNode (optional extra content between highlights and quote form)
 */
export default function ServicePageTemplate({
  category,
  title,
  subtitle,
  heroImage,
  description = [],
  subServices = [],
  highlights = [],
  highlightsTitle = "Why Choose Us?",
  ctaLink = "OnDemandServices",
  ctaLabel = "Book a Service",
  extraSection,
}) {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-slate-900 text-white py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt={title}
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/50 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-emerald-400 font-semibold mb-3 uppercase tracking-widest text-sm"
          >
            {category}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight max-w-3xl leading-tight"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed font-light"
          >
            {subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <Link to={createPageUrl(ctaLink)}>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 rounded-xl font-semibold shadow-lg shadow-emerald-900/30">
                {ctaLabel} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#quote-form">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-12 px-8 rounded-xl font-semibold">
                Request a Quote
              </Button>
            </a>
          </motion.div>
        </div>
      </div>

      <div className="bg-white">
        {/* Description Section */}
        {description.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              {description.map((para, i) => (
                <p key={i} className="text-lg text-slate-600 leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Services Grid */}
        {subServices.length > 0 && (
          <div className="bg-slate-50 py-20">
            <div className="max-w-7xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Our {title} Services
                </h2>
                <p className="text-slate-500 mt-3 text-lg">Comprehensive solutions for every need</p>
              </motion.div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {subServices.map((service, idx) => {
                  const Icon = service.icon;
                  const colorClass = service.color || 'bg-emerald-100 text-emerald-600';
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-2 text-base">{service.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{service.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Highlights / Key Benefits */}
        {highlights.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 md:p-14 text-white">
              <h3 className="text-2xl lg:text-3xl font-extrabold mb-8">{highlightsTitle}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Optional extra section */}
        {extraSection && (
          <div className="max-w-7xl mx-auto px-6 pb-10">
            {extraSection}
          </div>
        )}

        {/* Quote Form */}
        <div className="max-w-7xl mx-auto px-6 pb-24" id="quote-form">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900">Get a Free Quote</h2>
              <p className="text-slate-500 mt-2">Tell us about your property and we'll tailor a solution for you.</p>
            </div>
            <QuoteRequestForm serviceName={title} />
          </div>
        </div>
      </div>
    </div>
  );
}