// Point this at your backend via EXPO_PUBLIC_API_URL in a .env file (see
// .env.example) rather than hardcoding it here — the right value differs per
// developer/device: your machine's LAN IP for a physical device, 10.0.2.2 for
// the Android emulator, localhost for the iOS simulator.
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.23.150.77:5001/api';
