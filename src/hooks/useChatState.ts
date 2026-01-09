import { useState, useEffect } from 'react';
import { sessionManager, ChatState } from '../services/sessionManager';

export const useChatState = (chatId: string) => {
    const [status, setStatus] = useState<ChatState>(sessionManager.getState(chatId));

    useEffect(() => {
        setStatus(sessionManager.getState(chatId));
        const unsubscribe = sessionManager.subscribe((id, newState) => {
            if (id === chatId) {
                setStatus(newState);
            }
        });
        return () => {
             unsubscribe();
        };
    }, [chatId]);

    return status;
};
