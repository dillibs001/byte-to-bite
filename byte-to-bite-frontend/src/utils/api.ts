import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api', // Points directly to your Express backend!
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically inject our unique X-Device-ID tracking header before every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    let deviceId = localStorage.getItem('byte_to_bite_device_id');
    
    // If this is a completely new browser visitor session, generate a unique random identity token
    if (!deviceId) {
      deviceId = `web_device_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('byte_to_bite_device_id', deviceId);
    }
    
    config.headers['X-Device-ID'] = deviceId;
  }
  return config;
});

export default apiClient;