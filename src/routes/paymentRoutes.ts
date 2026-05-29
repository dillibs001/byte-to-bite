import { Router } from 'express';
import { verifyPaystackWebhook, checkOrderStatus} from '../controllers/paymentController';

const router = Router();

// This endpoint listens to the incoming POST alerts from Paystack
router.post('/webhook', verifyPaystackWebhook);
router.get('/payments/status/:deviceId', checkOrderStatus); // New GET endpoint to check order status by device ID

export default router;