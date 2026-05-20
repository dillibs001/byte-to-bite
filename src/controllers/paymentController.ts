import { Request, Response } from 'express';
import crypto from 'crypto'; // Native Node.js crypto tool
import { Order } from '../models/order';
import eventBus from '../utils/eventBus'; 

export const verifyPaystackWebhook = async (req: Request, res: Response) => {
  try {
    // 1. 🔒 Webhook Forgery Protection: Validate Paystack Signature
    const paystackHeaderSignature = req.headers['x-paystack-signature'];
    
    const calculatedHmacHash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
      .update(JSON.stringify(req.body))
      .digest('hex');

    // If the hashes don't match, somebody is trying to spoof a free order!
    if (calculatedHmacHash !== paystackHeaderSignature) {
      console.warn('⚠️ SECURITY WARNING: Blocked an unauthorized webhook forgery attempt!');
      return res.status(401).json({ error: 'Unauthorized payload signature mapping failed' });
    }

    const { event, data } = req.body;

    if (event === 'charge.success') {
      // 2. 🎯 Read the full, untruncated device ID directly from the custom metadata object block
      const deviceId = data.metadata?.deviceId;

      if (deviceId) {
        // Find their pending order and flip its status flag to PAID
        const order = await Order.findOneAndUpdate(
          { deviceId, status: 'PENDING' },
          { status: 'PAID' },
          { returnDocument: 'after' }
        );

        if (order) {
          console.log(`💰 SECURE SUCCESS: Verified Paystack Order ${order._id} has been fully funded!`);
          eventBus.emit('payment:success', { deviceId });
        }
      }
    }

    // Always let Paystack know the event was processed securely
    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Webhook processing failure:', error);
    return res.status(500).json({ error: 'Internal Webhook Error' });
  }
};