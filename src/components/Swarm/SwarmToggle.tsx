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
                className={`px-3 py-1 rounded-md flex items-center gap-1 transition-colors text-sm font-medium ${isSwarmEnabled
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-bg-secondary text-text-secondary hover:bg-bg-primary hover:text-text-primary border border-border'
                    }`}
            >
                <Bug className="w-4 h-4" />
                Swarm {isSwarmEnabled ? 'ON' : 'OFF'}
            </button>

            {isSwarmEnabled && (
                <button
                    onClick={() => setShowConfig(true)}
                    className="p-1.5 text-text-secondary hover:text-text-primary rounded-md hover:bg-bg-secondary transition-colors"
                >
                    <Settings className="w-4 h-4" />
                </button>
            )}

            {showConfig && <SwarmConfigModal onClose={() => setShowConfig(false)} />}
        </div>
    );
};
