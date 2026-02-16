import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const POPULAR_SEARCHES = [
  "AC maintenance",
  "Deep cleaning",
  "Plumbing repair",
  "Pest control",
  "Pool maintenance",
  "Electrical work",
  "Landscaping",
  "Paint & handyman"
];

export default function ServiceFinderInput({ onSearch, loading = false }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you need... e.g. 'my AC is not cooling' or 'villa deep clean'"
              className="pl-12 h-14 text-base border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-base font-semibold shadow-md gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Finding...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Find Services</>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-sm text-slate-500 mr-1 self-center">Popular:</span>
        {POPULAR_SEARCHES.map((term) => (
          <button
            key={term}
            onClick={() => { setQuery(term); onSearch(term); }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-sm text-slate-600 transition-colors border border-transparent hover:border-emerald-200"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}