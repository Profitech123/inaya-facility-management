import React from 'react';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';



const Testimonials = () => {
    const { data: testimonials = [] } = useQuery({
        queryKey: ['publicTestimonials'],
        queryFn: () => base44.entities.Testimonial.list('display_order'),
        staleTime: 60000
    });

    const activeTestimonials = testimonials.filter(t => t.is_active);

    // Fallback if no testimonials in DB yet
    const displayData = activeTestimonials.length > 0 ? activeTestimonials : [
        {
            name: "Sarah Al-Maktoum",
            role: "Villa Owner, Jumeirah",
            content: "INAYA's team transformed our home. The deep cleaning service was thorough. Highly recommended!",
            rating: 5,
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
        },
        {
            name: "James Anderson",
            role: "Resident, Downtown Dubai",
            content: "The AC maintenance service is top-notch. They fixed a leak that others missed.",
            rating: 5,
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
        },
        {
            name: "Layla Hassan",
            role: "Business Owner",
            content: "We use INAYA for our office maintenance. Their response time is excellent.",
            rating: 4,
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150"
        }
    ];

    return (
        <section className="py-16 md:py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-display">
                        What Our Clients Say
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Trusted by over 500+ homeowners across Dubai.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {displayData.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                        >
                            <div className="flex gap-1 mb-4 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < testimonial.rating ? 'fill-current' : 'text-slate-200'}`}
                                    />
                                ))}
                            </div>
                            <p className="text-slate-700 mb-6 leading-relaxed">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-4">
                                <img
                                    src={testimonial.image || 'https://via.placeholder.com/50'}
                                    alt={testimonial.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
