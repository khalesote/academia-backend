// Función para verificar el estado de Firebase y proporcionar diagnóstico
import firebase from 'firebase/compat/app';

export const checkFirebaseStatus = async () => {
  try {
    const { firebaseInitialized, auth, firestore } = await import('../config/firebase');

    const status = {
      initialized: firebaseInitialized,
      authAvailable: !!auth,
      firestoreAvailable: !!firestore,
      timestamp: new Date().toISOString()
    };

    console.log('Estado de Firebase:', status);

    if (!firebaseInitialized) {
      console.warn('Firebase no está inicializado. Verifica la configuración.');
      return { ...status, error: 'Firebase no inicializado' };
    }

    if (!auth) {
      console.warn('Firebase Auth no disponible');
      return { ...status, error: 'Auth no disponible' };
    }

    if (!firestore) {
      console.warn('Firebase Firestore no disponible');
      return { ...status, error: 'Firestore no disponible' };
    }

    return status;
  } catch (error: any) {
    console.error('Error verificando estado de Firebase:', error);
    return {
      initialized: false,
      authAvailable: false,
      firestoreAvailable: false,
      error: error?.message || 'Error desconocido',
      timestamp: new Date().toISOString()
    };
  }
};

// Función alternativa segura para inicializar Firebase con reintentos
export const initializeFirebaseSafely = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Intento ${attempt} de inicialización de Firebase`);

      const status = await checkFirebaseStatus();

      if (status.initialized && status.authAvailable && status.firestoreAvailable) {
        console.log('Firebase inicializado correctamente');
        return true;
      }

      // Si no está inicializado pero es el último intento, intentar inicializar
      if (attempt === maxRetries) {
        console.log('Último intento: intentando inicializar Firebase...');

        // Forzar inicialización
        const firebaseConfig = {
          apiKey: "AIzaSyB2vJ3YqL8rFzI1G9H5K4M7N2O1P6Q9R3S8T",
          authDomain: "academiadeinmigrantes-6ba58.firebaseapp.com",
          projectId: "academiadeinmigrantes-6ba58",
          storageBucket: "academiadeinmigrantes-6ba58.appspot.com",
          messagingSenderId: "114555701271100454170",
          appId: "1:366110120529:web:266c0e8c51de82c2bbf670"
        };

        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }

        return true;
      }

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    } catch (error: any) {
      console.error(`Error en intento ${attempt}:`, error);

      if (attempt === maxRetries) {
        console.error('Firebase no pudo inicializarse después de varios intentos');
        return false;
      }
    }
  }

  return false;
};
