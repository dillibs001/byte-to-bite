import { Request, Response } from 'express';
import { Order } from '../models/order';
import eventBus from '../utils/eventBus'; 

export const verifyPaystackWebhook = async (req: Request, res: Response) => {
  try {
    // Paystack sends the transaction details inside req.body
    const { event, data } = req.body;

    // We only care if the customer actually completed the payment successfully
    if (event === 'charge.success') {
      const userEmail = data.customer.email; // e.g., customer_v_123@statebite.com
      
      // Extract the original deviceId we hid inside the custom email string
      const deviceId = userEmail.split('_')[1]?.split('@')[0];

      if (deviceId) {
        // 1. Find their pending order and flip its status flag to PAID
        const order = await Order.findOneAndUpdate(
          { deviceId, status: 'PENDING' },
          { status: 'PAID' },
          { returnDocument: 'after' }
        );

        if (order) {
          console.log(`💰 SUCCESS: Order ${order._id} has been fully funded via Paystack!`);
          
          // 🔥 2. Instead of editing the Session directly, we broadcast an announcement!
          eventBus.emit('payment:success', { deviceId });
        }
      }
    }

    // Always tell Paystack you received their event with a clean 200 OK
    return res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Webhook processing failure:', error);
    return res.status(500).json({ error: 'Internal Webhook Error' });
  }
};