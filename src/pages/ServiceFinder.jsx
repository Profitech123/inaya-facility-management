import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Search } from 'lucide-react';

import ServiceFinderInput from '../components/service-finder/ServiceFinderInput';
import CategoryBrowser from '../components/service-finder/CategoryBrowser';
import ServiceFinderResults from '../components/service-finder/ServiceFinderResults';
import QuoteForm from '../components/service-finder/QuoteForm';

export default function ServiceFinder() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [lastQuery, setLastQuery] = useState('');

  const { data: services = [] } = useQuery({
    queryKey: ['finderServices'],
    queryFn: () => base44.entities.Service.filter({ is_active: true }),
    initialData: [],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['finderCategories'],
    queryFn: () => base44.entities.ServiceCategory.list('display_order'),
    initialData: [],
  });

  const { data: packages = [] } = useQuery({
    queryKey: ['finderPackages'],
    queryFn: () => base44.entities.SubscriptionPackage.filter({ is_active: true }),
    initialData: [],
  });

  const handleSearch = async (query) => {
    setLastQuery(query);
    setLoading(true);
    setResults(null);

    const serviceList = services.map(s => ({
      id: s.id,
      name: s.name,
      category: categories.find(c => c.id === s.category_id)?.name || '',
      price: s.price,
      duration_minutes: s.duration_minutes,
      description: s.description?.slice(0, 150),
      features: s.features?.slice(0, 5),
    }));

    const packageList = packages.map(p => ({
      id: p.id,
      name: p.name,
      monthly_price: p.monthly_price,
      duration_months: p.duration_months,
      property_type: p.property_type,
      description: p.description?.slice(0, 100),
      services_count: p.services?.length || 0,
      discount_percentage: p.discount_percentage,
    }));

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are INAYA's intelligent Service Finder for a Dubai-based facilities management company.

User query: "${query}"

Available services:
${JSON.stringify(serviceList)}

Available subscription packages:
${JSON.stringify(packageList)}

Instructions:
1. Analyze the user's query and match the most relevant services (up to 5). Rank by relevance (match_score 0-100).
2. For each matched service, provide:
   - service_id (from the list)
   - service_name
   - category name
   - match_score (0-100)
   - ai_reason: A short helpful sentence explaining why this service matches and what it includes
   - estimated_price: Format as "AED X" or "From AED X" using the service price
   - estimated_duration: Convert duration_minutes to human-friendly format like "2-3 hours" or "45 mins". If no duration data, estimate based on typical Dubai FM industry standards.
3. If a subscription package would save the user money for recurring needs, suggest up to 2 packages with:
   - package_id, package_name, monthly_price formatted as "AED X", ai_reason, savings (e.g. "up to 20%")
4. Write a short summary (2-3 sentences) that directly addresses the user's need and guides them.
5. Set suggest_quote to true if the query is very specific, mentions custom work, large projects, or if no services match well.

Dubai FM context: Consider typical costs — AC service AED 150-400, cleaning AED 200-600, plumbing AED 150-350, pest control AED 200-500, pool maintenance AED 300-800/month, landscaping AED 500-2000/month, electrical AED 150-400.`,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          services: {
            type: "array",
            items: {
              type: "object",
              properties: {
                service_id: { type: "string" },
                service_name: { type: "string" },
                category: { type: "string" },
                match_score: { type: "number" },
                ai_reason: { type: "string" },
                estimated_price: { type: "string" },
                estimated_duration: { type: "string" }
              }
            }
          },
          packages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                package_id: { type: "string" },
                package_name: { type: "string" },
                monthly_price: { type: "string" },
                ai_reason: { type: "string" },
                savings: { type: "string" }
              }
            }
          },
          suggest_quote: { type: "boolean" }
        }
      }
    });

    setResults(res);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 rounded-full blur-[200px] -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-4xl mx-auto px-6 py-16 lg:py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">AI-Powered Service Finder</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Find the Right Service <br className="hidden sm:block" />
              <span className="text-emerald-400">in Seconds</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Describe what you need in your own words, and our AI will match you with the best services, estimated costs, and packages for your property in Dubai.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <ServiceFinderInput onSearch={handleSearch} loading={loading} />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Category Browser (show when no results) */}
        {!results && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <CategoryBrowser onSelect={handleSearch} />
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-3 rounded-full text-sm font-medium">
              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              Analyzing your request and finding the best matches...
            </div>
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <div className="space-y-10">
            <ServiceFinderResults results={results} />
            <div className="border-t border-slate-200 pt-10">
              <QuoteForm prefillQuery={lastQuery} />
            </div>
          </div>
        )}

        {/* Quote Form (always visible when no results) */}
        {!results && !loading && (
          <div className="mt-4">
            <QuoteForm />
          </div>
        )}
      </div>
    </div>
  );
}