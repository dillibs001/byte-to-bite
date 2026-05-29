import axios from 'axios';

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}


export const initializePaystackPayment = async (
  email: string, 
  amountInNaira: number,
  extraData?: Record<string, any> // 1. 🔥 Allow an optional 3rd argument for custom metadata/options
) => {
  try {
    // Paystack expects amount in Kobo (Multiply Naira by 100)
    const amountInKobo = Math.round(Number(amountInNaira) * 100);

    const response = await axios.post<PaystackInitResponse>(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amountInKobo,
        // 2. 🌐 Fix callback URL to pull from env for production, fallback to local webhook
        callback_url: process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:3000/webhook',
        ...extraData // 3. 🔥 Spread the extra data object (unpacks { metadata: { deviceId } } into the body)
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
// 1. 🎁 Catch the entire response data block inside a single variable
    const initializedData = response.data.data;

    // 2. 🎯 Console.log that variable to inspect it in your terminal
    console.log('🔍 PAYSTACK INITIALIZED RESPONSE VARIABLE:', initializedData);

    // 3. 🚀 Return the variable so your payment service controller gets the routing URL
    return initializedData;
    
  } catch (error: any) {
    console.error('Paystack initialization network failure:', error.response?.data || error.message);
    throw error;
  }
};

