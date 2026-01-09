import { useState } from 'react';
import { useSwarmStore } from '../../stores/swarmStore';
import { SwarmConfigModal } from './SwarmConfigModal';
import { Settings, Bug } from 'lucide-react';

export const SwarmToggle = () => {
  const { isSwarmEnabled, toggleSwarm } = useSwarmStore();
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggleSwarm(!isSwarmEnabled)}
        className={`flex items-center gap-1 rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          isSwarmEnabled
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'border border-border bg-bg-secondary text-text-secondary hover:bg-bg-primary hover:text-text-primary'
        }`}
      >
        <Bug className="h-4 w-4" />
        Swarm {isSwarmEnabled ? 'ON' : 'OFF'}
      </button>

      {isSwarmEnabled && (
        <button
          onClick={() => setShowConfig(true)}
          className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
        >
          <Settings className="h-4 w-4" />
        </button>
      )}

      {showConfig && <SwarmConfigModal onClose={() => setShowConfig(false)} />}
    </div>
  );
};
