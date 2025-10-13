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

// Middleware para parsear JSON
app.use(express.json());
app.use(cors());

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

    console.log('🔍 Datos recibidos del frontend:', {
      amount,
      currency,
      description,
      tipo,
      level,
      amountType: typeof amount,
      amountValue: amount,
      amountNumber: Number(amount)
    });

    // 🔥 FORZAR DETECCIÓN DE FORMACIÓN PROFESIONAL
    const esFormacionProfesionalForzada = tipo === 'formacion-profesional' ||
                                       (description && (description.toLowerCase().includes('formación profesional') || 
                                                       description.toLowerCase().includes('formacion')));

    console.log('🎯 Tipo de pago detectado:', {
      esFormacionProfesionalForzada,
      tieneLevel: !!level,
      description: description
    });

    // Validación específica para formación profesional: EXACTAMENTE 0.5 euros
    if (esFormacionProfesionalForzada) {
      const amountNumber = Number(amount);
      console.log('🔢 AmountNumber calculado para formación profesional:', amountNumber);

      if (!amount || isNaN(amountNumber) || Math.abs(amountNumber - 0.5) > 0.001) {
        console.error('❌ Validación fallida para formación profesional:', {
          originalAmount: amount,
          amountNumber: amountNumber,
          expectedAmount: 0.5,
          difference: Math.abs(amountNumber - 0.5)
        });
        return res.status(400).json({
          error: 'El monto debe ser EXACTAMENTE 0.50 euros para formación profesional',
          receivedAmount: amount,
          expectedAmount: 0.5
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

    // Determinar el tipo de pago
    const esMatriculaNivel = !!level && !esFormacionProfesionalForzada;
    const esFormacionProfesional = esFormacionProfesionalForzada;

    console.log('📋 Clasificación final:', {
      esMatriculaNivel,
      esFormacionProfesional,
      tipoForzado: esFormacionProfesionalForzada
    });

    // Calcular monto en céntimos para Stripe
    const amountNumber = Number(amount);
    const amountInCents = Math.round(amountNumber * 100);
    console.log(`💰 Conversión: ${amountNumber} ${currency} → ${amountInCents} céntimos`);

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
        ...(esMatriculaNivel && { level }),
        ...(esFormacionProfesional && { tipo: 'formacion-profesional' }),
        ...metadata
      },
      description: esMatriculaNivel
        ? `Matrícula ${level} - Academia de Inmigrantes`
        : description || 'Pago Academia de Inmigrantes',
      automatic_payment_methods: {
        enabled: true
      }
    });

    console.log(`✅ PaymentIntent creado: ${paymentIntent.id}`);
    console.log(`💳 Stripe recibió: ${paymentIntent.amount} céntimos (${paymentIntent.amount / 100} ${paymentIntent.currency})`);

    res.json({
      status: 'success',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount, // Devolver en céntimos como hace Stripe
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      tipo: esMatriculaNivel ? 'matricula' : 'formacion-profesional'
    });
  } catch (error) {
    console.error('❌ Error en create-payment-intent:', error);
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

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
  console.log(`🌍 Entorno: ${NODE_ENV}`);
  console.log(`💳 Clave de Stripe configurada: ${!!process.env.STRIPE_SECRET_KEY}`);
});

// Manejo de errores global
process.on('unhandledRejection', (error) => {
  console.error('⚠️ Error no manejado:', error);
});

// 🚨 El webhook VA ANTES de los middlewares globales
app.post('/api/webhook', 
  // Middleware para obtener el body sin procesar
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    console.log('🔍 Webhook recibido, verificando firma...');
    console.log('📦 Body type:', typeof payload);
    console.log('📦 Body length:', payload ? payload.length : 'undefined');

    if (!sig) {
      console.error('❌ No se encontró la firma de Stripe');
      return res.status(400).send('Webhook Error: No se encontró la firma de Stripe');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log(`✅ Webhook verificado: ${event.type}`);

      // Manejar eventos específicos
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log('💰 Pago exitoso:', paymentIntent.id);
          console.log('💳 Monto:', paymentIntent.amount, paymentIntent.currency);
          // Aquí puedes agregar lógica adicional para manejar pagos exitosos
          break;
          
        case 'payment_intent.payment_failed':
          console.log('❌ Pago fallido:', event.data.object.id);
          break;
          
        default:
          console.log(`🔔 Evento no manejado: ${event.type}`);
      }

      // Devolver una respuesta exitosa a Stripe
      return res.json({ received: true });
      
    } catch (err) {
      console.error(`❌ Error en webhook: ${err.message}`);
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

// 👇 Middlewares globales después del webhook
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

    console.log('🔍 Datos recibidos del frontend:', {
      amount,
      currency,
      description,
      tipo,
      level,
      amountType: typeof amount,
      amountValue: amount,
      amountNumber: Number(amount)
    });

    // 🔥 FORZAR DETECCIÓN DE FORMACIÓN PROFESIONAL
    const esFormacionProfesionalForzada = tipo === 'formacion-profesional' ||
                                         description?.toLowerCase().includes('formación profesional') ||
                                         description?.toLowerCase().includes('formacion');

    console.log('🎯 Tipo de pago detectado:', {
      esFormacionProfesionalForzada,
      tieneLevel: !!level,
      description: description
    });

    // Validación específica para formación profesional: EXACTAMENTE 0.5 euros
    if (esFormacionProfesionalForzada) {
      const amountNumber = Number(amount);
      console.log('🔢 AmountNumber calculado para formación profesional:', amountNumber);

      if (!amount || isNaN(amountNumber) || Math.abs(amountNumber - 0.5) > 0.001) {
        console.error('❌ Validación fallida para formación profesional:', {
          originalAmount: amount,
          amountNumber: amountNumber,
          expectedAmount: 0.5,
          difference: Math.abs(amountNumber - 0.5)
        });
        return res.status(400).json({
          error: 'El monto debe ser EXACTAMENTE 0.50 euros para formación profesional',
          receivedAmount: amount,
          expectedAmount: 0.5
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

    // Determinar el tipo de pago
    const esMatriculaNivel = !!level && !esFormacionProfesionalForzada;
    const esFormacionProfesional = esFormacionProfesionalForzada;

    console.log('📋 Clasificación final:', {
      esMatriculaNivel,
      esFormacionProfesional,
      tipoForzado: esFormacionProfesionalForzada
    });

    // Calcular monto en céntimos para Stripe
    const amountNumber = Number(amount);
    const amountInCents = Math.round(amountNumber * 100);
    console.log(`💰 Conversión: ${amountNumber} ${currency} → ${amountInCents} céntimos`);

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
        ...(esMatriculaNivel && { level }),
        ...(esFormacionProfesional && { tipo: 'formacion-profesional' }),
        ...metadata
      },
      description: esMatriculaNivel
        ? `Matrícula ${level} - Academia de Inmigrantes`
        : description || 'Pago Academia de Inmigrantes',
      automatic_payment_methods: {
        enabled: true
      }
    });

    console.log(`✅ PaymentIntent creado: ${paymentIntent.id}`);
    console.log(`💳 Stripe recibió: ${paymentIntent.amount} céntimos (${paymentIntent.amount / 100} ${paymentIntent.currency})`);

    res.json({
      status: 'success',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount, // Devolver en céntimos como hace Stripe
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      tipo: esMatriculaNivel ? 'matricula' : 'formacion-profesional'
    });

  } catch (error) {
    console.error('❌ Error al crear el Payment Intent:', error);
    res.status(500).json({
      error: error.message || 'Error al procesar el pago',
    });
  }
});

// Ruta de prueba para diagnosticar problemas de conexión
app.post('/api/test-connection', async (req, res) => {
  try {
    console.log('🔍 Test connection endpoint llamado');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🌐 Headers:', req.headers);
    console.log('📦 Body recibido:', req.body);
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    console.log('💳 STRIPE_SECRET_KEY configurada:', !!process.env.STRIPE_SECRET_KEY);
    
    res.status(200).json({
      status: 'success',
      message: 'Test endpoint funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      receivedHeaders: req.headers,
      receivedBody: req.body,
      stripeConfigured: !!process.env.STRIPE_SECRET_KEY
    });
  } catch (error) {
    console.error('❌ Error en test endpoint:', error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  console.error(`❌ [${errorId}] Error en ${req.method} ${req.path}:`, {
    message: err.message,
    stack: err.stack,
    originalUrl: req.originalUrl,
    body: req.body,
    query: req.query,
    params: req.params
  });

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Error interno del servidor',
    errorId,
    timestamp: new Date().toISOString(),
    ...(NODE_ENV === 'development' && {
      stack: err.stack,
      path: req.path,
      method: req.method
    })
  });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(80));
  console.log(`🚀 Servidor ${NODE_ENV} iniciado correctamente`);
  console.log('='.repeat(80));
  console.log('📅', new Date().toLocaleString());
  console.log('💻 Plataforma:', process.platform, process.arch);
  console.log('📦 Node.js:', process.version);
  console.log('🏠 Directorio:', process.cwd());
  console.log('🌍 URL:', `http://localhost:${PORT}`);
  console.log('\n🔧 Variables de entorno:');
  console.log(`   - NODE_ENV: ${NODE_ENV}`);
  console.log(`   - PORT: ${PORT}`);
  console.log(`   - STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✅ Configurada' : '❌ No configurada'}`);
  console.log('\n📡 Endpoints disponibles:');
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
