// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Note: In Next.js, NEXT_PUBLIC_* variables are available on both client and server
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Debug: Log environment variable availability (only in development)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('🔍 Firebase Config Check:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    hasStorageBucket: !!firebaseConfig.storageBucket,
    hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
    hasAppId: !!firebaseConfig.appId,
  });
}

// Validate that all required Firebase config values are present and not empty
const requiredConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

// Check for missing or empty values
const missingKeys = requiredConfigKeys.filter(
  key => {
    const value = firebaseConfig[key];
    const isEmpty = !value || (typeof value === 'string' && value.trim() === '');
    if (isEmpty && process.env.NODE_ENV === 'development') {
      console.warn(`⚠️ Missing Firebase config: ${key}`);
    }
    return isEmpty;
  }
);

// Throw error before attempting to initialize Firebase
if (missingKeys.length > 0) {
  const errorMessage = `Missing required Firebase configuration: ${missingKeys.join(', ')}. ` +
    `Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.`;
  
  if (typeof window !== 'undefined') {
    // Client-side: log detailed error
    console.error('🔥 Firebase Configuration Error:', errorMessage);
    console.error('Missing keys:', missingKeys);
    console.error('Current environment values:', {
      apiKey: firebaseConfig.apiKey ? `✓ (${firebaseConfig.apiKey.substring(0, 10)}...)` : '✗ MISSING',
      authDomain: firebaseConfig.authDomain ? `✓ (${firebaseConfig.authDomain})` : '✗ MISSING',
      projectId: firebaseConfig.projectId ? `✓ (${firebaseConfig.projectId})` : '✗ MISSING',
      storageBucket: firebaseConfig.storageBucket ? `✓ (${firebaseConfig.storageBucket})` : '✗ MISSING',
      messagingSenderId: firebaseConfig.messagingSenderId ? `✓ (${firebaseConfig.messagingSenderId})` : '✗ MISSING',
      appId: firebaseConfig.appId ? `✓ (${firebaseConfig.appId.substring(0, 10)}...)` : '✗ MISSING',
    });
    console.error('Please ensure .env.local file exists in the project root with all NEXT_PUBLIC_FIREBASE_* variables set.');
  } else {
    // Server-side: log error
    console.error('🔥 Firebase Configuration Error (Server):', errorMessage);
    console.error('Missing keys:', missingKeys);
  }
  
  throw new Error(errorMessage);
}

// Ensure all required values are strings (not undefined)
const validatedConfig = {
  apiKey: String(firebaseConfig.apiKey!),
  authDomain: String(firebaseConfig.authDomain!),
  projectId: String(firebaseConfig.projectId!),
  storageBucket: String(firebaseConfig.storageBucket!),
  messagingSenderId: String(firebaseConfig.messagingSenderId!),
  appId: String(firebaseConfig.appId!),
  ...(firebaseConfig.measurementId && { measurementId: String(firebaseConfig.measurementId) }),
};

// Initialize Firebase only if config is valid
let app: ReturnType<typeof getApp> | null = null;
try {
  // Check if app already exists
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = getApp();
  } else {
    // Validate config one more time before initializing
    const hasAllRequiredFields = requiredConfigKeys.every(
      key => validatedConfig[key as keyof typeof validatedConfig] && 
             String(validatedConfig[key as keyof typeof validatedConfig]).trim() !== ''
    );
    
    if (!hasAllRequiredFields) {
      throw new Error('Firebase configuration is incomplete. Please check your .env.local file.');
    }
    
    app = initializeApp(validatedConfig);
  }
} catch (error: any) {
  const errorMsg = error?.message || String(error);
  const errorCode = error?.code || '';
  
  console.error('🔥 Firebase initialization error:', errorMsg);
  console.error('Error code:', errorCode);
  console.error('Validated config keys present:', Object.keys(validatedConfig));
  
  if (errorCode === 'auth/configuration-not-found' || errorMsg.includes('configuration-not-found')) {
    const helpfulMessage = 
      'Firebase configuration not found. Please check:\n' +
      '1. .env.local file exists in project root (same folder as package.json)\n' +
      '2. All NEXT_PUBLIC_FIREBASE_* variables are set (no empty values)\n' +
      '3. Dev server was restarted after adding env variables\n' +
      '4. No spaces around = sign in .env.local\n' +
      '5. Check browser console for which variables are missing';
    
    if (typeof window !== 'undefined') {
      console.error(helpfulMessage);
      console.error('Raw env check:', {
        apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
    }
    
    throw new Error(helpfulMessage);
  }
  throw error;
}

// const analytics = getAnalytics(app);

// Only export auth and db if app is successfully initialized
if (!app) {
  throw new Error('Firebase app was not initialized. Please check your environment variables.');
}

export const auth = getAuth(app);
export const db = getFirestore(app);