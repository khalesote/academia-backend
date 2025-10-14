import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

interface PagoFormacionProfesionalProps {
  onPagoExitoso: (infoPago: any) => void;
  onCancelar: () => void;
  formData?: any;
}

export default function PagoFormacionProfesional({ onPagoExitoso, onCancelar, formData }: PagoFormacionProfesionalProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // Verificar el estado del pago después de volver de la pasarela de pago
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const url = await Linking.getInitialURL();
      if (url?.includes('payment_intent')) {
        const paymentIntentId = url.split('payment_intent=')[1].split('&')[0];
        if (paymentIntentId) {
          verificarEstadoPago(paymentIntentId);
        }
      }
    };
    checkPaymentStatus();
  }, []);

  const verificarEstadoPago = async (paymentIntentId: string) => {
    try {
      setPaymentStatus('processing');
      const response = await fetch(`https://academia-backend-s9np.onrender.com/api/verificar-pago/${paymentIntentId}`);
      const data = await response.json();

      if (data.status === 'succeeded') {
        setPagoExitoso(true);
        setPaymentStatus('success');
        onPagoExitoso({
          paymentIntentId,
          amount: 10.00,
          currency: 'eur',
          tipo: 'formacion-profesional',
          fecha: new Date().toISOString(),
        });
        Alert.alert(
          '¡Pago Exitoso!',
          'Tu pago se ha procesado correctamente. El curso ha sido desbloqueado.',
          [{ text: 'Aceptar' }]
        );
      } else {
        setPaymentStatus('error');
        Alert.alert(
          'Pendiente de confirmación',
          'Estamos verificando tu pago. Recibirás una notificación cuando se complete la transacción.',
          [{ text: 'Entendido' }]
        );
      }
    } catch (error) {
      console.error('Error verificando pago:', error);
      setPaymentStatus('error');
      Alert.alert(
        'Error',
        'Hubo un problema al verificar el estado de tu pago. Por favor, verifica más tarde en tu perfil.',
        [{ text: 'Aceptar' }]
      );
    }
  };

  const manejarPago = async () => {
    try {
      setLoading(true);
      setPaymentStatus('processing');

      const montoEuros = 10.00;
      const requestBody = {
        amount: montoEuros,
        currency: 'eur',
        description: 'Formación Profesional',
        tipo: 'formacion-profesional',
        formData,
      };

      const response = await fetch('https://academia-backend-s9np.onrender.com/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Error del servidor: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const { clientSecret, paymentIntentId } = await response.json();

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Academia de Inmigrantes',
        returnURL: 'academiadeinmigrantes://stripe-redirect',
      });

      if (initError) {
        throw initError;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== 'Canceled') {
          throw presentError;
        }
        return;
      }

      // Si llegamos aquí, el pago fue exitoso
      verificarEstadoPago(paymentIntentId);

    } catch (error) {
      console.error('Error en el proceso de pago:', error);
      setPaymentStatus('error');
      Alert.alert(
        'Error en el pago',
        error instanceof Error ? error.message : 'No se pudo procesar el pago. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (pagoExitoso) {
    return (
      <View style={styles.successContainer}>
        <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
        <Text style={styles.successTitle}>¡Pago Completado!</Text>
        <Text style={styles.successText}>Tu acceso a los cursos de Formación Profesional ha sido activado correctamente.</Text>
        <Text style={styles.amountText}>10,00 €</Text>
        <Text style={styles.referenceText}>Estado: Completado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Confirmar Pago - Formación Profesional</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Curso:</Text>
          <Text style={styles.detailValue}>Formación Profesional</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Precio:</Text>
          <Text style={[styles.detailValue, styles.priceText]}>10,00 €</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.payButton,
            (loading || paymentStatus === 'processing') && styles.payButtonDisabled,
          ]}
          onPress={manejarPago}
          disabled={loading || paymentStatus === 'processing'}
        >
          {loading || paymentStatus === 'processing' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <MaterialIcons name="payment" size={24} color="white" />
              <Text style={styles.payButtonText}>Pagar 10,00 € - Formación Profesional</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.securityText}>
          <MaterialIcons name="security" size={16} color="#4CAF50" /> Pago seguro con Stripe
        </Text>
      </View>

      {paymentStatus === 'error' && (
        <View style={styles.errorBox}>
          <MaterialIcons name="error" size={20} color="#d32f2f" />
          <Text style={styles.errorText}>Hubo un error al procesar el pago. Intenta de nuevo.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  payButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    textAlign: 'center',
    marginTop: 15,
    color: '#666',
    fontSize: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    marginTop: 20,
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    marginLeft: 10,
    flex: 1,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#2e7d32',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginTop: 10,
    marginBottom: 20,
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 10,
  },
  referenceText: {
    fontSize: 14,
    color: '#777',
    marginTop: 20,
  },
});
