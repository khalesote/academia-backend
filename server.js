import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

// Configuración inicial
const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validar variable de entorno
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ ERROR: STRIPE_SECRET_KEY no está definida en las variables de entorno');
  process.exit(1);
}

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Middleware de logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Ruta de inicio
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API de Pagos - Academia de Inmigrantes',
    version: '1.0.0',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Configuración de webhook
app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`❌ Error de verificación de webhook: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ Pago exitoso:', paymentIntent.id);
      // Aquí puedes actualizar tu base de datos
      break;
    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      console.error('❌ Pago fallido:', failedIntent.id);
      // Manejar pago fallido
      break;
    // Puedes manejar más eventos según sea necesario
    default:
      console.log(`🔔 Evento no manejado: ${event.type}`);
  }

  // Devolver una respuesta exitosa
  res.json({received: true});
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
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a céntimos
      currency,
      payment_method_types: ['card'],
      metadata: {
        app: 'academia-inmigrantes',
        environment: NODE_ENV,
        ...(esMatriculaNivel && { level }),
        ...(esFormacionProfesional && { tipo: 'formacion-profesional' }),
        ...metadata
      },
      description: esMatriculaNivel 
        ? `Matrícula ${level} - Academia de Inmigrantes`
        : description || 'Pago Academia de Inmigrantes',
      automatic_payment_methods: {
        enabled: true,
      },
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

// Ruta de verificación de estado
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
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
