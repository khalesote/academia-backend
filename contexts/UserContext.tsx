import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as FirebaseUser } from 'firebase/auth';
import { UserService, UserProfile } from '../services/userService';
import { auth } from '../config/firebase';

interface UserContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  profileImage: string | null;
  updateProfileImage: (imageUri: string) => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshUser: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando carga de datos del usuario...');

      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
        console.log('🔐 Estado de autenticación cambiado:', firebaseUser ? 'Usuario autenticado' : 'Usuario no autenticado');

        if (firebaseUser) {
          console.log('👤 Usuario Firebase:', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
          });

          setFirebaseUser(firebaseUser);
          setIsAuthenticated(true);

          console.log('🔍 Buscando perfil en Firestore con UID:', firebaseUser.uid);
          const userProfile = await UserService.getUserProfile(firebaseUser.uid);

          if (userProfile) {
            console.log('✅ Perfil encontrado:', {
              email: userProfile.email,
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              matriculado_escuela_virtual: userProfile.matriculado_escuela_virtual,
              createdAt: userProfile.createdAt
            });
            setUser(userProfile);
          } else {
            console.log('❌ No se encontró perfil en Firestore');
            console.log('💡 Posibles causas:');
            console.log('   - El documento no existe en la colección "users"');
            console.log('   - Problemas de permisos de lectura');
            console.log('   - Error de conexión con Firebase');
          }

          const savedImage = await AsyncStorage.getItem('@profile_image');
          if (savedImage) {
            console.log('🖼️ Imagen de perfil encontrada en almacenamiento local');
            setProfileImage(savedImage);
          } else if (userProfile?.profileImage) {
            console.log('🖼️ Usando imagen de perfil desde Firestore');
            setProfileImage(userProfile.profileImage);
          } else {
            console.log('🖼️ No hay imagen de perfil disponible');
          }
        } else {
          console.log('🚪 Usuario no autenticado, limpiando datos...');
          setFirebaseUser(null);
          setUser(null);
          setIsAuthenticated(false);
          setProfileImage(null);
        }

        setLoading(false);
        console.log('✅ Carga de datos del usuario completada');
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error crítico al cargar datos del usuario:', error);
      setLoading(false);
      setFirebaseUser(null);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  };

  const updateProfileImage = async (imageUri: string) => {
    try {
      if (!firebaseUser) {
        throw new Error('Usuario no autenticado');
      }

      await AsyncStorage.setItem('@profile_image', imageUri);
      setProfileImage(imageUri);

      const firebaseUrl = await UserService.uploadProfileImage(firebaseUser.uid, imageUri);
      if (firebaseUrl) {
        setProfileImage(firebaseUrl);
      }
    } catch (error) {
      console.error('Error al actualizar la imagen de perfil:', error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (!firebaseUser) {
        console.error('No se puede actualizar: usuario no autenticado');
        return false;
      }

      const success = await UserService.updateUserProfile(firebaseUser.uid, updates);
      if (success) {
        await refreshUser();
      }
      return success;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return false;
    }
  };

  const refreshUser = async () => {
    try {
      if (firebaseUser) {
        console.log('🔄 UserContext: Refrescando datos del usuario...');
        const userProfile = await UserService.getUserProfile(firebaseUser.uid);
        if (userProfile) {
          console.log('✅ UserContext: Datos del usuario refrescados:', {
            matriculado_escuela_virtual: userProfile.matriculado_escuela_virtual,
            email: userProfile.email
          });
          setUser(userProfile);
          return userProfile;
        } else {
          console.log('❌ UserContext: No se pudieron refrescar los datos del usuario');
        }
      } else {
        console.log('⚠️ UserContext: No hay usuario Firebase autenticado para refrescar');
      }
    } catch (error) {
      console.error('❌ UserContext: Error al refrescar usuario:', error);
    }
    return null;
  };

  const logout = async () => {
    try {
      await UserService.logoutUser();
      setFirebaseUser(null);
      setUser(null);
      setIsAuthenticated(false);
      setProfileImage(null);

      await AsyncStorage.removeItem('@profile_image');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('🔄 UserContext: Inicializando listener de autenticación...');
    const unsubscribe = loadUserData();
    console.log('✅ UserContext: Listener de autenticación inicializado');

    return () => {
      console.log('🛑 UserContext: Limpiando listener de autenticación...');
      unsubscribe?.then(unsub => unsub?.());
    };
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      firebaseUser,
      loading,
      profileImage,
      updateProfileImage,
      updateUser,
      refreshUser,
      logout,
      isAuthenticated
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe usarse dentro de un UserProvider');
  }
  return context;
};
