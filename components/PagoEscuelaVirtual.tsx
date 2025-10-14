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

interface PagoEscuelaVirtualProps {
  onPagoExitoso: (infoPago: any) => void;
  onCancelar: () => void;
  formData?: any;
  level?: 'A1A2' | 'B1B2';
}

export default function PagoEscuelaVirtual({ onPagoExitoso, onCancelar, formData, level }: PagoEscuelaVirtualProps) {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  // Precio según nivel
  const precio = level === 'A1A2' ? 20.00 : 30.00;

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
          amount: precio,
          currency: 'eur',
          tipo: 'escuela-virtual',
          level: level,
          fecha: new Date().toISOString()
        });
        Alert.alert(
          '¡Pago Exitoso!',
          'Tu pago se ha procesado correctamente. Ya puedes acceder a la Escuela Virtual.',
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
      const montoEuros = precio;
      const requestBody = {
        amount: montoEuros,
        currency: 'eur',
        description: `Acceso Escuela Virtual nivel ${level}`,
        tipo: 'escuela-virtual',
        formData
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
        merchantDisplayName: 'Escuela Virtual - Academia de Inmigrantes',
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

      // Pago exitoso
      await verificarEstadoPago(paymentIntentId);

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
        <Text style={styles.successText}>Tu acceso a la Escuela Virtual ha sido activado.</Text>
        <Text style={styles.amountText}>{precio.toFixed(2).replace('.', ',')} €</Text>
        <Text style={styles.referenceText}>Estado: Completado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Confirmar Acceso a Escuela Virtual</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Producto:</Text>
          <Text style={styles.detailValue}>Acceso Mensual a Escuela Virtual - Nivel {level}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Precio:</Text>
          <Text style={[styles.detailValue, styles.priceText]}>{precio.toFixed(2).replace('.', ',')} €</Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Incluye:</Text>
          <View style={styles.benefitItem}>
            <MaterialIcons name="check-circle" size={18} color="#4CAF50" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Acceso ilimitado a todos los cursos</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialIcons name="check-circle" size={18} color="#4CAF50" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Contenido actualizado mensualmente</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialIcons name="check-circle" size={18} color="#4CAF50" style={styles.benefitIcon} />
            <Text style={styles.benefitText}>Soporte prioritario</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.payButton,
            (loading || paymentStatus === 'processing') && styles.payButtonDisabled
          ]}
          onPress={manejarPago}
          disabled={loading || paymentStatus === 'processing'}
        >
          {loading || paymentStatus === 'processing' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.buttonContent}>
              <MaterialIcons name="payment" size={24} color="white" />
              <Text style={styles.payButtonText}>Pagar {precio.toFixed(2).replace('.', ',')} €</Text>
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

      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={onCancelar}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 12,
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
    color: '#2196F3',
    fontWeight: 'bold',
  },
  benefitsContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#555',
  },
  payButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  payButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginBottom: 5,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#4CAF50',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  amountText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 5,
  },
  referenceText: {
    fontSize: 14,
    color: '#666',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  errorText: {
    color: '#d32f2f',
    marginLeft: 8,
    flex: 1,
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
