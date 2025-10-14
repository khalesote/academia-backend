import React from 'react';
import { View, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import SchoolScreen from './(tabs)/SchoolScreen';
import MatriculaScreen from './(tabs)/MatriculaScreen';
import FormularioDatosPersonales from './(tabs)/FormularioDatosPersonales';
import ConfirmacionPagoScreen from './(tabs)/ConfirmacionPagoScreen';
import PagoFormacionScreen from './(tabs)/PagoFormacionScreen';
import CuentosPopularesScreen from './(tabs)/CuentosPopularesScreen';
import AgendaScreen from './AgendaScreen';
// import B2AvanzadoScreen from './(tabs)/B2_AvanzadoScreen';

export type RootStackParamList = {
  School: undefined;
  MatriculaScreen: undefined;
  FormularioDatosPersonales: undefined;
  PagoFormacionScreen: undefined;
  CuentosPopularesScreen: undefined;
  ConfirmacionPagoScreen: undefined;
  A1_Acceso: undefined;
  A2_Plataforma: undefined;
  B1_Umbral: undefined;
  B2_Avanzado: undefined;
  AgendaScreen: undefined;
  ForgotPassword: undefined;
  // Agrega aquí otras pantallas según las necesites
};

import ForgotPasswordScreen from '../ForgotPasswordScreen';
const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="School" component={SchoolScreen} options={{ title: 'Inicio' }} />
      <Stack.Screen name="MatriculaScreen" component={MatriculaScreen} options={{ title: 'Matrícula' }} />
      <Stack.Screen name="FormularioDatosPersonales" component={FormularioDatosPersonales} options={{ title: 'Datos Personales' }} />
      <Stack.Screen name="PagoFormacionScreen" component={PagoFormacionScreen} options={{ title: 'Pago Formación Profesional' }} />
      <Stack.Screen name="CuentosPopularesScreen" component={CuentosPopularesScreen} options={{ title: 'Cuentos Populares' }} />
      <Stack.Screen name="ConfirmacionPagoScreen" component={ConfirmacionPagoScreen} options={{ title: 'Confirmación de Pago' }} />
      {/* Pantalla A1 Acceso */}
      <Stack.Screen name="A1_Acceso" component={() => <View><Text>Pantalla A1 Acceso (placeholder)</Text></View>} options={{ title: 'A1 Acceso' }} />
      {/* Pantalla B2 Avanzado */}
      <Stack.Screen
        name="B2_Avanzado"
        component={require('app/(tabs)/B2_Avanzado').default}
        options={{
          title: 'B2 Avanzado',
          headerShown: false
        }}
      />
      <Stack.Screen name="AgendaScreen" component={AgendaScreen} options={{ title: 'Agenda de Contactos' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar Contraseña' }} />
    </Stack.Navigator>
  );
}
