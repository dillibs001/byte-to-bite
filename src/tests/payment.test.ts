import request from 'supertest';
import express from 'express';
import crypto from 'crypto';
import paymentRoutes from '../routes/paymentRoutes';
import { Order } from '../models/order';

const mockEmit = jest.fn();

jest.mock('../utils/eventBus', () => ({
  __esModule: true,
  default: { emit: (...args: any[]) => mockEmit(...args), on: jest.fn(), off: jest.fn() }
}));

jest.mock('../models/order', () => ({
  Order: { findOneAndUpdate: jest.fn() }
}));

const app = express();
app.use(express.json());
app.use('/', paymentRoutes);

describe('💳 Backend Paystack Webhook Integration Test Suite', () => {
  
  beforeEach(() => {
    mockEmit.mockClear();
    jest.clearAllMocks();
  });

  it('should process a successful charge.success event and emit an internal event', async () => {
    (Order.findOneAndUpdate as jest.Mock).mockResolvedValue({
      _id: 'mock_mongo_id_123',
      deviceId: 'xyz',
      status: 'PAID'
    });

    // Match the clean structural metadata definition we just built!
    const mockPaystackWebhook = {
      event: 'charge.success',
      data: {
        metadata: {
          deviceId: 'xyz'
        }
      }
    };

    // Generate a valid mock signature using our test environment fallback key string
    const mockSecret = process.env.PAYSTACK_SECRET_KEY || '';
    const validTestSignature = crypto
      .createHmac('sha512', mockSecret)
      .update(JSON.stringify(mockPaystackWebhook))
      .digest('hex');

    const response = await request(app)
      .post('/webhook')
      .set('x-paystack-signature', validTestSignature) // Injects the verification header token
      .send(mockPaystackWebhook);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'success' });
    
    expect(mockEmit).toHaveBeenCalledWith('payment:success', {
      deviceId: 'xyz'
    });
  });

  it('should reject requests with an invalid signature', async () => {
    const response = await request(app)
      .post('/webhook')
      .set('x-paystack-signature', 'fake_malicious_signature_hash')
      .send({ event: 'charge.success', data: {} });

    // Expecting an unauthorized block status code
    expect(response.status).toBe(401);
    expect(mockEmit).not.toHaveBeenCalled();
  });
});