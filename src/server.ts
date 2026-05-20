import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Product } from './models/product'; // Import your Product model
import chatRoutes from './routes/chatRoutes';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT


app.use(cors({
  origin: 'http://localhost:3001', // Explicitly allow your Next.js app to talk to the API!
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-ID'], // Allow our custom device tracking header!
}));
app.use(express.json());
app.use('/api/payments', paymentRoutes);


// Device ID Session Middleware Tracker
app.use((req, res, next) => {
   console.log('👀 Incoming request headers:', req.headers);
  const deviceId = req.header('X-Device-ID');
  if (!deviceId) {
    return res.status(400).json({ error: 'X-Device-ID header is required to maintain your chat session.' });
  }
  req.body.deviceId = deviceId; 
  next();
});

app.use('/api/chat', chatRoutes);



// Quick Database Seeder Function
async function seedRestaurantMenu() {
  const count = await Product.countDocuments();
  if (count === 0) {
    console.log('🌱 Menu is empty. Seeding sample restaurant items...');
    await Product.insertMany([
      { numberId: 1, name: 'Cheeseburger & Fries', price: 4500 },
      { numberId: 2, name: 'Pepperoni Pizza (Medium)', price: 6000 },
      { numberId: 3, name: 'Spicy Chicken Wings (6pcs)', price: 3500 },
      { numberId: 4, name: 'Jollof Rice with Grilled Chicken', price: 4000 },
      { numberId: 5, name: 'Cold Malt Drink', price: 800 }
    ]);
    console.log('✅ Menu seeded successfully with 5 items.');
  } else {
    console.log('🍽️ Restaurant menu already loaded in database.');
  }
}

app.get('/health', (req, res) => {
  console.log('🔍 Health check endpoint hit. Server is alive and responding.');
  res.status(200).json({ 
    status: 'active', message: 'Chatbot backend engine running smoothly.' });
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/statebite';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('🛡️ MongoDB Database connected successfully.');
    
    // Run the seeder right after successful connection
    await seedRestaurantMenu();

    app.listen(PORT, () => {
      console.log(`🚀 Chatbot server running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
  });