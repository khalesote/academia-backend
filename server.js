import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const app = express();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// 🚨 El webhook VA ANTES de los middlewares globales
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
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

    // Manejar el evento de pago exitoso
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      console.log('💰 Pago exitoso:', paymentIntent.id);
      console.log('💳 Monto:', paymentIntent.amount, paymentIntent.currency);
      // Aquí puedes agregar lógica adicional para manejar pagos exitosos
    }

    // Devolver una respuesta exitosa a Stripe
    return res.json({ received: true, eventType: event.type });
    
  } catch (err) {
    console.error(`❌ Error de verificación de webhook: ${err.message}`);
    console.error('🔍 Debug info:', {
      bodyType: typeof payload,
      bodyLength: payload ? payload.length : 'undefined',
      hasSignature: !!sig,
      signaturePrefix: sig ? sig.substring(0, 10) + '...' : 'no signature',
      error: err
    });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// 👇 Solo después agregas estos middlewares globales
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
    const { amount, currency = 'eur', metadata = {}, level, description } = req.body;

    // Validar monto
    if (!amount || isNaN(amount) || amount < 50) {
      return res.status(400).json({
        error: 'El monto debe ser un número mayor a 50 céntimos',
      });
    }

    // Determinar el tipo de pago
    const esMatriculaNivel = !!level;
    const esFormacionProfesional = !level && description?.includes('formación');

    // Configuración del pago
    // Crear el Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a céntimos
      currency,
      metadata: {
        app: 'academia-inmigrantes',
        environment: NODE_ENV || 'production',
        descripcion: req.body.descripcion || 'Pago Academia de Inmigrantes',
        bloque: req.body.bloque || 'general',
        returnUrl: req.body.returnUrl || 'academiainmigrantes://stripe-redirect',
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

    res.json({
      status: 'success',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
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
    
    // Responder con un mensaje de éxito (solo una respuesta)
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
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
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
