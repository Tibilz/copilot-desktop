import { SwarmWorker } from '../../services/swarmService';
import { Trash2 } from 'lucide-react';

interface WorkerCardProps {
  worker: SwarmWorker;
  onDelete?: (id: string) => void;
}

export const WorkerCard = ({ worker, onDelete }: WorkerCardProps) => {
  return (
    <div className="hover:border-accent/30 group relative flex flex-col gap-2 rounded border border-border bg-bg-secondary p-3 transition-colors">
      <div className="flex items-start justify-between pr-6">
        <span className="text-sm font-medium text-text-primary">
          {worker.name || 'Unnamed Worker'}
        </span>
        <span className="rounded border border-border bg-bg-primary px-1.5 py-0.5 text-xs text-text-secondary">
          {worker.model}
        </span>
      </div>
      <div className="line-clamp-2 text-xs italic text-text-secondary">{worker.role}</div>
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(worker.id);
          }}
          className="absolute right-2 top-2 rounded p-1.5 text-text-secondary opacity-0 transition-all hover:bg-bg-primary hover:text-red-500 group-hover:opacity-100"
          title="Worker entfernen"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};
