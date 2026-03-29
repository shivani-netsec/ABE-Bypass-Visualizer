import React, { useState } from 'react';
import { Simulation } from '../types';
import { ATTACK_SCENARIOS } from '../services/simulationEngine';
import { ShieldAlert, ShieldCheck, Search, Trash2, ChevronRight, Filter } from 'lucide-react';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import LogsViewer from './LogsViewer';

interface SimulationHistoryProps {
  simulations: Simulation[];
}

export default function SimulationHistory({ simulations }: SimulationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'success' | 'blocked'>('all');
  const [selectedSim, setSelectedSim] = useState<Simulation | null>(null);

  const filteredSims = simulations.filter(sim => {
    const matchesSearch = sim.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || sim.result === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this simulation?')) {
      try {
        await deleteDoc(doc(db, 'simulations', id));
      } catch (err) {
        console.error("Error deleting simulation:", err);
      }
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tighter uppercase italic">Simulation <span className="text-[#F27D26]">History</span></h1>
          <p className="text-white/50 mt-1 text-sm md:text-base">Review and analyze your past simulation results.</p>
        </div>
      </header>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#F27D26] transition-colors text-sm"
              placeholder="Search simulations..."
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {(['all', 'success', 'blocked'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl border text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-[#F27D26] text-black border-[#F27D26]' 
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Simulation</th>
                <th className="pb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Type</th>
                <th className="pb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Risk</th>
                <th className="pb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Result</th>
                <th className="pb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Date</th>
                <th className="pb-4 px-4 text-[10px] font-bold uppercase tracking-widest text-white/30"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSims.map((sim) => (
                <tr 
                  key={sim.id} 
                  onClick={() => setSelectedSim(sim)}
                  className="group hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <p className="font-bold">{sim.name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-white/50">{ATTACK_SCENARIOS[sim.attackType]?.name}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                      sim.riskLevel === 'high' ? 'bg-red-500/10 text-red-500' :
                      sim.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {sim.riskLevel}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {sim.result === 'success' ? (
                        <ShieldAlert className="w-4 h-4 text-[#F27D26]" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                      )}
                      <span className={`text-xs font-bold uppercase italic ${sim.result === 'success' ? 'text-[#F27D26]' : 'text-green-500'}`}>
                        {sim.result === 'success' ? 'Vulnerable' : 'Blocked'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-white/30">{new Date(sim.timestamp).toLocaleDateString()}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={(e) => handleDelete(sim.id, e)}
                        className="p-2 text-white/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <ChevronRight className="text-white/10 group-hover:text-[#F27D26] transition-colors" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredSims.map((sim) => (
            <div 
              key={sim.id}
              onClick={() => setSelectedSim(sim)}
              className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-lg leading-tight">{sim.name}</p>
                  <p className="text-xs text-white/40 mt-1">{ATTACK_SCENARIOS[sim.attackType]?.name}</p>
                </div>
                <button 
                  onClick={(e) => handleDelete(sim.id, e)}
                  className="p-2 text-white/20 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  {sim.result === 'success' ? (
                    <ShieldAlert className="w-4 h-4 text-[#F27D26]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  )}
                  <span className={`text-[10px] font-bold uppercase italic ${sim.result === 'success' ? 'text-[#F27D26]' : 'text-green-500'}`}>
                    {sim.result === 'success' ? 'Vulnerable' : 'Blocked'}
                  </span>
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                  sim.riskLevel === 'high' ? 'bg-red-500/10 text-red-500' :
                  sim.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  {sim.riskLevel} Risk
                </span>
              </div>
              
              <div className="flex items-center justify-between text-[10px] text-white/30 uppercase tracking-widest font-bold">
                <span>{new Date(sim.timestamp).toLocaleDateString()}</span>
                <div className="flex items-center gap-1 text-[#F27D26]">
                  View Logs <ChevronRight size={12} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSims.length === 0 && (
          <div className="text-center py-20 text-white/20 italic">
            No simulations found matching your criteria.
          </div>
        )}
      </div>

      {selectedSim && (
        <LogsViewer simulation={selectedSim} onClose={() => setSelectedSim(null)} />
      )}
    </div>
  );
}
