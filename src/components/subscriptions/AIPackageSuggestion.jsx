import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import clientAuth from '@/lib/clientAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, Loader2, Home, Building2, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PROPERTY_ICONS = { villa: Home, apartment: Building2, townhouse: Landmark };

export default function AIPackageSuggestion({ packages = [] }) {
  const [user, setUser] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    clientAuth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: properties = [] } = useQuery({
    queryKey: ['userPropsForSuggestion', user?.id],
    queryFn: async () => {
      const all = await base44.entities.Property.list();
      return all.filter(p => p.owner_id === user.id);
    },
    enabled: !!user?.id,
    initialData: []
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['userBookingsForSuggestion', user?.id],
    queryFn: async () => {
      const all = await base44.entities.Booking.list('-created_date', 50);
      return all.filter(b => b.customer_id === user.id);
    },
    enabled: !!user?.id,
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['servicesForSuggestion'],
    queryFn: () => base44.entities.Service.list(),
    initialData: []
  });

  useEffect(() => {
    if (!user || packages.length === 0 || dismissed) return;
    if (properties.length > 0 || bookings.length > 0) {
      generateSuggestion();
    }
  }, [user, packages, properties, bookings, services]);

  const generateSuggestion = async () => {
    setLoading(true);

    const propertyInfo = properties.map(p => ({
      type: p.property_type,
      bedrooms: p.bedrooms,
      area: p.area,
      sqm: p.square_meters,
    }));

    const bookedServices = bookings
      .map(b => services.find(s => s.id === b.service_id)?.name)
      .filter(Boolean);

    const packageList = packages.map(p => ({
      id: p.id,
      name: p.name,
      monthly_price: p.monthly_price,
      property_type: p.property_type,
      duration_months: p.duration_months,
      features: p.features?.slice(0, 5) || [],
      popular: p.popular,
    }));

    const prompt = `You are an AI advisor for INAYA Facilities Management in Dubai.

Customer data:
- Properties: ${propertyInfo.length > 0 ? JSON.stringify(propertyInfo) : 'No properties registered yet'}
- Past services booked: ${bookedServices.length > 0 ? bookedServices.join(', ') : 'None'}
- Number of past bookings: ${bookings.length}

Available subscription packages:
${JSON.stringify(packageList)}

Based on the customer's property type, size, and booking history, recommend the BEST package for them.
Explain WHY this package is perfect for their needs in 2-3 sentences.
Also estimate how much they could save vs booking services individually.
If the customer has no properties registered, base the suggestion on their booking history or recommend the most popular package.`;

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_package_id: { type: "string", description: "The ID of the recommended package" },
            reason: { type: "string", description: "2-3 sentence personalized explanation" },
            estimated_monthly_savings: { type: "number", description: "Estimated monthly savings in AED" },
            match_score: { type: "number", description: "How well this package matches the customer, 1-100" },
            highlight: { type: "string", description: "One short highlight phrase like 'Perfect for your 3BR villa'" },
          }
        }
      });

      const pkg = packages.find(p => p.id === res.recommended_package_id);
      if (pkg) {
        setSuggestion({ ...res, package: pkg });
      }
    } catch {
      setSuggestion(null);
    }
    setLoading(false);
  };

  if (dismissed || !user) return null;
  if (!loading && !suggestion) return null;

  if (loading) {
    return (
      <div className="mb-10">
        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3 text-indigo-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Finding the perfect plan for you...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!suggestion) return null;

  const pkg = suggestion.package;
  const PropertyIcon = PROPERTY_ICONS[properties[0]?.property_type] || Home;

  return (
    <div className="mb-10">
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <CardContent className="py-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">AI Recommendation</h3>
                <p className="text-xs text-indigo-600 font-medium">{suggestion.highlight}</p>
              </div>
            </div>
            <button onClick={() => setDismissed(true)} className="text-xs text-slate-400 hover:text-slate-600">
              Dismiss
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-5">
            {/* Package card */}
            <div className="bg-white rounded-xl border border-indigo-100 p-5 flex-1 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <PropertyIcon className="w-5 h-5 text-indigo-500" />
                <h4 className="font-bold text-lg text-slate-900">{pkg.name}</h4>
                {pkg.popular && <Badge className="bg-amber-100 text-amber-700 text-[10px]">Popular</Badge>}
              </div>
              <div className="mb-3">
                <span className="text-3xl font-bold text-indigo-600">AED {pkg.monthly_price}</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>
              {suggestion.estimated_monthly_savings > 0 && (
                <Badge className="bg-emerald-100 text-emerald-700 mb-3">
                  Save ~AED {suggestion.estimated_monthly_savings}/month
                </Badge>
              )}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(pkg.features || []).slice(0, 4).map((f, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] text-slate-600">{f}</Badge>
                ))}
              </div>
              <Link to={createPageUrl('SubscribePackage') + '?package=' + pkg.id}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                  Get This Plan <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Reason */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-white/80 rounded-xl p-4 border border-indigo-100">
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{suggestion.reason}</p>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-400">Match score:</div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${suggestion.match_score || 75}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-indigo-600">{suggestion.match_score || 75}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
