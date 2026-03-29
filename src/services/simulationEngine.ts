import { AttackType, SimulationStep } from '../types';

export const ATTACK_SCENARIOS: Record<AttackType, { name: string; description: string; steps: Omit<SimulationStep, 'id' | 'timestamp' | 'status'>[] }> = {
  'memory-extraction': {
    name: 'Memory Extraction',
    description: 'Simulates malware scanning browser memory for sensitive data like encryption keys or passwords.',
    steps: [
      { action: 'Locate browser process', riskFlag: 'low', details: 'Malware identifies the target browser process ID.' },
      { action: 'Open process with read access', riskFlag: 'medium', details: 'Malware requests permissions to read the process memory space.' },
      { action: 'Scan memory regions', riskFlag: 'high', details: 'Malware scans for specific patterns (e.g., private keys, session tokens).' },
      { action: 'Extract sensitive key', riskFlag: 'high', details: 'Malware copies the identified data to its own memory space.' }
    ]
  },
  'debugger-attachment': {
    name: 'Debugger Attachment',
    description: 'Simulates a malware attaching a debugger to the browser to intercept API calls.',
    steps: [
      { action: 'Identify browser thread', riskFlag: 'low', details: 'Malware finds the main execution thread of the browser.' },
      { action: 'Attach debugger', riskFlag: 'high', details: 'Malware uses DebugActiveProcess to gain full control over the browser.' },
      { action: 'Set hardware breakpoint', riskFlag: 'high', details: 'Malware sets breakpoints on sensitive API calls (e.g., SSL_write).' },
      { action: 'Intercept data', riskFlag: 'high', details: 'Malware reads data directly from registers when breakpoints are hit.' }
    ]
  },
  'dll-injection': {
    name: 'DLL Injection',
    description: 'Simulates malware injecting a malicious DLL into the browser process.',
    steps: [
      { action: 'Allocate memory in browser', riskFlag: 'medium', details: 'Malware allocates space in the browser process for the DLL path.' },
      { action: 'Write DLL path', riskFlag: 'medium', details: 'Malware writes the path of the malicious DLL into the allocated memory.' },
      { action: 'Create remote thread', riskFlag: 'high', details: 'Malware calls CreateRemoteThread to execute LoadLibrary in the browser.' },
      { action: 'Execute malicious code', riskFlag: 'high', details: 'The injected DLL starts executing inside the browser context.' }
    ]
  },
  'browser-hooking': {
    name: 'Browser Hooking',
    description: 'Simulates malware hooking browser APIs to modify web content or steal form data.',
    steps: [
      { action: 'Locate API entry points', riskFlag: 'medium', details: 'Malware finds the memory address of browser functions (e.g., SendRequest).' },
      { action: 'Modify function prologue', riskFlag: 'high', details: 'Malware overwrites the first few bytes of the function with a jump instruction.' },
      { action: 'Redirect to malicious handler', riskFlag: 'high', details: 'Execution is redirected to the malware handler before the original function.' },
      { action: 'Modify web content', riskFlag: 'high', details: 'Malware alters the response data before it reaches the browser UI.' }
    ]
  }
};

export const getRiskLevel = (steps: SimulationStep[]): 'low' | 'medium' | 'high' => {
  const highRiskCount = steps.filter(s => s.riskFlag === 'high').length;
  if (highRiskCount > 2) return 'high';
  if (highRiskCount > 0) return 'medium';
  return 'low';
};

export const getPreventionTips = (attackType: AttackType): string[] => {
  switch (attackType) {
    case 'memory-extraction':
      return [
        'Use browsers with hardware-backed memory protection.',
        'Enable process isolation and sandboxing.',
        'Avoid running untrusted executables that can gain administrative privileges.'
      ];
    case 'debugger-attachment':
      return [
        'Enable Anti-Debugging protections in your security software.',
        'Use browsers that implement self-protection mechanisms.',
        'Monitor for unauthorized process attachments.'
      ];
    case 'dll-injection':
      return [
        'Enable Code Integrity Guard (CIG) to prevent unsigned DLLs from loading.',
        'Use Endpoint Detection and Response (EDR) tools to monitor for CreateRemoteThread calls.',
        'Keep your operating system and browser updated to the latest security patches.'
      ];
    case 'browser-hooking':
      return [
        'Use browsers that implement Control Flow Guard (CFG).',
        'Monitor for unauthorized modifications to browser binaries or memory.',
        'Use browser extensions that verify the integrity of web content.'
      ];
    default:
      return ['Keep your security software updated.', 'Be cautious of phishing attempts.'];
  }
};
