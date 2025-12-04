import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Flask default port
  withCredentials: true, // Important for cookies/session
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
