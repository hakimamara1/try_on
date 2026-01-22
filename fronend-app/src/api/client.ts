import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BASE_URL } from '../config';
import { navigate } from '../navigation/navigationRef';


// NOTE: precise the IP address if you are running on a physical device
// For Android Emulator use 'http://10.0.2.2:5000'
// For iOS Simulator use 'http://localhost:5000'
// For Android Emulator, use 'http://10.0.2.2:5000/api'
// For iOS Simulator, use 'http://localhost:5000/api'
// For Physical Device, use your machine's LAN IP e.g. 'http://192.168.1.100:5000/api'

// Auto-detect based on Platform is not fully possible for "localhost" mapping on Android vs iOS
// defaulting to localhost for iOS/Simulators. 
// If you are on Android, please uncomment the Android line.

// const BASE_URL = 'http://10.0.2.2:5001/api'; // Android Emulator
// const BASE_URL = 'http://localhost:5001/api'; // iOS Simulator
// Physical Device / LAN

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to every request
client.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            await AsyncStorage.removeItem('token');
            // Navigate to Login
            navigate('Login');
        }
        return Promise.reject(error);
    }
);

export default client;
