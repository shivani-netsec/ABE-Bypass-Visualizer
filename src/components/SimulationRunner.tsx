import React, { useState, useEffect } from 'react';
import { AttackType, SimulationStep } from '../types';
import { ATTACK_SCENARIOS, getRiskLevel } from '../services/simulationEngine';
import { motion, AnimatePresence } from 'motion/react';
import { Play, ShieldAlert, ShieldCheck, Terminal, Loader2, CheckCircle2, XCircle, Info, ArrowRight } from 'lucide-react';
import PreventionTips from './PreventionTips';

interface SimulationRunnerProps {
  user: any;
  onComplete: () => void;
}

export default function SimulationRunner({ user, onComplete }: SimulationRunnerProps) {
  const [name, setName] = useState('');
  const [attackType, setAttackType] = useState<AttackType | ''>('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [result, setResult] = useState<'success' | 'blocked' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleStart = () => {
    if (!name || !attackType) return;
    
    const scenario = ATTACK_SCENARIOS[attackType];
    const initialSteps: SimulationStep[] = scenario.steps.map((s, i) => ({
      ...s,
      id: `step-${i}`,
      status: 'pending',
      timestamp: Date.now()
    }));

    setSteps(initialSteps);
    setIsRunning(true);
    setCurrentStepIndex(0);
    setResult(null);
  };

  useEffect(() => {
    if (isRunning && currentStepIndex >= 0 && currentStepIndex < steps.length) {
      const timer = setTimeout(() => {
        const isBlocked = Math.random() > 0.7 && currentStepIndex > 1;
        const isEnding = isBlocked || currentStepIndex === steps.length - 1;
        const finalResult = isBlocked ? 'blocked' : (currentStepIndex === steps.length - 1 ? 'success' : null);

        setSteps(prev => {
          const newSteps = [...prev];
          newSteps[currentStepIndex].status = isBlocked ? 'failed' : 'success';
          newSteps[currentStepIndex].timestamp = Date.now();
          return newSteps;
        });
        
        if (isEnding) {
          setIsRunning(false);
          setResult(finalResult);
        } else {
          setCurrentStepIndex(prev => prev + 1);
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isRunning, currentStepIndex, steps.length]);

  const handleSave = async () => {
    if (!result || !attackType) return;
    setIsSaving(true);
    
    const token = localStorage.getItem('abe_auth_token');
    if (!token) {
      alert('You must be logged in to save simulations.');
      setIsSaving(false);
      return;
    }

    try {
      const simulationData = {
        name,
        description: ATTACK_SCENARIOS[attackType].description,
        riskLevel: getRiskLevel(steps),
        result,
        logs: steps.map(s => ({
          message: `${s.action}: ${s.details}`,
          type: s.status === 'success' ? 'success' : s.status === 'failed' ? 'error' : 'info'
        }))
      };

      const response = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(simulationData),
      });

      if (!response.ok) {
        throw new Error('Failed to save simulation');
      }

      onComplete();
    } catch (err) {
      console.error("API Error (create simulation):", err);
      alert('Failed to save simulation. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl md:text-4xl font-bold tracking-tighter uppercase italic">Attack <span className="text-[#F27D26]">Simulator</span></h1>
        <p className="text-white/50 mt-1 text-sm md:text-base">Configure and run a simulated browser-based cyberattack.</p>
      </header>

      {!isRunning && !result ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 md:p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/40 ml-1">Simulation Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-[#F27D26] transition-colors"
                  placeholder="e.g., Memory Extraction Test 01"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-white/40 ml-1">Attack Vector</label>
                <div className="grid grid-cols-1 gap-3">
                  {(Object.keys(ATTACK_SCENARIOS) as AttackType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setAttackType(type)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        attackType === type 
                          ? 'bg-[#F27D26]/10 border-[#F27D26] text-white' 
                          : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                      }`}
                    >
                      <p className="font-bold">{ATTACK_SCENARIOS[type].name}</p>
                      <p className="text-xs opacity-60 mt-1">{ATTACK_SCENARIOS[type].description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={!name || !attackType}
                className="w-full bg-[#F27D26] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#ff8c38] transition-all shadow-[0_0_20px_rgba(242,125,38,0.2)] disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                Start Simulation
              </button>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Info className="text-white/20 w-10 h-10" />
              </div>
              <h3 className="font-bold text-lg mb-2">Educational Purpose Only</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                This tool simulates the logical steps of browser attacks. No actual malicious code is executed. 
                Use this to understand behavior patterns and improve your security posture.
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {/* Simulation Progress */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
              <div>
                <h2 className="text-xl md:text-3xl font-bold tracking-tighter uppercase italic">{name}</h2>
                <p className="text-[#F27D26] text-xs md:text-sm uppercase tracking-[0.2em] font-bold mt-1">
                  {attackType && ATTACK_SCENARIOS[attackType].name}
                </p>
              </div>
              {isRunning ? (
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 self-start md:self-auto">
                  <Loader2 className="w-4 h-4 md:w-5 h-5 animate-spin text-[#F27D26]" />
                  <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest">Simulation in Progress...</span>
                </div>
              ) : result ? (
                result === 'success' ? (
                  <div className="flex items-center gap-3 px-4 py-2 md:px-6 md:py-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.1)] self-start md:self-auto">
                    <ShieldAlert className="w-6 h-6 md:w-8 h-8" />
                    <div className="flex flex-col">
                      <span className="font-black text-lg md:text-xl uppercase italic leading-none">Vulnerable</span>
                      <span className="text-[8px] md:text-[10px] uppercase tracking-widest opacity-70">Attack Succeeded</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2 md:px-6 md:py-3 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.1)] self-start md:self-auto">
                    <ShieldCheck className="w-6 h-6 md:w-8 h-8" />
                    <div className="flex flex-col">
                      <span className="font-black text-lg md:text-xl uppercase italic leading-none">Blocked</span>
                      <span className="text-[8px] md:text-[10px] uppercase tracking-widest opacity-70">Defense Active</span>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 text-white/20 self-start md:self-auto">
                  <Terminal className="w-4 h-4 md:w-5 h-5" />
                  <span className="font-bold text-xs uppercase tracking-widest italic">Ready</span>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="space-y-4 relative">
              <div className="absolute left-[20px] md:left-[27px] top-4 bottom-4 w-px bg-white/10" />
              {steps.map((step, index) => (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: index <= currentStepIndex ? 1 : 0.3,
                    x: 0 
                  }}
                  className="flex gap-4 md:gap-6 relative z-10"
                >
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${
                    step.status === 'success' ? 'bg-[#F27D26]/10 border-[#F27D26] text-[#F27D26]' :
                    step.status === 'failed' ? 'bg-red-500/10 border-red-500 text-red-500' :
                    index === currentStepIndex && isRunning ? 'bg-white/10 border-white/30 text-white animate-pulse' :
                    'bg-white/5 border-white/5 text-white/20'
                  }`}>
                    {step.status === 'success' ? <CheckCircle2 className="w-4 h-4 md:w-6 h-6" /> :
                     step.status === 'failed' ? <XCircle className="w-4 h-4 md:w-6 h-6" /> :
                     <Terminal className="w-4 h-4 md:w-6 h-6" />}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm md:text-lg">{step.action}</h4>
                      <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shrink-0 ${
                        step.riskFlag === 'high' ? 'bg-red-500/10 text-red-500' :
                        step.riskFlag === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {step.riskFlag}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs md:text-sm mt-1">{step.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Results and Prevention */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-4 md:p-8">
                  <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
                    <ShieldAlert className="text-[#F27D26] w-5 h-5" />
                    Risk Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Classification</p>
                      <p className="text-xl md:text-2xl font-bold italic uppercase tracking-tighter">
                        {result === 'success' ? 'High Risk Behavior' : 'Suspicious Activity Blocked'}
                      </p>
                    </div>
                    <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Detection Reason</p>
                      <p className="text-xs md:text-sm leading-relaxed">
                        {result === 'success' 
                          ? `The simulation successfully completed all steps of ${attackType && ATTACK_SCENARIOS[attackType].name}, indicating a potential vulnerability to this specific technique.`
                          : `The behavior-based detection system identified and blocked the simulation during the "${steps.find(s => s.status === 'failed')?.action}" phase.`}
                      </p>
                    </div>
                  </div>
                </div>

                <PreventionTips attackType={attackType as AttackType} />

                <div className="flex flex-col md:flex-row justify-end gap-4">
                  <button
                    onClick={() => {
                      setResult(null);
                      setIsRunning(false);
                      setCurrentStepIndex(-1);
                      setSteps([]);
                    }}
                    className="w-full md:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full md:w-auto px-8 py-4 bg-[#F27D26] text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#ff8c38] transition-all shadow-[0_0_20px_rgba(242,125,38,0.2)] disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    Save & Finish
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
