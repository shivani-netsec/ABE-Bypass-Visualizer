export type AttackType = 'memory-extraction' | 'debugger-attachment' | 'dll-injection' | 'browser-hooking';

export interface SimulationStep {
  id: string;
  action: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  riskFlag: 'low' | 'medium' | 'high';
  details?: string;
}

export interface Simulation {
  id: string;
  userId: string;
  name: string;
  attackType: AttackType;
  timestamp: number;
  result: 'success' | 'blocked';
  riskLevel: 'low' | 'medium' | 'high';
  steps: SimulationStep[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: number;
}
