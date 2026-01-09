import { SwarmWorker } from '../../services/swarmService';
import { Trash2 } from 'lucide-react';

interface WorkerCardProps {
    worker: SwarmWorker;
    onDelete?: (id: string) => void;
}

export const WorkerCard = ({ worker, onDelete }: WorkerCardProps) => {
    return (
        <div className="bg-bg-secondary p-3 rounded border border-border flex flex-col gap-2 group relative hover:border-accent/30 transition-colors">
            <div className="flex justify-between items-start pr-6">
                <span className="font-medium text-text-primary text-sm">{worker.name || 'Unnamed Worker'}</span>
                <span className="text-xs bg-bg-primary px-1.5 py-0.5 rounded text-text-secondary border border-border">{worker.model}</span>
            </div>
            <div className="text-xs text-text-secondary line-clamp-2 italic">
                {worker.role}
            </div>
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(worker.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 text-text-secondary hover:text-red-500 hover:bg-bg-primary rounded opacity-0 group-hover:opacity-100 transition-all"
                    title="Worker entfernen"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};
