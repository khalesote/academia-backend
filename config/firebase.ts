import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// REMOVED: import { getAnalytics } from 'firebase/analytics'; // Not supported in React Native
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  // Replace these with your actual Firebase config values
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAvyKrByXcclQNLfZIyyyn3Hc5fWutMiBY",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "academia-inmigrantes-movil.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "academia-inmigrantes-movil",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "academia-inmigrantes-movil.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "366110120529",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:366110120529:android:ad147c976b206ac1bbf670",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// Initialize Firebase App (singleton pattern)
let firebaseApp: any = null;

export const initializeFirebase = () => {
  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('🔥 Firebase App inicializado correctamente');
      console.log('📊 Configuración Firebase:', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain
      });
    } else {
      firebaseApp = getApp();
      console.log('🔄 Firebase App ya estaba inicializado');
    }
    return true;
  } catch (error) {
    console.error('❌ Error inicializando Firebase App:', error);
    return false;
  }
};

// Initialize Firebase on module load
export const firebaseInitialized = initializeFirebase();

// Initialize Firebase Auth with AsyncStorage persistence
export const auth = firebaseInitialized && firebaseApp ?
  (getApps().length ? getAuth(firebaseApp) : getAuth(firebaseApp)) : null;

// Initialize Firestore
export const firestore = firebaseInitialized && firebaseApp ? getFirestore(firebaseApp) : null;

// Helper function to check if Firebase is properly initialized
export const isFirebaseInitialized = (): boolean => {
  const initialized = firebaseInitialized && auth !== null && firestore !== null;
  console.log('🔍 Verificando estado de Firebase:', {
    firebaseInitialized,
    auth: !!auth,
    firestore: !!firestore,
    initialized
  });
  return initialized;
};

// Función de diagnóstico completa para debugging
export const diagnoseFirebase = () => {
  console.log('🔍 === DIAGNÓSTICO FIREBASE COMPLETO ===');
  console.log('📦 firebaseInitialized:', firebaseInitialized);
  console.log('🔐 auth disponible:', !!auth);
  console.log('🗃️ firestore disponible:', !!firestore);
  console.log('🏠 firebaseApp disponible:', !!firebaseApp);
  console.log('🔧 getApps().length:', getApps().length);

  if (firebaseApp) {
    console.log('📊 Configuración del proyecto:', firebaseApp.options?.projectId);
  }

  const configValid = validateFirebaseConfig();
  console.log('⚙️ Configuración válida:', configValid.isValid);
  if (!configValid.isValid) {
    console.log('❌ Errores de configuración:', configValid.errors);
  }

  console.log('=== FIN DIAGNÓSTICO ===');
  return isFirebaseInitialized();
};

// Helper function to get Firebase app instance
export const getFirebaseApp = () => {
  if (firebaseInitialized && firebaseApp) {
    return firebaseApp;
  }
  throw new Error('Firebase is not initialized');
};

// Environment-specific configuration
export const getFirebaseConfig = () => {
  if (__DEV__) {
    return {
      ...firebaseConfig,
      // Development settings
      debug: true,
    };
  }

  return firebaseConfig;
};

// Validate Firebase configuration
export const validateFirebaseConfig = () => {
  const errors: string[] = [];

  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')) {
    errors.push('Firebase API key is not configured properly');
  }

  if (!firebaseConfig.projectId || firebaseConfig.projectId.includes('your-project-id')) {
    errors.push('Firebase project ID is not configured properly');
  }

  if (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes('your-project.firebaseapp.com')) {
    errors.push('Firebase auth domain is not configured properly');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export default configuration for easy importing
export default {
  auth,
  firestore,
  firebaseInitialized,
  config: firebaseConfig,
  isInitialized: isFirebaseInitialized,
  validateConfig: validateFirebaseConfig
};
