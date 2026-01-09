/* eslint-disable @typescript-eslint/no-explicit-any */
import { initDb } from './database';
import { v4 as uuidv4 } from 'uuid';
import { sessionManager } from './sessionManager';
import { Message } from '../types/chat';

export interface SwarmWorker {
    id: string;
    config_id?: string;
    model: string;
    role: string;  // System Prompt / Role Description
    name: string;
    weight?: number;
}

export type SwarmStrategy = 'consensus' | 'parallel' | 'sequential' | 'verification';

export interface SwarmConfig {
    id: string;
    name: string;
    controller_model: string;
    strategy: SwarmStrategy;
    workers: SwarmWorker[];
}

export interface SwarmExecution {
    configId: string;
    query: string;
    workerResponses: Map<string, string>;
    finalResponse: string;
    status: 'analyzing' | 'dispatching' | 'collecting' | 'aggregating' | 'done' | 'error';
}

const TASK_ANALYSIS_PROMPT = `You are a task coordinator. Analyze this user request and break it down into subtasks for the available workers.

Available workers:
{{workers}}

User Query: {{query}}

Respond ONLY with valid JSON (no markdown):
{
  "subtasks": [
    {"workerId": "worker-1", "task": "specific task description"},
    {"workerId": "worker-2", "task": "specific task description"}
  ]
}`;

const AGGREGATION_PROMPT = `Combine these worker responses into a single, coherent answer.

Original Query: {{query}}

Worker Responses:
{{responses}}

Create a comprehensive final response that combines the best insights from each worker. Do not mention the workers or the aggregation process.`;

export class SwarmService {

    // --- Configuration Management ---

    async createConfig(name: string, strategy: SwarmStrategy, controllerModel: string = 'gpt-4o'): Promise<string> {
        const db = await initDb();
        const id = uuidv4();
        await db.execute(
            'INSERT INTO swarm_configs (id, name, controller_model, strategy) VALUES (?, ?, ?, ?)',
            [id, name, controllerModel, strategy]
        );
        return id;
    }

    async addWorker(configId: string, _name: string, roleSystemPrompt: string, model: string = 'gpt-4o'): Promise<string> {
        const db = await initDb();
        const id = uuidv4();
        await db.execute(
            'INSERT INTO swarm_workers (id, config_id, model, role) VALUES (?, ?, ?, ?)',
            [id, configId, model, roleSystemPrompt]  // Using logic that role column stores system prompt
        );
        return id;
    }

    async getConfig(configId: string): Promise<SwarmConfig | null> {
        const db = await initDb();
        const configs = await db.select<any[]>('SELECT * FROM swarm_configs WHERE id = ?', [configId]);
        if (configs.length === 0) return null;

        const workers = await db.select<any[]>('SELECT * FROM swarm_workers WHERE config_id = ?', [configId]);
        return {
            ...configs[0],
            workers: workers.map(w => ({
                id: w.id,
                config_id: w.config_id,
                model: w.model,
                role: w.role, // System Prompt
                name: w.role.substring(0, 20) // derived name or add column later
            }))
        } as SwarmConfig;
    }

    async getAllConfigs(): Promise<SwarmConfig[]> {
        const db = await initDb();
        const configs = await db.select<any[]>('SELECT * FROM swarm_configs');
        const results = [];
        for (const c of configs) {
            const workers = await db.select<any[]>('SELECT * FROM swarm_workers WHERE config_id = ?', [c.id]);
            results.push({
                ...c,
                workers: workers.map(w => ({
                    id: w.id,
                    config_id: w.config_id,
                    model: w.model,
                    role: w.role,
                    name: w.role.substring(0, 20)
                }))
            });
        }
        return results;
    }


    // --- Execution ---

    async runSwarm(
        configId: string,
        mainChatId: string,
        history: Message[],
        onWorkerUpdate: (workerId: string, content: string) => void
    ): Promise<string> {
        const config = await this.getConfig(configId);
        if (!config || config.workers.length === 0) {
            throw new Error('Invalid Swarm Configuration');
        }

        switch (config.strategy) {
            case 'parallel':
                return this.executeParallel(config, mainChatId, history, onWorkerUpdate);
            case 'consensus':
                return this.executeConsensus(config, mainChatId, history, onWorkerUpdate);
            default:
                // Fallback for verification/sequential if not implemented yet
                return this.executeConsensus(config, mainChatId, history, onWorkerUpdate);
        }
    }

    private async executeConsensus(
        config: SwarmConfig,
        mainChatId: string,
        history: Message[],
        onUpdate: (workerId: string, content: string) => void
    ): Promise<string> {
        const promises = config.workers.map(async (worker) => {
            const workerChatId = `${mainChatId}_${worker.id}`;
            const messages = [
                { id: 'sys', role: 'system' as const, content: worker.role, createdAt: '' },
                ...history.filter(m => m.role !== 'system')
            ];

            let content = '';
            await sessionManager.sendMessage(workerChatId, worker.model, messages, (chunk) => {
                content += chunk;
                onUpdate(worker.id, chunk);
            });
            return { worker, content };
        });

        const results = await Promise.all(promises);
        return this.aggregateResults(config, mainChatId, history, results);
    }

    private async executeParallel(
        config: SwarmConfig,
        mainChatId: string,
        history: Message[],
        onUpdate: (workerId: string, content: string) => void
    ): Promise<string> {
        const lastUserMessage = history[history.length - 1];
        if (!lastUserMessage || lastUserMessage.role !== 'user') return "Error: Last message must be user.";

        // 1. Task Analysis
        const prompt = TASK_ANALYSIS_PROMPT
            .replace('{{workers}}', JSON.stringify(config.workers.map(w => ({ id: w.id, role: w.role }))))
            .replace('{{query}}', lastUserMessage.content);

        let analysisResponse = '';
        try {
            await sessionManager.sendMessage(`${mainChatId}_ctrl`, config.controller_model, [
                { id: 'sys', role: 'system' as const, content: 'You are a task coordinator which outputs JSON.', createdAt: '' },
                { id: 'u', role: 'user' as const, content: prompt, createdAt: '' }
            ], (chunk) => analysisResponse += chunk);

            const jsonStr = analysisResponse.replace(/```json|```/g, '').trim();
            const subtasks = JSON.parse(jsonStr).subtasks;

            // 2. Dispatch
            const promises = subtasks.map(async (task: any) => {
                const worker = config.workers.find(w => w.id === task.workerId);
                if (!worker) return null;

                const workerChatId = `${mainChatId}_${worker.id}`;
                const workerMessages = [
                    { id: 'sys', role: 'system' as const, content: worker.role, createdAt: '' },
                    ...history.filter(m => m.role !== 'system').slice(0, -1),
                    { id: uuidv4(), role: 'user' as const, content: `Original Query: ${lastUserMessage.content}\n\nYour Subtask: ${task.task}`, createdAt: '' }
                ];

                let content = '';
                await sessionManager.sendMessage(workerChatId, worker.model, workerMessages, (chunk) => {
                    content += chunk;
                    onUpdate(worker.id, chunk);
                });
                return { worker, content };
            });

            const results = (await Promise.all(promises)).filter(r => r !== null) as { worker: SwarmWorker, content: string }[];
            return this.aggregateResults(config, mainChatId, history, results);

        } catch (e) {
            console.error("Parallel execution failed, falling back to consensus", e);
            // Fallback
            return this.executeConsensus(config, mainChatId, history, onUpdate);
        }
    }

    private async aggregateResults(config: SwarmConfig, mainChatId: string, history: Message[], results: { worker: SwarmWorker, content: string }[]) {
        const lastUserMessage = history[history.length - 1];
        const responsesText = results.map(r => `Worker: ${r.worker.name || r.worker.role}\nResponse: ${r.content}`).join('\n\n');

        const prompt = AGGREGATION_PROMPT
            .replace('{{query}}', lastUserMessage ? lastUserMessage.content : '')
            .replace('{{responses}}', responsesText);

        let finalResponse = '';
        await sessionManager.sendMessage(`${mainChatId}_agg`, config.controller_model, [
            { id: 'sys', role: 'system' as const, content: 'You are an aggregator.', createdAt: '' },
            { id: 'u', role: 'user' as const, content: prompt, createdAt: '' }
        ], (chunk) => {
            finalResponse += chunk;
        });

        return finalResponse;
    }
}

export const swarmService = new SwarmService();
