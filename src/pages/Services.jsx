import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Sparkles, Wrench, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Services() {
  const { data: categories = [] } = useQuery({
    queryKey: ['serviceCategories'],
    queryFn: async () => {
      try {
        return await base44.entities.ServiceCategory.list('display_order');
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    },
    initialData: []
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        const allServices = await base44.entities.Service.list();
        return allServices.filter(s => s.is_active === true);
      } catch (error) {
        console.error('Error fetching services:', error);
        return [];
      }
    },
    initialData: []
  });

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category_id === selectedCategory);

  const categoryIcons = {
    'soft-services': Sparkles,
    'hard-services': Wrench,
    'specialized-services': Settings
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6">Our Services</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Professional home care services available on-demand or through subscription packages. Transparent pricing, instant booking.
          </p>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4">
              <TabsTrigger value="all">All Services</TabsTrigger>
              {categories.slice(0, 3).map(cat => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {cat.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {filteredServices.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-600 text-lg mb-4">No services available yet.</p>
              <p className="text-slate-500">Check back soon or contact us for custom requests.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {filteredServices.map(service => {
                const category = categories.find(c => c.id === service.category_id);
                const Icon = categoryIcons[category?.slug] || Sparkles;
                
                return (
                  <Card key={service.id} className="hover:shadow-xl transition-shadow">
                    <CardHeader>
                      {service.image_url && (
                        <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                          <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl">{service.name}</CardTitle>
                        <Icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      {category && (
                        <Badge variant="outline" className="w-fit">{category.name}</Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">{service.description}</p>
                      
                      {service.features && service.features.length > 0 && (
                        <ul className="space-y-1 mb-4">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <div className="text-2xl font-bold text-slate-900">AED {service.price}</div>
                          <div className="text-sm text-slate-500">Starting from</div>
                        </div>
                        <Link to={createPageUrl('BookService') + '?service=' + service.id}>
                          <Button className="bg-emerald-600 hover:bg-emerald-700">
                            Book Now
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}