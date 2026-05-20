import { useState, useEffect } from 'react';
import apiClient from '../utils/api';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-boot conversation stream from database profile flags on mount
  useEffect(() => {
    async function initializeChat() {
      setIsLoading(true);
      try {
        const response = await apiClient.post('/chat/message', { message: 'HELLO' });
        setMessages([
          { id: 'init-1', sender: 'bot', text: response.data.reply }
        ]);
      } catch (error) {
        console.error('Chat system failed to initialize context:', error);
      } finally {
        setIsLoading(false);
      }
    }
    initializeChat();
  }, []);

  const sendMessage = async () => {
    const activeText = inputValue.trim();
    if (!activeText || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMessageId, sender: 'user', text: activeText }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat/message', { message: activeText });
      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, sender: 'bot', text: response.data.reply }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, sender: 'bot', text: '❌ Connection lag. Please check if your Express backend server is up and listening!' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, inputValue, setInputValue, isLoading, sendMessage };
}