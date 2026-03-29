import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Simulation, UserProfile } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import SimulationRunner from './components/SimulationRunner';
import SimulationHistory from './components/SimulationHistory';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Activity, History, LayoutDashboard, LogOut, Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'runner' | 'history'>('dashboard');
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);

  useEffect(() => {
    // Check local storage for existing session
    const savedUser = localStorage.getItem('abe_active_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setSimulations([]);
      return;
    }

    const q = query(
      collection(db, 'simulations'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sims = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Simulation));
      setSimulations(sims);
    }, (error) => {
      console.error("Firestore Error (list simulations):", error);
      // Optional: Show a toast or error message to the user
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('abe_active_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F27D26] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={(u: any) => {
      localStorage.setItem('abe_active_user', JSON.stringify(u));
      setUser(u);
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#F27D26] selection:text-black">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 left-0 w-full h-16 bg-[#0A0A0A] border-t border-white/10 flex items-center justify-around px-2 md:left-0 md:top-0 md:h-full md:w-64 md:border-r md:border-t-0 md:flex-col md:justify-start md:px-0 z-[100]">
        <div className="hidden md:flex p-6 items-center gap-3 mb-8 w-full">
          <div className="w-10 h-10 bg-[#F27D26] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(242,125,38,0.3)]">
            <Shield className="text-black w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tighter uppercase italic">ABE Bypass</span>
        </div>

        <div className="flex flex-row md:flex-col flex-1 md:px-4 space-x-1 md:space-x-0 md:space-y-2 w-full justify-around md:justify-start">
          <NavItem 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard />} 
            label="Dash" 
            fullLabel="Dashboard"
          />
          <NavItem 
            active={activeTab === 'runner'} 
            onClick={() => setActiveTab('runner')} 
            icon={<Activity />} 
            label="Sim" 
            fullLabel="Simulate"
          />
          <NavItem 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<History />} 
            label="Logs" 
            fullLabel="History"
          />
          <button 
            onClick={handleLogout}
            className="md:hidden flex flex-col items-center justify-center gap-1 p-2 text-white/50 hover:text-white transition-all min-w-[60px]"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Exit</span>
          </button>
        </div>

        <div className="hidden md:block p-4 border-t border-white/5 w-full">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 md:pb-0 md:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard simulations={simulations} onStartSimulation={() => setActiveTab('runner')} />
              </motion.div>
            )}
            {activeTab === 'runner' && (
              <motion.div
                key="runner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SimulationRunner user={user} onComplete={() => setActiveTab('history')} />
              </motion.div>
            )}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SimulationHistory simulations={simulations} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label, fullLabel }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; fullLabel: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2 md:p-3 rounded-xl transition-all group min-w-[60px] md:min-w-0 ${
        active 
          ? 'bg-[#F27D26]/10 md:bg-[#F27D26] text-[#F27D26] md:text-black shadow-none md:shadow-[0_0_15px_rgba(242,125,38,0.2)]' 
          : 'text-white/50 hover:text-white hover:bg-white/5'
      }`}
    >
      <div className={`${active ? 'text-[#F27D26] md:text-black' : 'group-hover:scale-110 transition-transform'}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
      </div>
      <span className="text-[9px] md:text-base md:font-medium font-bold uppercase md:normal-case tracking-widest md:tracking-normal md:hidden">{label}</span>
      <span className="hidden md:inline text-base font-medium">{fullLabel}</span>
    </button>
  );
}
