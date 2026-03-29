import React from 'react';
import { Simulation } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert, ShieldCheck, Activity, Zap, ArrowUpRight, TrendingUp, History } from 'lucide-react';

interface DashboardProps {
  simulations: Simulation[];
  onStartSimulation: () => void;
}

export default function Dashboard({ simulations, onStartSimulation }: DashboardProps) {
  const totalSims = simulations.length;
  const highRiskSims = simulations.filter(s => s.riskLevel === 'high').length;
  const blockedSims = simulations.filter(s => s.result === 'blocked').length;
  const successSims = simulations.filter(s => s.result === 'success').length;

  const chartData = [
    { name: 'Vulnerable', value: successSims, color: '#F27D26' },
    { name: 'Blocked', value: blockedSims, color: '#22c55e' },
    { name: 'High Risk', value: highRiskSims, color: '#ef4444' },
  ];

  const recentActivity = simulations.slice(0, 5);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tighter uppercase italic">Security <span className="text-[#F27D26]">Dashboard</span></h1>
          <p className="text-white/50 mt-1 text-sm md:text-base">Overview of your browser attack simulations and risk analysis.</p>
        </div>
        <button
          onClick={onStartSimulation}
          className="bg-[#F27D26] text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-[#ff8c38] transition-all shadow-[0_0_20px_rgba(242,125,38,0.2)]"
        >
          <Zap className="w-5 h-5" />
          New Simulation
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Simulations" value={totalSims} icon={<Activity className="text-blue-400" />} trend="+12%" />
        <StatCard label="High Risk Detected" value={highRiskSims} icon={<ShieldAlert className="text-red-500" />} trend="+5%" trendColor="text-red-500" />
        <StatCard label="Attacks Blocked" value={blockedSims} icon={<ShieldCheck className="text-green-500" />} trend="+8%" trendColor="text-green-500" />
        <StatCard label="Vulnerability Rate" value={totalSims ? `${Math.round((successSims / totalSims) * 100)}%` : '0%'} icon={<TrendingUp className="text-[#F27D26]" />} trend={totalSims ? (successSims / totalSims > 0.5 ? 'High' : 'Low') : 'N/A'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 md:p-8">
          <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2"><TrendingUp className="text-[#F27D26] w-5 h-5" />Simulation Outcomes</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 md:p-8">
          <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2"><History className="text-[#F27D26] w-5 h-5" />Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((sim) => (
              <div key={sim.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-[#F27D26]/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${sim.result === 'success' ? 'bg-[#F27D26]' : 'bg-green-500'}`} />
                  <div>
                    <p className="font-bold text-sm truncate max-w-[120px]">{sim.name}</p>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">{new Date(sim.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-[#F27D26] transition-colors" />
              </div>
            )) : <div className="text-center py-12 text-white/20 italic text-sm">No simulations run yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend, trendColor = 'text-white/30' }: { label: string; value: string | number; icon: React.ReactNode; trend: string; trendColor?: string }) {
  return (
    <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 hover:border-[#F27D26]/30 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
        <span className={`text-[10px] font-bold ${trendColor} bg-white/5 px-2 py-1 rounded-full`}>{trend}</span>
      </div>
      <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold tracking-tighter">{value}</p>
    </div>
  );
}