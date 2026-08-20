import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

let HOST_URL = 'http://localhost:3000/api';
if (Platform.OS === 'android') {
  HOST_URL = 'http://10.0.2.2:3000/api';
}

const hostUri = Constants.expoConfig?.hostUri;
if (hostUri) {
  const ip = hostUri.split(':')[0];
  HOST_URL = `http://${ip}:3000/api`;
}

export const API_BASE = ENV_API_URL || HOST_URL;
