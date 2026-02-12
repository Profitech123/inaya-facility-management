import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building, ClipboardList, DollarSign, Users, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import QuoteRequestForm from '../components/services/QuoteRequestForm';

const keyProjects = [
  "APCO Worldwide – Office Interior fit out, Media City",
  "Asma Majid Tower Abu Dhabi – Refurbishment works",
  "Dragon Mart 2 – Supply and installation of Hoarding works during tenancy fit out phase",
  "Golden Mile 1 & 2, Palm Jumeirah – Development of retail areas with re-design/re-configuration",
  "Ibn Battuta Mall – Reconfiguration and Renovation of Washrooms",
  "Al Khail Gate community – Kitchen cabinet installations in over 3000 units",
  "Crescent Wall Palm Jumeirah – Refurbishment and Painting works of the 10 km long crescent wall",
  "Discovery Gardens – Exterior and Façade painting of 63 OA managed buildings",
  "Discovery Gardens – Supply & Installation of aluminium window shutters for 49 OA managed buildings",
  "EOL refurbishments of more than 4000 residential units for clients such as Nakheel, Wasl etc."
];

export default function ProjectManagement() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-emerald-400 font-semibold mb-2">Facilities Management</p>
          <h1 className="text-5xl font-bold mb-6">Project Management</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Building refurbishment, fit-out, renovation and turnkey solutions tailored to your specific requirements.
          </p>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <img 
              src="https://www.inaya.ae/wp-content/uploads/2018/01/project-management-office-commercial-fit-out-refurbishment-works-dubai-abudhabi-uae-inaya.jpg" 
              alt="Project Management" 
              className="rounded-xl shadow-lg w-full h-80 object-cover"
            />
            <div>
              <p className="text-lg text-slate-600 mb-4">
                In recent years INAYA has diversified its activities into the field of building refurbishment and project management. This has been a natural progression to enable us to provide our clients a "one stop shop" facility in building services provision.
              </p>
              <p className="text-lg text-slate-600 mb-4">
                We undertake projects ranging from simple refurbishment of residential and commercial units to complex building reconfiguration and retrofit projects. We cover all building aspects including civil and MEP aspects and decorative works.
              </p>
              <p className="text-lg text-slate-600">
                Our focus is on providing clients with turnkey solutions tailored to their specific requirements.
              </p>
            </div>
          </div>

          {/* Key Attributes */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {[
              { icon: DollarSign, title: "Accurate Estimation", desc: "Precise cost estimation for every project" },
              { icon: ClipboardList, title: "Effective Cost Control", desc: "Budget management throughout the project" },
              { icon: Building, title: "Pre-execution Planning", desc: "Thorough planning before any work begins" },
              { icon: Users, title: "Experienced Team", desc: "Vast experience across refurbishment industry" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Key Projects */}
          <div className="bg-slate-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">Key Projects</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {keyProjects.map((project, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <span className="text-slate-700">{project}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center mb-16">
            <Link to={createPageUrl('Contact')}>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 mr-4">
                <Phone className="w-5 h-5 mr-2" /> Discuss Your Project
              </Button>
            </Link>
          </div>

          <div id="quote-form">
            <QuoteRequestForm serviceName="Project Management" />
          </div>
        </div>
      </div>
    </div>
  );
}