import { Router } from 'express';
import { verifyPaystackWebhook } from '../controllers/paymentController';

const router = Router();

// This endpoint listens to the incoming POST alerts from Paystack
router.post('/webhook', verifyPaystackWebhook);

export default router;