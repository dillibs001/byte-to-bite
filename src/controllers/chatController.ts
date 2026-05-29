import { Request, Response } from 'express';
import { processUserMessage } from '../services/chatService';
import eventBus from '../utils/eventBus';
import { Session } from '../models/session';


// BACKGROUND EVENT LISTENER 

eventBus.on('payment:success', async (data) => {
  try {
    await Session.findOneAndUpdate(
      { deviceId: data.deviceId },
      { currentState: 'IDLE', currentOrderId: null }
    );
    console.log(`🤖 [EventBus] Successfully reset chat session to IDLE for device: ${data.deviceId}`);
  } catch (error) {
    console.error('❌ EventBus failed to update chat session state:', error);
  }
});




// MAIN ROUTER ENTRY POINT 

export const handleChatMessage = async (req: Request, res: Response) => {
  try {
    // 1. Unpack network payload 
    const { message } = req.body; 
    const input = message?.trim();

    // Read the device ID from headers where the frontend actually sent it!
    const deviceId = req.headers['x-device-id'] as string;

    // 2. Validate input and tracking data format
    if (!input) {
      return res.status(400).json({ reply: "Please type a valid option." });
    }

    if (!deviceId) {
      console.error("⚠️ Incoming request dropped: Missing x-device-id header");
      return res.status(400).json({ error: "Missing identity tracking token." });
    }

    // 3. Delegate ALL heavy lifting to the pure Service logic layer
    const botReplyString = await processUserMessage(deviceId, input);

    // 4. Send the calculated response back over the network
    return res.json({ reply: botReplyString });

  } catch (error) {
    console.error('Chat controller breakdown:', error);
    return res.status(500).json({ error: 'Internal chat processing error' });
  }
};

