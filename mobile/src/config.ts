import Constants from 'expo-constants';
import { Platform } from 'react-native';

const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

// Aponta para a API em produção no Railway!
let HOST_URL = 'https://portaldebraganca-production.up.railway.app/api';

export const API_BASE = ENV_API_URL || HOST_URL;
