import axios from 'axios';

const apiClient = axios.create({
  // Uses the environment variable on Vercel, or gracefully falls back to localhost for your laptop
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject our unique X-Device-ID tracking header before every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem('byte_to_bite_device_id');

    // If this is a completely new browser visitor session, generate a secure UUID
    if (!deviceId) {
      // Upgrade: Universal, fixed-length, cryptographically secure identifier
      deviceId = `web_device_${window.crypto.randomUUID()}`;
      localStorage.setItem('byte_to_bite_device_id', deviceId);
    }

    config.headers['X-Device-ID'] = deviceId;
  }
  return config;
});

export default apiClient;