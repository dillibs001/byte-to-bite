import { useState, useEffect } from 'react';
import apiClient from '../utils/api';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  link?: string; // 🆕 Added so your UI component can render the Paystack URL as a clickable button
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 🆕 NEW STATE: The Payment Polling Engine controls
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | null>(null);

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

  // 🆕 NEW EFFECT: The Background Polling Engine
  useEffect(() => {
    let paymentCheckInterval: NodeJS.Timeout;

    // Only start polling if we have an active checkout session
    if (isWaitingForPayment && currentDeviceId) {
      console.log(`📡 Polling engine started for device: ${currentDeviceId}`);

      paymentCheckInterval = setInterval(async () => {
        try {
          // Adjust this URL path based on how your apiClient base URL is configured!
          const response = await apiClient.get(`/payments/status/${currentDeviceId}`);
          
          if (response.data.paid === true) {
            console.log('✅ Payment confirmed by server!');
            
            // 1. Turn off the polling engine
            clearInterval(paymentCheckInterval);
            setIsWaitingForPayment(false);
            setCurrentDeviceId(null); // Clear the session

            // 2. Push the automated success message into the chat UI
            setMessages((prev) => [
              ...prev,
              { 
                id: `bot-paid-${Date.now()}`, 
                sender: 'bot', 
                text: '🎉 Payment successful! I have confirmed your order and it is being prepared right now.' 
              }
            ]);
          }
        } catch (error: any) {
          // A 404 just means the order is still PENDING, so we ignore it and check again in 3 seconds.
          if (error.response?.status !== 404) {
            console.error("Error checking payment status", error);
          }
        }
      }, 3000); // Poll every 3 seconds
    }

    // Cleanup: Stop the interval if the component unmounts
    return () => clearInterval(paymentCheckInterval);
  }, [isWaitingForPayment, currentDeviceId]);

  const sendMessage = async () => {
    const activeText = inputValue.trim();
    if (!activeText || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMessageId, sender: 'user', text: activeText }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat/message', { message: activeText });
      
      // 🆕 TRIGGER CHECK: Did the backend return checkout data?
      // When your chat controller generates the Paystack link, make sure it sends 
      // `checkoutUrl` and `deviceId` back in the JSON response!
      if (response.data.checkoutUrl && response.data.deviceId) {
        setCurrentDeviceId(response.data.deviceId);
        setIsWaitingForPayment(true); // Turns on the polling engine!
      }

      setMessages((prev) => [
        ...prev,
        { 
          id: `bot-${Date.now()}`, 
          sender: 'bot', 
          text: response.data.reply,
          link: response.data.checkoutUrl // 🆕 Pass the link to the UI if it exists
        }
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