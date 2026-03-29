import React from 'react';
import { AttackType } from '../types';
import { getPreventionTips } from '../services/simulationEngine';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PreventionTipsProps {
  attackType: AttackType;
}

export default function PreventionTips({ attackType }: PreventionTipsProps) {
  const tips = getPreventionTips(attackType);

  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck className="text-green-500 w-5 h-5" />
        Prevention Suggestions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
            <CheckCircle2 className="text-green-500 w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm text-white/70 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-[#F27D26]/5 border border-[#F27D26]/20 rounded-2xl">
        <p className="text-xs text-[#F27D26] font-medium leading-relaxed italic">
          Note: These suggestions are general security best practices. For comprehensive protection, always use multi-layered security solutions and keep your browser and OS updated.
        </p>
      </div>
    </div>
  );
}
