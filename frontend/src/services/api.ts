import axios from 'axios';

// Create a reusable Axios instance
export const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // optional: 60s timeout
});

// Optional: add interceptors for logging / error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

