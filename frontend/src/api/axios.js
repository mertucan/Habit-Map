import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Flask varsayılan portu
  withCredentials: true, // Çerezler/oturum için önemli
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
