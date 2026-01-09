import { useEffect, useState } from 'react';
import { useSwarmStore } from '../../stores/swarmStore';
import { SwarmStrategy } from '../../services/swarmService';
import { X, Cpu } from 'lucide-react';
import { WorkerCard } from './WorkerCard';

interface SwarmConfigModalProps {
  onClose: () => void;
}

export const SwarmConfigModal = ({ onClose }: SwarmConfigModalProps) => {
  const { configs, activeConfigId, loadConfigs, createConfig, addWorker, setActiveConfig } =
    useSwarmStore();

  // Local state for new worker/config
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState('');
  const [newWorkerModel, setNewWorkerModel] = useState('gpt-4o');

  // Tab state: 'edit' or 'create'
  const [view, setView] = useState<'details' | 'create'>('details');

  // Create Config State
  const [newName, setNewName] = useState('');
  const [newStrategy, setNewStrategy] = useState<SwarmStrategy>('parallel');
  const [newController, setNewController] = useState('gpt-4o');

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const activeConfig = configs.find((c) => c.id === activeConfigId);

  const handleCreateConfig = async () => {
    if (!newName) return;
    await createConfig(newName, newStrategy, newController);
    setView('details');
    setNewName('');
  };

  const handleAddWorker = async () => {
    if (!activeConfigId || !newWorkerName || !newWorkerRole) return;
    await addWorker(activeConfigId, newWorkerName, newWorkerRole, newWorkerModel);
    setNewWorkerName('');
    setNewWorkerRole('');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-[600px] flex-col overflow-y-auto rounded-xl border border-border bg-bg-primary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
            <Cpu className="text-amber-500" />
            Swarm Konfiguration
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Config Selector */}
          <div className="flex gap-2">
            <select
              className="flex-1 rounded border border-border bg-bg-secondary px-3 py-2 text-text-primary outline-none focus:border-accent"
              value={activeConfigId || ''}
              onChange={(e) => setActiveConfig(e.target.value)}
            >
              {configs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              {configs.length === 0 && <option value="">Keine Konfigurationen</option>}
            </select>
            <button
              onClick={() => setView('create')}
              className="bg-accent/10 hover:bg-accent/20 whitespace-nowrap rounded px-3 py-2 text-sm font-medium text-accent"
            >
              + Neu
            </button>
          </div>

          {view === 'create' ? (
            <div className="space-y-4 rounded-lg border border-border bg-bg-secondary p-4">
              <h3 className="font-semibold text-text-primary">Neuer Swarm</h3>
              <div>
                <label className="mb-1 block text-xs text-text-secondary">Name</label>
                <input
                  className="w-full rounded border border-border bg-bg-primary px-3 py-2 text-text-primary outline-none focus:border-accent"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="z.B. Research Team"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">Strategie</label>
                  <select
                    className="w-full rounded border border-border bg-bg-primary px-3 py-2 text-text-primary outline-none focus:border-accent"
                    value={newStrategy}
                    onChange={(e) => setNewStrategy(e.target.value as SwarmStrategy)}
                  >
                    <option value="parallel">Parallel (Subtasks)</option>
                    <option value="consensus">Consensus (Voting)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-text-secondary">Controller Model</label>
                  <select
                    className="w-full rounded border border-border bg-bg-primary px-3 py-2 text-text-primary outline-none focus:border-accent"
                    value={newController}
                    onChange={(e) => setNewController(e.target.value)}
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="claude-3-5-sonnet-latest">Claude 3.5 Sonnet</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setView('details')}
                  className="px-3 py-1.5 text-text-secondary hover:text-text-primary"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleCreateConfig}
                  className="rounded bg-accent px-3 py-1.5 text-white hover:opacity-90"
                >
                  Erstellen
                </button>
              </div>
            </div>
          ) : activeConfig ? (
            <div className="space-y-6">
              {/* Strategy Info */}
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-bg-secondary p-3">
                <div>
                  <span className="block text-xs text-text-secondary">Strategie</span>
                  <span className="text-sm font-medium capitalize text-text-primary">
                    {activeConfig.strategy}
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-text-secondary">Controller</span>
                  <span className="text-sm font-medium text-text-primary">
                    {activeConfig.controller_model}
                  </span>
                </div>
              </div>

              {/* Workers List */}
              <div>
                <h3 className="mb-3 font-semibold text-text-primary">
                  Workers ({activeConfig.workers.length})
                </h3>
                <div className="space-y-3">
                  {activeConfig.workers.map((worker) => (
                    <WorkerCard key={worker.id} worker={worker} />
                  ))}
                </div>
              </div>

              {/* Add Worker */}
              <div className="space-y-3 rounded-lg border border-border bg-bg-secondary p-4">
                <h4 className="text-sm font-medium text-text-primary">Worker hinzufügen</h4>
                <input
                  className="w-full rounded border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                  placeholder="Name (z.B. Analyst)"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                />
                <textarea
                  className="min-h-[80px] w-full rounded border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
                  placeholder="System Prompt / Rolle"
                  value={newWorkerRole}
                  onChange={(e) => setNewWorkerRole(e.target.value)}
                />
                <div className="flex gap-2">
                  <select
                    className="rounded border border-border bg-bg-primary px-2 py-2 text-sm text-text-primary outline-none focus:border-accent"
                    value={newWorkerModel}
                    onChange={(e) => setNewWorkerModel(e.target.value)}
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="claude-3-5-sonnet-latest">Claude 3.5</option>
                  </select>
                  <button
                    onClick={handleAddWorker}
                    disabled={!newWorkerName || !newWorkerRole}
                    className="flex-1 rounded bg-text-primary px-3 py-2 text-sm font-medium text-bg-primary hover:opacity-90 disabled:opacity-50"
                  >
                    + Hinzufügen
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-text-secondary">
              Wähle eine Konfiguration oder erstelle eine neue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
