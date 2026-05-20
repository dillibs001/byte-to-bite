import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export const initializePaystackPayment = async (email: string, amountInNaira: string | number) => {
  try {
    // Paystack expects amount in Kobo (Multiply Naira by 100)
    const amountInKobo = Math.round(Number(amountInNaira) * 100);

    const response = await axios.post<PaystackInitResponse>(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amountInKobo,
        callback_url: 'http://localhost:5000/api/payments/verify' 
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      return response.data.data;
    }
    throw new Error(response.data.message);
  } catch (error: any) {
    console.error('Paystack SDK Initialization Error:', error.response?.data || error.message);
    throw new Error('Could not generate Paystack checkout node link.');
  }
};