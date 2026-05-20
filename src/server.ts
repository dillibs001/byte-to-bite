import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

// Route Imports
import chatRoutes from './routes/chatRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminRoutes from './routes/adminRoutes'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Gateways
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', message: 'Chatbot backend engine running smoothly.' });
});

// Boot Sequence
const startServer = async () => {
  await connectDB(); // Ensure DB is connected BEFORE taking traffic
  
  app.listen(PORT, () => {
    console.log(`🚀 Chatbot server running cleanly on http://localhost:${PORT}`);
  });
};

startServer();