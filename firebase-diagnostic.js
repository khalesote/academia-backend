import { initializeFirebase, isFirebaseInitialized, firestore, auth } from './config/firebase.js';

// Ejecutar diagnóstico
console.log('🔍 === DIAGNÓSTICO FIREBASE ===');
console.log('Firebase inicializado:', isFirebaseInitialized());
console.log('Firestore disponible:', !!firestore);
console.log('Auth disponible:', !!auth);

if (firestore) {
  console.log('✅ Firestore está disponible');
} else {
  console.log('❌ Firestore no disponible - problema de inicialización');
}

console.log('=== FIN DIAGNÓSTICO ===');
