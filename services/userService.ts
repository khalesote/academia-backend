import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, firestore, isFirebaseInitialized } from '../config/firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  // Add other user properties as needed
}

export interface LoginResponse {
  user?: User;
  error?: string;
}

export interface ResetPasswordResponse {
  success?: boolean;
  error?: string;
}

export class UserService {
  private static readonly USERS_KEY = 'registered_users';
  private static readonly CURRENT_USER_KEY = 'current_user';

  /**
   * Login user with email and password using Firebase Auth
   */
  static async loginUser(email: string, password: string): Promise<LoginResponse> {
    try {
      if (!isFirebaseInitialized()) {
        return { error: 'Firebase no está inicializado correctamente.' };
      }

      if (!auth) {
        return { error: 'Servicio de autenticación no disponible.' };
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(firestore!, 'users', firebaseUser.uid));
      const userData = userDoc.data();

      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: userData?.name || firebaseUser.displayName || '',
        firstName: userData?.firstName,
        lastName: userData?.lastName
      };

      // Store current user locally for quick access
      await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

      return { user };
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle specific Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        return { error: 'No existe una cuenta con este correo electrónico.' };
      } else if (error.code === 'auth/wrong-password') {
        return { error: 'Contraseña incorrecta.' };
      } else if (error.code === 'auth/invalid-email') {
        return { error: 'Correo electrónico inválido.' };
      } else if (error.code === 'auth/user-disabled') {
        return { error: 'Esta cuenta ha sido deshabilitada.' };
      } else if (error.code === 'auth/too-many-requests') {
        return { error: 'Demasiados intentos fallidos. Inténtalo más tarde.' };
      } else if (error.code === 'auth/network-request-failed') {
        return { error: 'Error de conexión. Verifica tu conexión a internet.' };
      }

      return { error: 'Error interno del servidor. Inténtalo de nuevo.' };
    }
  }

  /**
   * Reset user password using Firebase Auth
   */
  static async resetPassword(email: string): Promise<ResetPasswordResponse> {
    try {
      if (!isFirebaseInitialized() || !auth) {
        return { error: 'Servicio de autenticación no disponible.' };
      }

      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);

      if (error.code === 'auth/user-not-found') {
        // For security, don't reveal if email exists or not
        return { success: true };
      } else if (error.code === 'auth/invalid-email') {
        return { error: 'Correo electrónico inválido.' };
      } else if (error.code === 'auth/network-request-failed') {
        return { error: 'Error de conexión. Verifica tu conexión a internet.' };
      }

      return { error: 'Error enviando email de recuperación.' };
    }
  }

  /**
   * Register a new user using Firebase Auth
   */
  static async registerUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user?: User; error?: string }> {
    try {
      if (!isFirebaseInitialized() || !auth || !firestore) {
        return { error: 'Servicios de Firebase no disponibles.' };
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const firebaseUser = userCredential.user;

      // Create user profile in Firestore
      const fullName = `${userData.firstName.trim()} ${userData.lastName.trim()}`.trim();

      const userProfile = {
        email: userData.email.toLowerCase(),
        name: fullName,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        createdAt: new Date(),
        emailVerified: false
      };

      // Save to Firestore
      await setDoc(doc(firestore, 'users', firebaseUser.uid), userProfile);

      // Create user object for local storage
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: fullName,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim()
      };

      // Store current user locally for quick access
      await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

      return { user };
    } catch (error: any) {
      console.error('Register error:', error);

      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        return { error: 'Ya existe una cuenta con este correo electrónico.' };
      } else if (error.code === 'auth/invalid-email') {
        return { error: 'Correo electrónico inválido.' };
      } else if (error.code === 'auth/weak-password') {
        return { error: 'La contraseña es demasiado débil. Usa al menos 6 caracteres.' };
      } else if (error.code === 'auth/network-request-failed') {
        return { error: 'Error de conexión. Verifica tu conexión a internet.' };
      }

      return { error: 'Error creando la cuenta. Inténtalo de nuevo.' };
    }
  }

  /**
   * Get current logged in user
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      if (!isFirebaseInitialized() || !auth) {
        return null;
      }

      // Try to get from Firebase Auth first
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        // Get additional data from Firestore if needed
        const userDoc = await getDoc(doc(firestore!, 'users', firebaseUser.uid));
        const userData = userDoc.data();

        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: userData?.name || firebaseUser.displayName || '',
          firstName: userData?.firstName,
          lastName: userData?.lastName
        };
      }

      // Fallback to local storage
      const userJson = await AsyncStorage.getItem(this.CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Logout user from Firebase Auth
   */
  static async logout(): Promise<void> {
    try {
      if (isFirebaseInitialized() && auth) {
        await signOut(auth);
      }

      // Clear local storage
      await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if Firebase logout fails
      await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
    }
  }

  /**
   * Check if user is logged in (Firebase Auth)
   */
  static async isLoggedIn(): Promise<boolean> {
    if (!isFirebaseInitialized() || !auth) {
      return false;
    }

    return auth.currentUser !== null;
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      if (!isFirebaseInitialized() || !auth || !firestore) {
        return { success: false, error: 'Servicios no disponibles.' };
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Usuario no autenticado.' };
      }

      // Update in Firestore
      await setDoc(doc(firestore, 'users', currentUser.uid), updates, { merge: true });

      // Update local storage
      const currentUserData = await this.getCurrentUser();
      if (currentUserData) {
        const updatedUser = { ...currentUserData, ...updates };
        await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
      }

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Error actualizando perfil.' };
    }
  }
  static async autoRegisterAfterPayment(userData: {
    email: string;
    firstName: string;
    lastName: string;
    nivelMatricula: string;
  }): Promise<{ user?: User; error?: string; isNewUser?: boolean }> {
    try {
      if (!isFirebaseInitialized() || !auth || !firestore) {
        return { error: 'Servicios de Firebase no disponibles.' };
      }

      // Check if user already exists
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', userData.email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // User exists, update their profile
        const existingUserDoc = querySnapshot.docs[0];

        // Update with new enrollment info
        await updateDoc(existingUserDoc.ref, {
          nivelMatricula: userData.nivelMatricula,
          updatedAt: new Date()
        });

        const user: User = {
          id: existingUserDoc.id,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName
        };

        return { user, isNewUser: false };
      } else {
        // Create new user in Firebase Auth
        const tempPassword = Math.random().toString(36).slice(-12);
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          tempPassword
        );

        const firebaseUser = userCredential.user;

        // Create user profile in Firestore
        const userProfile = {
          email: userData.email.toLowerCase(),
          name: `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          nivelMatricula: userData.nivelMatricula,
          createdAt: new Date(),
          emailVerified: false,
          tempPassword: tempPassword // Store temp password for admin reference
        };

        // Save to Firestore
        await setDoc(doc(firestore, 'users', firebaseUser.uid), userProfile);

        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName
        };

        return { user, isNewUser: true };
      }
    } catch (error: any) {
      console.error('Auto register after payment error:', error);

      if (error.code === 'auth/email-already-in-use') {
        return { error: 'Ya existe una cuenta con este correo electrónico.' };
      } else if (error.code === 'auth/invalid-email') {
        return { error: 'Correo electrónico inválido.' };
      } else if (error.code === 'auth/weak-password') {
        return { error: 'La contraseña es demasiado débil.' };
      }

      return { error: 'Error creando la cuenta. Inténtalo de nuevo.' };
    }
  }
}
