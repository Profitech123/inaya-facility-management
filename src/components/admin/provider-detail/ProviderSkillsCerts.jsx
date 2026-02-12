import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export default function ProviderSkillsCerts({ provider }) {
  const skills = provider.specialization || [];
  
  // Generate some professional certs based on specialization
  const certs = skills.map(skill => `${skill} Certified`).slice(0, 3);
  if (certs.length === 0) certs.push('General Maintenance');

  return (
    <Card className="bg-white h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Skills & Certifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Technical Skills */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-2">TECHNICAL SKILLS</div>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? skills.map((skill, i) => (
              <Badge key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200">
                {skill}
              </Badge>
            )) : (
              <span className="text-sm text-slate-400">No skills listed</span>
            )}
          </div>
        </div>

        {/* Professional Certs */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 tracking-wider mb-2">PROFESSIONAL CERTS</div>
          <div className="space-y-2">
            {certs.map((cert, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {cert}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}