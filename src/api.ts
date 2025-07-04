import axios from 'axios';
import { a } from 'framer-motion/dist/types.d-D0HXPxHm';
const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('[API Error]', error.response || error.message);
    return Promise.reject(error);
  }
);

export async function getBatteryStatus() {
    const response = await api.get('/items/battery');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error fetching battery status: ${response.statusText}`);
    }
}

export async function getJointsStatus() {
    const response = await api.get('/items/joints');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error fetching joints status: ${response.statusText}`);
    }
}

export async function getTasks() {
    const response = await api.get('/items/tasks');
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Error fetching tasks: ${response.statusText}`);
    }
}