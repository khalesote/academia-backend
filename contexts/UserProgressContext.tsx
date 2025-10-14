import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LevelProgress = {
  unlocked: boolean;
  examPassed: boolean;
};

type UserProgress = {
  A1: LevelProgress;
  A2: LevelProgress;
  B1: LevelProgress;
  B2: LevelProgress;
};

type UserProgressContextType = {
  progress: UserProgress;
  unlockLevel: (level: 'A1' | 'A2' | 'B1' | 'B2') => Promise<void>;
  passExam: (level: 'A1' | 'B1') => Promise<void>;
  isLoading: boolean;
};

const defaultProgress: UserProgress = {
  A1: { unlocked: false, examPassed: false },
  A2: { unlocked: false, examPassed: false },
  B1: { unlocked: false, examPassed: false },
  B2: { unlocked: false, examPassed: false },
};

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export const UserProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<UserProgress>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar progreso guardado al iniciar
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem('userProgress');
        if (savedProgress) {
          // Solo actualizar si hay cambios para evitar re-renderizados innecesarios
          const parsedProgress = JSON.parse(savedProgress);
          setProgress(prevProgress => 
            JSON.stringify(prevProgress) === JSON.stringify(parsedProgress) 
              ? prevProgress 
              : parsedProgress
          );
        }
      } catch (error) {
        console.error('Error al cargar el progreso:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [setProgress]); // Agregar setProgress a las dependencias

  // Guardar progreso cuando cambia
  useEffect(() => {
    if (!isLoading) {
      const saveProgress = async () => {
        try {
          await AsyncStorage.setItem('userProgress', JSON.stringify(progress));
        } catch (error) {
          console.error('Error al guardar el progreso:', error);
        }
      };

      saveProgress();
    }
  }, [progress, isLoading]);

  const unlockLevel = async (level: 'A1' | 'A2' | 'B1' | 'B2') => {
    setProgress(prev => ({
      ...prev,
      [level]: { ...prev[level], unlocked: true }
    }));
  };

  const passExam = async (level: 'A1' | 'B1') => {
    const nextLevel = level === 'A1' ? 'A2' : 'B2';
    
    setProgress(prev => ({
      ...prev,
      [level]: { ...prev[level], examPassed: true },
      [nextLevel]: { ...prev[nextLevel], unlocked: true } // Desbloquear siguiente nivel
    }));
  };

  return (
    <UserProgressContext.Provider value={{ progress, unlockLevel, passExam, isLoading }}>
      {!isLoading ? children : null}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (context === undefined) {
    throw new Error('useUserProgress debe usarse dentro de un UserProgressProvider');
  }
  return context;
};
