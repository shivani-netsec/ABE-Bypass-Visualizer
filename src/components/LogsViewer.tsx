import React from 'react';
import { Simulation } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Terminal, Clock, ShieldAlert, ShieldCheck } from 'lucide-react';

interface LogsViewerProps {
  simulation: Simulation;
  onClose: () => void;
}

export default function LogsViewer({ simulation, onClose }: LogsViewerProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
      >
        <header className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${simulation.result === 'success' ? 'bg-[#F27D26]/10 text-[#F27D26]' : 'bg-green-500/10 text-green-500'}`}>
              {simulation.result === 'success' ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{simulation.name}</h2>
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Detailed Activity Logs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm">
          <div className="p-4 bg-black rounded-xl border border-white/5 text-white/40 mb-6">
            <p># Simulation Metadata</p>
            <p>ID: {simulation.id}</p>
            <p>Timestamp: {new Date(simulation.timestamp).toISOString()}</p>
            <p>Attack Vector: {simulation.attackType}</p>
            <p>Final Result: {simulation.result.toUpperCase()}</p>
            <p>Risk Level: {simulation.riskLevel.toUpperCase()}</p>
          </div>

          <div className="space-y-4">
            {simulation.steps.map((step, i) => (
              <div key={step.id} className="group">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      step.status === 'success' ? 'bg-[#F27D26]' : 
                      step.status === 'failed' ? 'bg-red-500' : 'bg-white/20'
                    }`} />
                    {i < simulation.steps.length - 1 && <div className="w-px h-full bg-white/10" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-bold flex items-center gap-2">
                        <Terminal size={14} className="text-white/30" />
                        {step.action}
                      </span>
                      <span className="text-[10px] text-white/20 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-white/40 leading-relaxed">{step.details}</p>
                    <div className="mt-2 flex gap-2">
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        step.status === 'success' ? 'bg-green-500/10 text-green-500' : 
                        step.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/30'
                      }`}>
                        {step.status}
                      </span>
                      <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        step.riskFlag === 'high' ? 'bg-red-500/10 text-red-500' :
                        step.riskFlag === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {step.riskFlag} Risk
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="p-6 border-t border-white/10 bg-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-[#F27D26] text-black font-bold rounded-xl hover:bg-[#ff8c38] transition-all"
          >
            Close Logs
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
