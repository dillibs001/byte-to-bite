import request from 'supertest';
import express from 'express';
import adminRoutes from '../routes/adminRoutes';
import { seedNewMeal } from '../services/adminService';

// 1. Setup a dummy express application just to run our routes through during the test
const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

//  Hijack your adminService layer so we don't accidentally write to your real MongoDB database!
jest.mock('../services/adminService');
const mockedSeedNewMeal = jest.mocked(seedNewMeal);
describe('🔒 Backend Admin Integration Test Suite', () => {
  
  // Set up your environment variable dummy key before the tests run
  const MOCK_ADMIN_KEY = 'test_secret_key_123';
  
  beforeAll(() => {
    process.env.ADMIN_API_KEY = MOCK_ADMIN_KEY;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Security Gate Rejection (Missing Header)
  it('should return 403 Forbidden if the X-Admin-API-Key header is missing', async () => {
    const response = await request(app)
      .post('/api/admin/menu')
      .send({ numberId: 6, name: 'Suya', price: 2000 }); // Notice we don't chain a .set() header here

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Forbidden: Invalid or missing Admin API Key.' });
    expect(mockedSeedNewMeal).not.toHaveBeenCalled(); // Ensure the database brain was never touched
  });

  // Test Case 2: Security Gate Rejection (Wrong Password)
  it('should return 403 Forbidden if the provided key does not match the server .env key', async () => {
    const response = await request(app)
      .post('/api/admin/menu')
      .set('X-Admin-API-Key', 'wrong_hacker_password') // Injected custom key
      .send({ numberId: 6, name: 'Suya', price: 2000 });

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('Forbidden');
  });

  // Test Case 3: The Happy Path (Successful Authorization + Data Save)
  it('should pass authorization and return 201 when the correct key is provided', async () => {
    const fakeCreatedMeal = { _id: 'mock_mongo_id_111', numberId: 6, name: 'Suya', price: 2000 };
    
    // Tell our mocked service brain to act like it saved it successfully
    mockedSeedNewMeal.mockResolvedValueOnce(fakeCreatedMeal as any);

    const response = await request(app)
      .post('/api/admin/menu')
      .set('X-Admin-API-Key', MOCK_ADMIN_KEY) // Correct Key!
      .send({ numberId: 6, name: 'Suya', price: 2000 });

    // Assertions
    expect(response.status).toBe(201);
    expect(response.body.message).toContain('successfully');
    expect(response.body.meal).toEqual(fakeCreatedMeal);
    
    // Ensure our service function was called with exactly the data parsed from the HTTP body
    expect(mockedSeedNewMeal).toHaveBeenCalledWith(6, 'Suya', 2000);
  });
});