require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');

const app = express();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Webhook de Stripe - DEBE estar antes de cualquier otro middleware que procese el body
app.post('/api/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    console.log('🔔 Webhook recibido');
    
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    try {
      // Validar que venga la firma
      if (!sig) {
        console.error('❌ No se encontró la firma de Stripe');
        return res.status(400).send('Webhook Error: No se encontró la firma de Stripe');
      }

      // Verificar el evento con Stripe
      const event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log(`✅ Webhook verificado: ${event.type}`);

      // Manejar el evento
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log('✅ Pago exitoso:', paymentIntent.id);
          console.log('📝 Metadata:', paymentIntent.metadata);
          // Aquí va la lógica para desbloquear el curso
          // Ejemplo: actualizar base de datos, enviar email, etc.
          break;
          
        case 'payment_intent.payment_failed':
          const failedIntent = event.data.object;
          console.error('❌ Pago fallido:', failedIntent.id);
          // Manejar pago fallido
          break;
          
        default:
          console.log(`⚠️  Evento no manejado: ${event.type}`);
      }

      res.json({ received: true });
      
    } catch (err) {
      console.error('❌ Error en webhook:', err.message);
      console.error('🔍 Debug info:', {
        bodyType: typeof payload,
        bodyLength: payload ? payload.length : 'undefined',
        hasSignature: !!sig,
        signaturePrefix: sig ? sig.substring(0, 10) + '...' : 'no signature'
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// Middleware para CORS y JSON (después del webhook)
app.use(cors());
app.use(express.json());

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY
  });
});

// Ruta para crear un Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'eur', metadata = {}, level, description, tipo } = req.body;

    console.log(' Datos recibidos del frontend:', {
      amount,
      currency,
      description,
      tipo,
      level,
      amountType: typeof amount,
      amountValue: amount,
      amountNumber: Number(amount)
    });

    // DETECCIÓN DE FORMACIÓN PROFESIONAL
    const esFormacionProfesional = tipo === 'formacion-profesional' ||
                                 (description && (description.toLowerCase().includes('formación profesional') || 
                                                 description.toLowerCase().includes('formacion')));

    console.log(' Tipo de pago detectado:', {
      esFormacionProfesional,
      tieneLevel: !!level,
      description: description
    });

    // Validación específica para formación profesional: EXACTAMENTE 10.00 euros
    if (esFormacionProfesional) {
      const amountNumber = Number(amount);
      console.log(' AmountNumber calculado para formación profesional:', amountNumber);

      if (!amount || isNaN(amountNumber) || Math.abs(amountNumber - 10.00) > 0.001) {
        console.error(' Validación fallida para formación profesional:', {
          originalAmount: amount,
          amountNumber: amountNumber,
          expectedAmount: 10.00,
          difference: Math.abs(amountNumber - 10.00)
        });
        return res.status(400).json({
          error: 'El monto debe ser EXACTAMENTE 10.00 euros para formación profesional',
          receivedAmount: amount,
          expectedAmount: 10.00
        });
      }
    } else {
      // Validación normal para otros tipos de pago
      const amountNumber = Number(amount);
      if (!amount || isNaN(amountNumber) || amountNumber < 0.5) {
        return res.status(400).json({
          error: 'El monto debe ser un número mayor o igual a 0.50 euros',
          receivedAmount: amount,
          expectedMinimum: 0.5
        });
      }
    }

    // Calcular monto en céntimos para Stripe
    const amountInCents = Math.round(Number(amount) * 100);
    console.log(` Conversión: ${amount} ${currency} → ${amountInCents} céntimos`);

    // Crear el Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // Stripe espera céntimos
      currency,
      metadata: {
        app: 'academia-inmigrantes',
        environment: NODE_ENV,
        descripcion: description || 'Pago Academia de Inmigrantes',
        bloque: req.body.bloque || 'general',
        returnUrl: req.body.returnUrl || 'academiadeinmigrantes://stripe-redirect',
        ...(level && { level }),
        ...(esFormacionProfesional && { tipo: 'formacion-profesional' }),
        ...metadata
      },
      description: level
        ? `Matrícula ${level} - Academia de Inmigrantes`
        : description || 'Pago Academia de Inmigrantes',
      automatic_payment_methods: {
        enabled: true
      }
    });

    console.log(` PaymentIntent creado: ${paymentIntent.id}`);
    console.log(` Stripe recibió: ${paymentIntent.amount} céntimos (${paymentIntent.amount / 100} ${paymentIntent.currency})`);

    res.json({
      status: 'success',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      tipo: level ? 'matricula' : 'formacion-profesional'
    });
  } catch (error) {
    console.error(' Error en create-payment-intent:', error);
    res.status(500).json({
      error: 'Error al crear el intento de pago',
      details: error.message
    });
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡API de pagos de Academia de Inmigrantes funcionando!');
});

// Manejo de errores global
process.on('unhandledRejection', (error) => {
  console.error(' Error no manejado:', error);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(80));
  console.log(` Servidor escuchando en el puerto ${PORT}`);
  console.log(` Entorno: ${NODE_ENV}`);
  console.log(` Clave de Stripe configurada: ${!!process.env.STRIPE_SECRET_KEY}`);
  console.log(' ', new Date().toLocaleString());
  console.log(' Plataforma:', process.platform, process.arch);
  console.log(' Node.js:', process.version);
  console.log(' Directorio:', process.cwd());
  console.log(' URL:', `http://localhost:${PORT}`);
  console.log('\n Variables de entorno:');
  console.log(`   - NODE_ENV: ${NODE_ENV}`);
  console.log(`   - PORT: ${PORT}`);
  console.log(`   - STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? ' Configurada' : ' No configurada'}`);
  console.log('\n Endpoints disponibles:');
  console.log(`   - GET    /`);
  console.log(`   - GET    /api/health`);
  console.log(`   - POST   /api/create-payment-intent`);
  console.log('='.repeat(80) + '\n');
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('🔥 Error no capturado:', error);
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Promesa rechazada no manejada en:', promise, 'Motivo:', reason);
});

// Manejo de cierre de la aplicación
process.on('SIGTERM', () => {
  console.log('Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
  });
});
