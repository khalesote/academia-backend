// Función para obtener estadísticas de usuarios desde Firebase
import { firestore, firebaseInitialized } from '../config/firebase';

export const getFirebaseUsersStats = async () => {
  if (!firebaseInitialized || !firestore) {
    console.log('Firebase no inicializado');
    return null;
  }

  try {
    // Obtener usuarios de Firebase Auth
    const usersSnapshot = await firestore.collection('users').get();
    const users = usersSnapshot.docs.map((doc: any) => doc.data());

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u: any) => {
        const lastLogin = u.lastLogin?.toDate();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return lastLogin && lastLogin > weekAgo;
      }).length,
      newUsersThisMonth: users.filter((u: any) => {
        const createdAt = u.createdAt?.toDate();
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return createdAt && createdAt > monthAgo;
      }).length,
      usersByLevel: {
        A1: users.filter((u: any) => u.progress?.nivelActual === 'A1').length,
        A2: users.filter((u: any) => u.progress?.nivelActual === 'A2').length,
        B1: users.filter((u: any) => u.progress?.nivelActual === 'B1').length,
        B2: users.filter((u: any) => u.progress?.nivelActual === 'B2').length,
      }
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas de Firebase:', error);
    return null;
  }
};

// Función para obtener lista de usuarios desde Firebase
export const getFirebaseUsersList = async () => {
  if (!firebaseInitialized || !firestore) {
    console.log('Firebase no inicializado');
    return [];
  }

  try {
    const usersSnapshot = await firestore.collection('users').get();
    return usersSnapshot.docs.map((doc: any) => ({
      uid: doc.id,
      ...doc.data(),
      lastLogin: doc.data().lastLogin?.toDate?.() || null,
      createdAt: doc.data().createdAt?.toDate?.() || null,
    }));
  } catch (error) {
    console.error('Error obteniendo lista de usuarios de Firebase:', error);
    return [];
  }
};
