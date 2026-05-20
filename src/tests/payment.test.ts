import request from 'supertest';
import express from 'express';
import paymentRoutes from '../routes/paymentRoutes';
import { Order } from '../models/order';

const mockEmit = jest.fn();

jest.mock('../utils/eventBus', () => {
  return {
    __esModule: true,
    default: {
      emit: (...args: any[]) => mockEmit(...args),
      on: jest.fn(),
      off: jest.fn()
    }
  };
});

jest.mock('../models/order', () => ({
  Order: {
    findOneAndUpdate: jest.fn()
  }
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
    // A: Match the mock order return value to our clean device ID
    (Order.findOneAndUpdate as jest.Mock).mockResolvedValue({
      _id: 'mock_mongo_id_123',
      deviceId: 'xyz',
      status: 'PAID'
    });

    // B: Use a single-word token token string 'xyz' so the split('_')[1] calculation works smoothly!
    const mockPaystackWebhook = {
      event: 'charge.success',
      data: {
        customer: { 
          email: 'customer_xyz@byte-to-bite.com' 
        }
      }
    };

    const response = await request(app)
      .post('/webhook')
      .send(mockPaystackWebhook);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'success' });
    
    // C: Assert against the exact clean token parameter emitted by your controller
    expect(mockEmit).toHaveBeenCalledWith('payment:success', {
      deviceId: 'xyz'
    });
  });

  it('should return 200 but ignore events that are not charge.success', async () => {
    const minorWebhookEvent = {
      event: 'transfer.reversed',
      data: {}
    };

    const response = await request(app)
      .post('/webhook')
      .send(minorWebhookEvent);

    expect(response.status).toBe(200);
    expect(mockEmit).not.toHaveBeenCalled();
  });
});