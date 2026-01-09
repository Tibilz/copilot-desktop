import { create } from 'zustand';
import { swarmService, SwarmConfig, SwarmExecution, SwarmStrategy } from '../services/swarmService';

interface SwarmState {
  configs: SwarmConfig[];
  activeConfigId: string | null;
  currentExecution: SwarmExecution | null;
  isSwarmEnabled: boolean;

  loadConfigs: () => Promise<void>;
  createConfig: (
    name: string,
    strategy: SwarmStrategy,
    controllerModel?: string
  ) => Promise<string>;
  addWorker: (configId: string, name: string, role: string, model: string) => Promise<void>;
  setActiveConfig: (id: string | null) => void;
  toggleSwarm: (enabled: boolean) => void;

  // Execution state management
  startExecution: (configId: string, query: string) => void;
  updateWorkerResponse: (workerId: string, chunk: string) => void;
  completeExecution: (finalResponse: string) => void;
  resetExecution: () => void;
}

export const useSwarmStore = create<SwarmState>((set, get) => ({
  configs: [],
  activeConfigId: null,
  currentExecution: null,
  isSwarmEnabled: false,

  loadConfigs: async () => {
    const configs = await swarmService.getAllConfigs();
    set({ configs });
    // Set default active if none and enabled?
    // Or just let user select.
    if (configs.length > 0 && !get().activeConfigId) {
      set({ activeConfigId: configs[0].id });
    }
  },

  createConfig: async (name, strategy, controllerModel = 'gpt-4o') => {
    const id = await swarmService.createConfig(name, strategy, controllerModel);
    await get().loadConfigs();
    set({ activeConfigId: id });
    return id;
  },

  addWorker: async (configId, name, role, model) => {
    await swarmService.addWorker(configId, name, role, model);
    await get().loadConfigs();
  },

  setActiveConfig: (id) => set({ activeConfigId: id }),

  toggleSwarm: (enabled) => set({ isSwarmEnabled: enabled }),

  startExecution: (configId, query) => {
    set({
      currentExecution: {
        configId,
        query,
        workerResponses: new Map(),
        finalResponse: '',
        status: 'dispatching',
      },
    });
  },

  updateWorkerResponse: (workerId, chunk) => {
    set((state) => {
      if (!state.currentExecution) return {};
      const responses = new Map(state.currentExecution.workerResponses);
      const prev = responses.get(workerId) || '';
      responses.set(workerId, prev + chunk);
      return {
        currentExecution: {
          ...state.currentExecution,
          workerResponses: responses,
        },
      };
    });
  },

  completeExecution: (finalResponse) => {
    set((state) => {
      if (!state.currentExecution) return {};
      return {
        currentExecution: {
          ...state.currentExecution,
          finalResponse,
          status: 'done',
        },
      };
    });
  },

  resetExecution: () => set({ currentExecution: null }),
}));
