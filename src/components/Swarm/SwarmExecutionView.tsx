import { useSwarmStore } from '../../stores/swarmStore';
import { Loader2 } from 'lucide-react';

export const SwarmExecutionView = () => {
  const { currentExecution } = useSwarmStore();

  if (!currentExecution || currentExecution.status === 'done') return null;

  return (
    <div className="fixed bottom-24 right-4 z-50 w-80 rounded-lg border border-border bg-bg-secondary p-4 shadow-xl transition-all">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-text-primary">
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
        Swarm Active
      </h3>
      <div className="space-y-3">
        <div className="text-xs text-text-secondary">
          Status: <span className="capitalize text-text-primary">{currentExecution.status}</span>
        </div>

        <div className="max-h-60 space-y-2 overflow-y-auto">
          {Array.from(currentExecution.workerResponses.entries()).map(([workerId, content]) => (
            <div key={workerId} className="rounded border border-border bg-bg-primary p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-text-primary">
                  Worker {workerId.slice(0, 4)}
                </span>
                <span className="text-[10px] text-text-secondary">{content.length} chars</span>
              </div>
              <div className="h-1 overflow-hidden rounded bg-bg-secondary">
                <div className="h-full animate-pulse bg-accent" style={{ width: '100%' }}></div>
              </div>
              <div className="mt-1 line-clamp-2 text-[10px] text-text-secondary">{content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
