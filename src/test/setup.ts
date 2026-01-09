import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Tauri APIs for testing
vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-http', () => ({
    fetch: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-sql', () => ({
    default: {
        load: vi.fn().mockResolvedValue({
            execute: vi.fn(),
            select: vi.fn().mockResolvedValue([]),
        }),
    },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});
