import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, firestore, firebaseInitialized, diagnoseFirebase } from '../config/firebase';
import { collection, doc, setDoc, getDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Tipos de datos
export interface User {
  id?: number;
  uid?: string; // Firebase UID
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'owner';
  createdAt: string;
  lastLogin?: string;
  progress?: {
    nivelActual: string;
    puntuacionTotal: number;
    unidadesCompletadas: number;
    tiempoEstudio: number;
  };
  preferences?: {
    idioma: 'es' | 'ar';
    notificaciones: boolean;
    tema: 'light' | 'dark';
  };
}

// Función helper para obtener nombre completo
export const getFullName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`.trim();
};

export interface UserProgress {
  id?: number;
  userId: number;
  nivel: string;
  puntuacion: number;
  fecha: string;
  tiempo: number;
  respuestasCorrectas: number;
  totalPreguntas: number;
}

class UserDatabase {
  private usersKey = 'users_data';
  private progressKey = 'user_progress_data';
  private nextUserId = 1;

  async init() {
    try {
      // Inicializar contador de IDs
      const users = await this.getAllUsers();
      if (users.length > 0) {
        this.nextUserId = Math.max(...users.map((u: User) => u.id || 0)) + 1;
      }
      console.log('Base de datos de usuarios inicializada');

      // Sincronizar usuarios con Firebase si es posible
      await this.syncWithFirebase();
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
    }
  }

  // Sincronizar usuarios con Firebase
  private async syncWithFirebase() {
    console.log('🔄 Iniciando sincronización con Firebase...');

    // Verificar que Firebase esté inicializado
    if (!firebaseInitialized) {
      console.log('❌ Firebase no inicializado en syncWithFirebase');
      return;
    }

    if (!firestore) {
      console.log('❌ Firestore no disponible en syncWithFirebase');
      return;
    }

    try {
      console.log('📡 Conectando a Firebase Firestore...');
      // Obtener usuarios actuales de Firebase usando sintaxis v9
      const usersRef = collection(firestore, 'users');
      const firebaseUsersSnapshot = await getDocs(usersRef);
      console.log('✅ Usuarios obtenidos de Firebase:', firebaseUsersSnapshot.size);

      const firebaseUsers = firebaseUsersSnapshot.docs.map((doc: any) => {
        const data = doc.data();
        return {
          id: data.localId,
          uid: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          role: data.role || 'user',
          createdAt: data.createdAt || new Date().toISOString(),
          progress: data.progress,
          preferences: data.preferences
        } as User;
      });

      // Obtener usuarios locales
      const localUsers = await this.getAllUsers();

      // Combinar usuarios (priorizar Firebase)
      const allUsers = [...firebaseUsers, ...localUsers.filter((local: User) =>
        !firebaseUsers.some((firebase: User) => firebase.email === local.email)
      )];

      if (allUsers.length > 0) {
        await AsyncStorage.setItem(this.usersKey, JSON.stringify(allUsers));
        this.nextUserId = Math.max(...allUsers.map((u: User) => u.id || 0)) + 1;
        console.log('✅ Sincronización completada:', allUsers.length, 'usuarios');
      }
    } catch (error) {
      console.error('❌ Error sincronizando con Firebase:', error);
    }
  }

  // Registrar nuevo usuario con Firebase
  async registerUser(userData: Omit<User, 'id' | 'uid' | 'createdAt' | 'role'>): Promise<{user: User | null, error: string | null}> {
    try {
      // Verificar si Firebase está disponible
      if (!firebaseInitialized || !auth) {
        console.log('Firebase no disponible, usando registro local');
        return await this.registerLocalUser(userData);
      }

      // Verificar en Firebase si el email ya existe usando Firestore v9
      if (firestore) {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('email', '==', userData.email));
        const existingUsers = await getDocs(q);
        if (!existingUsers.empty) {
          return { user: null, error: 'El correo electrónico ya está registrado en Firebase' };
        }
      }

      // Crear usuario en Firebase Auth (v9)
      const firebaseUser = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

      if (!firebaseUser.user) {
        return { user: null, error: 'Error creando usuario en Firebase' };
      }

      // Crear el usuario completo
      const isFirstUser = await this.isFirstUser();
      const user: User = {
        ...userData,
        id: this.nextUserId++,
        uid: firebaseUser.user.uid,
        role: isFirstUser ? 'owner' : 'user',
        createdAt: new Date().toISOString(),
        progress: {
          nivelActual: 'A1',
          puntuacionTotal: 0,
          unidadesCompletadas: 0,
          tiempoEstudio: 0
        },
        preferences: {
          idioma: 'es',
          notificaciones: true,
          tema: 'light'
        }
      };

      // Guardar en Firebase Firestore (v9)
      if (firestore) {
        const usersRef = collection(firestore, 'users');
        await setDoc(doc(usersRef, firebaseUser.user.uid), {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          localId: user.id,
          progress: user.progress,
          preferences: user.preferences
        });
      }

      // Guardar en la base de datos local
      const existingUsers = await this.getAllUsers();
      existingUsers.push(user);
      await AsyncStorage.setItem(this.usersKey, JSON.stringify(existingUsers));

      return { user, error: null };
    } catch (error: any) {
      console.error('Error registrando usuario:', error);

      // Si Firebase falla, intentar registro local como respaldo
      if (error.code === 'auth/email-already-in-use' || error.message?.includes('Firebase')) {
        return await this.registerLocalUser(userData);
      }

      return { user: null, error: error.message || 'Error desconocido al registrar el usuario' };
    }
  }

  // Registro local como respaldo cuando Firebase no está disponible
  private async registerLocalUser(userData: Omit<User, 'id' | 'createdAt' | 'role'>): Promise<{user: User | null, error: string | null}> {
    try {
      // Verificar en la base de datos local si el email ya existe
      const existingUsers = await this.getAllUsers();
      const emailExistsLocal = existingUsers.some((u: User) => u.email.toLowerCase() === userData.email.toLowerCase());

      if (emailExistsLocal) {
        return { user: null, error: 'El correo electrónico ya está registrado' };
      }

      // Crear el usuario
      const isFirstUser = existingUsers.length === 0;
      const user: User = {
        ...userData,
        id: this.nextUserId++,
        role: isFirstUser ? 'owner' : 'user',
        createdAt: new Date().toISOString(),
        progress: {
          nivelActual: 'A1',
          puntuacionTotal: 0,
          unidadesCompletadas: 0,
          tiempoEstudio: 0
        },
        preferences: {
          idioma: 'es',
          notificaciones: true,
          tema: 'light'
        }
      };

      // Guardar en la base de datos local
      existingUsers.push(user);
      await AsyncStorage.setItem(this.usersKey, JSON.stringify(existingUsers));

      return { user, error: null };
    } catch (error: any) {
      console.error('Error registrando usuario local:', error);
      return { user: null, error: error.message || 'Error desconocido al registrar el usuario' };
    }
  }

  // Iniciar sesión con Firebase
  async loginUser(email: string, password: string): Promise<User | null> {
    try {
      // Verificar si Firebase está disponible
      if (!firebaseInitialized || !auth) {
        console.log('Firebase no disponible, usando login local');
        return await this.loginLocalUser(email, password);
      }

      // Intentar login con Firebase primero (v9)
      const firebaseUser = await signInWithEmailAndPassword(auth, email, password);

      if (firebaseUser.user) {
        // Obtener datos completos del usuario desde Firestore (v9)
        if (firestore) {
          const usersRef = collection(firestore, 'users');
          const userDoc = await getDoc(doc(usersRef, firebaseUser.user.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const user: User = {
              uid: firebaseUser.user.uid,
              firstName: userData?.firstName || '',
              lastName: userData?.lastName || '',
              email: firebaseUser.user.email || email,
              password: password,
              role: userData?.role || 'user',
              createdAt: userData?.createdAt || new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              progress: userData?.progress,
              preferences: userData?.preferences
            };

            // Actualizar último login en Firestore (v9)
            await updateDoc(doc(usersRef, firebaseUser.user.uid), {
              lastLogin: new Date().toISOString()
            });

            // Actualizar en AsyncStorage local
            await userStorage.saveCurrentUser(user);

            return user;
          }
        }
      }

      return null;
    } catch (error: any) {
      console.error('Error en login con Firebase:', error);

      // Si Firebase falla, intentar login local como respaldo
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.message?.includes('Firebase')) {
        return await this.loginLocalUser(email, password);
      }

      return null;
    }
  }

  // Login local como respaldo
  private async loginLocalUser(email: string, password: string): Promise<User | null> {
    try {
      const users = await this.getAllUsers();
      const user = users.find((u: User) => u.email === email && u.password === password);

      if (user) {
        // Actualizar último login
        user.lastLogin = new Date().toISOString();
        await this.updateUser(user);
        await userStorage.saveCurrentUser(user);
        return user;
      }

      return null;
    } catch (error: any) {
      console.error('Error en login local:', error);
      return null;
    }
  }

  // Verificar si es el primer usuario
  private async isFirstUser(): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      return users.length === 0;
    } catch (error) {
      console.error('Error verificando si es el primer usuario:', error);
      return true;
    }
  }

  // Verificar si el email ya existe
  async emailExists(email: string): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      return users.some((u: User) => u.email.toLowerCase() === email.toLowerCase());
    } catch (error) {
      console.error('Error verificando email:', error);
      return false;
    }
  }

  // Obtener todos los usuarios
  async getAllUsers(): Promise<User[]> {
    try {
      const usersStr = await AsyncStorage.getItem(this.usersKey);
      return usersStr ? JSON.parse(usersStr) : [];
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }
  }

  // Actualizar progreso del usuario
  async updateUserProgress(userId: number, progress: User['progress']): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const userIndex = users.findIndex((u: User) => u.id === userId);

      if (userIndex !== -1) {
        users[userIndex].progress = progress;
        await AsyncStorage.setItem(this.usersKey, JSON.stringify(users));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error actualizando progreso:', error);
      return false;
    }
  }

  // Verificar si el usuario es propietario
  async isOwner(userId: number): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const user = users.find((u: User) => u.id === userId);
      return user?.role === 'owner';
    } catch (error) {
      console.error('Error verificando rol de propietario:', error);
      return false;
    }
  }

  // Verificar si el usuario es administrador o propietario
  async isAdminOrOwner(userId: number): Promise<boolean> {
    try {
      const users = await this.getAllUsers();
      const user = users.find((u: User) => u.id === userId);
      return user?.role === 'admin' || user?.role === 'owner';
    } catch (error) {
      console.error('Error verificando permisos administrativos:', error);
      return false;
    }
  }

  // Métodos auxiliares privados
  private async updateUser(updatedUser: User): Promise<void> {
    const users = await this.getAllUsers();
    const userIndex = users.findIndex((u: User) => u.id === updatedUser.id);

    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      await AsyncStorage.setItem(this.usersKey, JSON.stringify(users));
    }
  }
  async registerUserAfterEnrollment(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<{user: User | null, error: string | null}> {
    try {
      // Verificar si Firebase está disponible
      if (!firebaseInitialized || !auth || !firestore) {
        console.log('Firebase no disponible, usando registro local');
        return await this.registerLocalUser(userData);
      }

      // Crear usuario en Firebase Auth
      const firebaseUser = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

      if (!firebaseUser.user) {
        return { user: null, error: 'Error creando usuario en Firebase' };
      }

      // Crear el usuario completo
      const user: User = {
        ...userData,
        id: Date.now(),
        uid: firebaseUser.user.uid,
        role: 'user',
        createdAt: new Date().toISOString(),
        progress: {
          nivelActual: 'A1',
          puntuacionTotal: 0,
          unidadesCompletadas: 0,
          tiempoEstudio: 0
        },
        preferences: {
          idioma: 'es',
          notificaciones: true,
          tema: 'light'
        }
      };

      // Guardar en Firebase Firestore (v9)
      const usersRef = collection(firestore, 'users');
      await setDoc(doc(usersRef, firebaseUser.user.uid), {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        localId: user.id,
        progress: user.progress,
        preferences: user.preferences,
        enrollmentCompleted: true,
        enrollmentDate: new Date().toISOString()
      });

      // Guardar en la base de datos local como respaldo
      const existingUsers = await this.getAllUsers();
      existingUsers.push(user);
      await AsyncStorage.setItem(this.usersKey, JSON.stringify(existingUsers));

      // Guardar como usuario actual
      await userStorage.saveCurrentUser(user);

      console.log('✅ Usuario registrado exitosamente en Firebase después de matrícula');
      return { user, error: null };

    } catch (error: any) {
      console.error('Error registrando usuario después de matrícula:', error);

      if (error.code === 'auth/email-already-in-use' || error.message?.includes('Firebase')) {
        return await this.registerLocalUser(userData);
      }

      return { user: null, error: error.message || 'Error desconocido al registrar el usuario' };
    }
  }
}

// Instancia singleton
export const userDB = new UserDatabase();

// Funciones de conveniencia para AsyncStorage (compatibilidad)
export const userStorage = {
  // Guardar usuario actual en AsyncStorage (para sesión)
  async saveCurrentUser(user: User): Promise<void> {
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
  },

  // Obtener usuario actual
  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  },

  // Cerrar sesión
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('currentUser');
  },

  // Verificar si hay usuario logueado
  async isLoggedIn(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  },

  // Limpiar todos los datos (útil para desarrollo)
  async clearAllData(): Promise<void> {
    try {
      const keys = ['currentUser', 'users_data', 'user_progress_data'];
      await AsyncStorage.multiRemove(keys);
      console.log('Datos limpiados exitosamente');
    } catch (error) {
      console.error('Error limpiando datos:', error);
    }
  }
};
