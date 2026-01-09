import { useSwarmStore } from '../../stores/swarmStore';
import { Loader2 } from 'lucide-react';

export const SwarmExecutionView = () => {
    const { currentExecution } = useSwarmStore();

    if (!currentExecution || currentExecution.status === 'done') return null;

    return (
        <div className="fixed bottom-24 right-4 w-80 bg-bg-secondary border border-border rounded-lg shadow-xl p-4 z-50 transition-all">
            <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                Swarm Active
            </h3>
            <div className="space-y-3">
                <div className="text-xs text-text-secondary">
                    Status: <span className="text-text-primary capitalize">{currentExecution.status}</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {Array.from(currentExecution.workerResponses.entries()).map(([workerId, content]) => (
                        <div key={workerId} className="bg-bg-primary p-2 rounded border border-border">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-text-primary">Worker {workerId.slice(0, 4)}</span>
                                <span className="text-[10px] text-text-secondary">{content.length} chars</span>
                            </div>
                            <div className="h-1 bg-bg-secondary rounded overflow-hidden">
                                <div className="h-full bg-accent animate-pulse" style={{ width: '100%' }}></div>
                            </div>
                            <div className="text-[10px] text-text-secondary mt-1 line-clamp-2">
                                {content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
