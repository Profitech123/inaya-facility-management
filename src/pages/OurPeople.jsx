import React from 'react';
import { Shield, Heart, Award, Users, GraduationCap, HandHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const commitments = [
  { icon: Shield, title: "Safe Working Conditions", desc: "Provision of safe working conditions for all employees" },
  { icon: Award, title: "Recognition & Reward", desc: "Exceptional performance is recognized and rewarded" },
  { icon: Heart, title: "Respect & Empowerment", desc: "Respect, value and empowerment of employees" },
  { icon: GraduationCap, title: "Training & Development", desc: "Invest in employee training and development" },
  { icon: Users, title: "Career Opportunities", desc: "Provide career development opportunities" },
  { icon: HandHeart, title: "Community Service", desc: "Encourage employees to extend their attitude of service to the community" },
];

export default function OurPeople() {
  return (
    <div className="min-h-screen">
      <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://www.inaya.ae/wp-content/uploads/2023/04/our-people.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative max-w-7xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-6">Our People</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Who made INAYA the top Facilities Management company in Dubai & UAE
          </p>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">We Are All About Our People</h2>
            <p className="text-lg text-slate-600 mb-4">
              At INAYA, our strength lies in our highly motivated team who go beyond the boundaries of contractual obligations to deliver exceptional services to our clients.
            </p>
            <p className="text-lg text-slate-600 mb-4">
              With over 700 people from diverse backgrounds working throughout our portfolio for a range of clients and in a variety of roles, they are by far our greatest asset.
            </p>
            <p className="text-lg text-slate-600">
              We believe that the key to keeping our employees happy is to genuinely care about them. That's our golden key that unlocks the doors to a happy workplace with happy employees serving happy customers.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Being a People-Oriented Company, We Ensure:
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {commitments.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-slate-50 rounded-xl p-6 flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Team Photos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              "https://www.inaya.ae/wp-content/uploads/2018/02/6.jpg",
              "https://www.inaya.ae/wp-content/uploads/2018/02/5.jpg",
              "https://www.inaya.ae/wp-content/uploads/2018/02/4.jpg",
              "https://www.inaya.ae/wp-content/uploads/2018/02/3.jpg",
              "https://www.inaya.ae/wp-content/uploads/2018/02/2.jpg",
              "https://www.inaya.ae/wp-content/uploads/2018/02/1.jpg",
              "https://www.inaya.ae/wp-content/uploads/2018/02/27.jpg",
              "https://www.inaya.ae/wp-content/uploads/2018/02/26.jpg",
            ].map((src, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden h-48">
                <img src={src} alt="INAYA Team" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Join Our Team
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}