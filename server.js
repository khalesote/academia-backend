require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const vision = require('@google-cloud/vision');
const Tesseract = require('tesseract.js');
const admin = require('firebase-admin');
const { Expo } = require('expo-server-sdk');

const app = express();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const FORMACION_PRICE_EUR = parseFloat(process.env.FORMACION_PRICE_EUR || '10');
const DAILY_API_KEY = process.env.DAILY_API_KEY || '';
const DAILY_ROOM_DOMAIN = process.env.DAILY_ROOM_DOMAIN || '';
const DAILY_API_BASE = process.env.DAILY_API_BASE || 'https://api.daily.co/v1';
const DAILY_TOKEN_TTL_SECONDS = parseInt(process.env.DAILY_TOKEN_TTL_SECONDS || '3600', 10);

// Configurar SMTP2GO con nodemailer
let transporter;
if (process.env.SMTP2GO_USERNAME && process.env.SMTP2GO_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 2525,
    secure: false,
    auth: {
      user: process.env.SMTP2GO_USERNAME,
      pass: process.env.SMTP2GO_PASSWORD,
    },
  });
  console.log('✅ Credenciales de SMTP2GO configuradas');
} else {
  console.log('⚠️ Credenciales de SMTP2GO no configuradas');
}

// SMTP2GO: el remitente (From) debe estar verificado en Sending > Verified Senders
const getMailFrom = () => {
  if (process.env.SMTP2GO_FROM) return process.env.SMTP2GO_FROM;
  if (process.env.SMTP2GO_VERIFIED_SENDER) return process.env.SMTP2GO_VERIFIED_SENDER;
  const user = String(process.env.SMTP2GO_USERNAME || '').trim();
  if (user.includes('@')) return user;
  return 'admin@academiadeinmigrantes.es';
};

const getMailTo = () =>
  process.env.SMTP2GO_TO || process.env.ADMIN_EMAIL || 'admin@academiadeinmigrantes.es';

const formatMailFrom = () => {
  const addr = getMailFrom();
  return `"Academia de Inmigrantes" <${addr}>`;
};

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Google Vision + Firebase Admin setup
let visionClient = null;
let firestore = null;
let storageBucket = null;

const getServiceAccount = () => {
  const raw = process.env.VISION_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error('❌ JSON de servicio inválido:', error);
    return null;
  }
};

const initGoogleClients = () => {
  if (visionClient) {
    return;
  }
  const serviceAccount = getServiceAccount();
  if (!serviceAccount) {
    console.warn('⚠️ VISION_SERVICE_ACCOUNT_JSON no configurado');
    return;
  }

  visionClient = new vision.ImageAnnotatorClient({
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
    projectId: serviceAccount.project_id,
  });

  const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
  if (!admin.apps.length) {
    const firebaseOptions = {
      credential: admin.credential.cert(serviceAccount),
    };
    if (bucketName) {
      firebaseOptions.storageBucket = bucketName;
    } else {
      console.warn('⚠️ FIREBASE_STORAGE_BUCKET no configurado, se omite subida de imágenes.');
    }
    admin.initializeApp(firebaseOptions);
  }
  firestore = admin.firestore();
  storageBucket = bucketName ? admin.storage().bucket(bucketName) : null;
};

// Expo Push Notifications
const expo = new Expo();

const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.log(`⚠️ Token no válido: ${pushToken}`);
    return null;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    console.log('✅ Push notification enviada:', ticket);
    return ticket;
  } catch (error) {
    console.error('❌ Error enviando push notification:', error);
    return null;
  }
};

const sendPushToUser = async (userId, title, body, data = {}) => {
  if (!firestore) {
    console.log('⚠️ Firestore no inicializado');
    return;
  }

  try {
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.log(`⚠️ Usuario ${userId} no encontrado`);
      return;
    }

    const userData = userDoc.data();
    const pushToken = userData.pushToken;
    
    if (pushToken) {
      await sendPushNotification(pushToken, title, body, data);
    }
  } catch (error) {
    console.error('❌ Error obteniendo push token del usuario:', error);
  }
};

// Listener para nuevas notificaciones (se activa cuando se inicializa Firestore)
let notificationListenerActive = false;

const startNotificationListener = () => {
  if (notificationListenerActive || !firestore) return;
  
  notificationListenerActive = true;
  console.log('📡 Iniciando listener de notificaciones...');

  firestore.collection('notifications')
    .where('read', '==', false)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const notif = change.doc.data();
          const toUserId = notif.toUserId;
          
          let title = 'Nueva notificación';
          let body = notif.message || '';
          
          switch (notif.type) {
            case 'private_chat_request':
              title = '💬 Solicitud de chat';
              body = `${notif.fromUserName} quiere chatear contigo`;
              break;
            case 'new_message':
              title = '✉️ Nuevo mensaje';
              body = `${notif.fromUserName}: ${notif.message}`;
              break;
            case 'chat_accepted':
              title = '✅ Chat aceptado';
              body = notif.message;
              break;
            case 'chat_rejected':
              title = '❌ Chat rechazado';
              body = notif.message;
              break;
          }

          await sendPushToUser(toUserId, title, body, {
            type: notif.type,
            chatId: notif.chatId,
            fromUserId: notif.fromUserId,
          });
        }
      });
    }, (error) => {
      console.error('❌ Error en listener de notificaciones:', error);
      notificationListenerActive = false;
    });
};

const dailyHeaders = () => ({
  Authorization: `Bearer ${DAILY_API_KEY}`,
  'Content-Type': 'application/json',
});

const ensureDailyRoomExists = async (roomName) => {
  const roomResponse = await fetch(`${DAILY_API_BASE}/rooms/${encodeURIComponent(roomName)}`, {
    headers: dailyHeaders(),
  });

  if (roomResponse.ok) {
    return;
  }

  if (roomResponse.status !== 404) {
    const errorText = await roomResponse.text();
    throw new Error(`Daily room lookup failed: ${roomResponse.status} ${errorText}`);
  }

  const createResponse = await fetch(`${DAILY_API_BASE}/rooms`, {
    method: 'POST',
    headers: dailyHeaders(),
    body: JSON.stringify({
      name: roomName,
      privacy: 'public',
      properties: {
        enable_chat: false,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
    }),
  });

  if (!createResponse.ok && createResponse.status !== 409) {
    const errorText = await createResponse.text();
    throw new Error(`Daily room create failed: ${createResponse.status} ${errorText}`);
  }
};

// ============================================
// ENDPOINTS DAILY VOICE CHAT
// ============================================
app.post('/api/voice/token', async (req, res) => {
  const { roomName, userName, userId } = req.body || {};

  if (!DAILY_API_KEY) {
    return res.status(500).json({ error: 'Daily API key no configurada' });
  }

  if (!roomName || !userName || !userId) {
    return res.status(400).json({ error: 'roomName, userName y userId son obligatorios' });
  }

  try {
    await ensureDailyRoomExists(roomName);

    const tokenResponse = await fetch(`${DAILY_API_BASE}/meeting-tokens`, {
      method: 'POST',
      headers: dailyHeaders(),
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName,
          user_id: userId,
          exp: Math.floor(Date.now() / 1000) + DAILY_TOKEN_TTL_SECONDS,
        },
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Daily token error:', tokenResponse.status, errorText);
      return res.status(500).json({ error: 'No se pudo generar el token de Daily' });
    }

    const tokenData = await tokenResponse.json();
    const roomUrl = DAILY_ROOM_DOMAIN ? `https://${DAILY_ROOM_DOMAIN}/${roomName}` : undefined;

    return res.json({
      token: tokenData.token,
      expiresAt: tokenData.exp,
      roomUrl,
    });
  } catch (error) {
    console.error('Daily token endpoint error:', error);
    return res.status(500).json({ error: 'Error generando el token de voz' });
  }
});

// Endpoint para solicitar matrícula presencial
app.post('/api/solicitar-matricula-presencial', async (req, res) => {
  try {
    console.log('📧 Iniciando solicitud de matrícula presencial...');
    const { nombre, email, telefono, nivel, mensaje, direccion } = req.body;
    console.log('📝 Datos recibidos:', { nombre, email, telefono, nivel, mensaje, direccion });

    if (!nombre || !email || !telefono || !nivel) {
      console.log('❌ Validación fallida: faltan campos obligatorios');
      return res.status(400).json({
        error: 'Faltan campos obligatorios',
        required: ['nombre', 'email', 'telefono', 'nivel']
      });
    }

    if (!process.env.SMTP2GO_USERNAME || !process.env.SMTP2GO_PASSWORD || !transporter) {
      console.error('❌ Credenciales de SMTP2GO no configuradas');
      return res.status(500).json({ error: 'Servicio de correo no disponible' });
    }

    const mailOptions = {
      from: formatMailFrom(),
      to: getMailTo(),
      replyTo: email,
      subject: `Solicitud de matrícula presencial - Nivel ${nivel} - ${nombre}`,
      html: `
        <h2>Solicitud de Matrícula Presencial</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Datos del Estudiante:</h3>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono}</p>
          <p><strong>Nivel:</strong> ${nivel}</p>
          ${direccion ? `<p><strong>Dirección del centro:</strong> ${direccion}</p>` : ''}
          <p><strong>Fecha de solicitud:</strong> ${new Date().toLocaleString('es-ES')}</p>
        </div>
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h3 style="color: #2e7d32; margin-top: 0;">Mensaje del Estudiante:</h3>
          <p style="font-size: 16px; font-weight: bold; color: #1b5e20;">${mensaje || 'Solicitud de matrícula presencial'}</p>
        </div>
        <p style="color: #666;">Este email fue enviado desde la app Academia de Inmigrantes.</p>
      `,
    };

    console.log('📤 Enviando email a:', mailOptions.to);
    console.log('📤 Desde:', mailOptions.from);
    console.log('📤 Asunto:', mailOptions.subject);

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email matrícula presencial enviado:', result.messageId);

    res.json({
      success: true,
      message: 'Solicitud de matrícula presencial enviada correctamente',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('❌ Error enviando solicitud de matrícula presencial:', error);
    res.status(500).json({ error: error.message || 'Error interno al enviar la solicitud' });
  }
});

const normalizeText = (text = '') => text
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9ñáéíóúü\s]/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const isSupportedImageBuffer = (buffer) => {
  if (!buffer || buffer.length < 8) {
    return false;
  }
  const isPng = buffer[0] === 0x89
    && buffer[1] === 0x50
    && buffer[2] === 0x4e
    && buffer[3] === 0x47;
  const isJpeg = buffer[0] === 0xff
    && buffer[1] === 0xd8
    && buffer[2] === 0xff;
  return isPng || isJpeg;
};

// Middleware de logging para todas las peticiones
app.use((req, res, next) => {
  console.log('📥 Petición recibida:', {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString(),
    headers: {
      'content-type': req.get('content-type'),
      'user-agent': req.get('user-agent')
    }
  });
  next();
});

// ============================================
// ESTADO DE PAGOS (STRIPE)
// ============================================

const recentPayments = new Map();
const PAYMENT_TTL_MS = 10 * 60 * 1000;

const storeRecentPayment = (orderId, payload) => {
  if (!orderId) return;
  recentPayments.set(orderId, { ...payload, updatedAt: Date.now() });
  setTimeout(() => {
    const stored = recentPayments.get(orderId);
    if (stored && Date.now() - stored.updatedAt >= PAYMENT_TTL_MS) {
      recentPayments.delete(orderId);
    }
  }, PAYMENT_TTL_MS);
};

// Endpoint para registrar push token del usuario
app.post('/api/user/push-token', async (req, res) => {
  try {
    const { userId, pushToken } = req.body;
    
    if (!userId || !pushToken) {
      return res.status(400).json({ ok: false, error: 'userId y pushToken requeridos' });
    }

    if (!Expo.isExpoPushToken(pushToken)) {
      return res.status(400).json({ ok: false, error: 'Token de push no válido' });
    }

    initGoogleClients();
    
    if (!firestore) {
      return res.status(500).json({ ok: false, error: 'Firestore no disponible' });
    }

    await firestore.collection('users').doc(userId).set({
      pushToken,
      pushTokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Iniciar listener de notificaciones si no está activo
    startNotificationListener();

    console.log(`✅ Push token guardado para usuario ${userId}`);
    res.json({ ok: true, message: 'Token guardado correctamente' });
  } catch (error) {
    console.error('❌ Error guardando push token:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Configurar Stripe. La clave secreta debe existir solo en el backend/Render.
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' })
  : null;

// ============================================
// ENDPOINTS PRINCIPALES (STRIPE, EMAIL, ETC)
// ============================================

// Endpoint raíz
app.get('/', (req, res) => {
  console.log('🏠 Endpoint raíz llamado');
  res.json({
    message: 'Academia Backend API',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      createPaymentIntent: '/api/create-payment-intent',
      stripeCheckout: '/api/stripe/create-checkout-session',
      accountDeletion: '/account-deletion'
    }
  });
});

// Página pública para Google Play (eliminación de cuenta y datos)
app.get('/account-deletion', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Eliminación de cuenta - Academia de Inmigrantes</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #f6f7fb;
      color: #111827;
    }
    .wrap {
      max-width: 860px;
      margin: 24px auto;
      padding: 24px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    }
    h1, h2 {
      margin: 0 0 12px 0;
      line-height: 1.3;
    }
    h1 { font-size: 28px; }
    h2 { font-size: 20px; margin-top: 24px; }
    p, li {
      font-size: 16px;
      line-height: 1.6;
    }
    .cta {
      display: inline-block;
      margin-top: 10px;
      padding: 12px 16px;
      border-radius: 8px;
      background: #111827;
      color: #fff;
      text-decoration: none;
      font-weight: 700;
    }
    .muted {
      color: #4b5563;
      font-size: 14px;
    }
    .box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 14px 16px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <main class="wrap">
    <h1>Solicitud de eliminación de cuenta</h1>
    <p>
      Si eres usuario de <strong>Academia de Inmigrantes</strong>, puedes solicitar la eliminación de tu cuenta y de los datos asociados.
    </p>

    <h2>Cómo solicitar la eliminación</h2>
    <ol>
      <li>Envía un correo a <strong>admin@academiadeinmigrantes.es</strong> o <strong>khalesito@yahoo.fr</strong>.</li>
      <li>Asunto recomendado: <strong>Eliminar mi cuenta</strong>.</li>
      <li>Incluye el email con el que te registraste en la app.</li>
    </ol>
    <a class="cta" href="mailto:admin@academiadeinmigrantes.es?subject=Eliminar%20mi%20cuenta">
      Solicitar eliminación por email
    </a>

    <h2>Qué datos se eliminan</h2>
    <div class="box">
      <ul>
        <li>Datos de perfil de usuario.</li>
        <li>Progreso y datos de uso asociados a la cuenta.</li>
        <li>Contenido generado por el usuario dentro de la app (salvo obligación legal).</li>
      </ul>
    </div>

    <h2>Datos que pueden conservarse temporalmente</h2>
    <div class="box">
      <ul>
        <li>Registros mínimos de seguridad y prevención de fraude durante el plazo estrictamente necesario.</li>
        <li>Si aplica, información de facturación/pago que deba conservarse por obligación legal.</li>
      </ul>
    </div>

    <h2>Plazo de respuesta</h2>
    <p>Las solicitudes se atienden en un máximo de 30 días.</p>

    <p class="muted">Última actualización: ${new Date().toISOString().slice(0, 10)}</p>
  </main>
</body>
</html>`);
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check llamado');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    port: PORT,
    services: {
      stripe: !!stripe,
      smtp2go: !!transporter,
      mailFrom: getMailFrom(),
      mailFromFormatted: formatMailFrom(),
    }
  });
});

// Endpoint para crear Payment Intent de Stripe
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || !description) {
      return res.status(400).json({ error: 'Amount and description are required' });
    }
    
    if (!stripe) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY no configurada en el backend' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      description,
      metadata: {
        integration_check: 'accept_a_payment',
      },
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

const BACKEND_PUBLIC_URL =
  process.env.BACKEND_PUBLIC_URL ||
  process.env.RENDER_EXTERNAL_URL ||
  'https://academia-backend-s9np.onrender.com';

const parseLevelFromOperation = (operationType) => {
  if (!operationType) return null;
  const match = String(operationType).toLowerCase().match(/matricula-(a1|a2|b1|b2)/);
  return match ? match[1].toUpperCase() : null;
};

const renderStripeResultPage = ({ type, orderId, levelUnlocked, importe }) => {
  const payload = JSON.stringify({
    type,
    orderId: orderId || '',
    levelUnlocked: levelUnlocked || '',
    importe: importe || '',
  }).replace(/</g, '\\u003c');

  const title = type === 'PAYMENT_SUCCESS' ? 'Pago confirmado' : 'Pago cancelado';
  const message =
    type === 'PAYMENT_SUCCESS'
      ? 'Tu pago con Stripe se ha procesado correctamente. Puedes volver a la aplicación.'
      : 'El pago fue cancelado. Puedes cerrar esta ventana y volver a la aplicación.';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: Arial, sans-serif; text-align:center; padding: 40px;">
  <h1>${title}</h1>
  <p>${message}</p>
  <script>
    try {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(${payload});
      }
    } catch (e) {
      console.error(e);
    }
  </script>
</body>
</html>`;
};

app.post('/api/stripe/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY no configurada en el backend' });
    }

    const {
      amount,
      description,
      operationType,
      orderId,
      customerEmail,
      customerName,
    } = req.body || {};

    if (!amount || !orderId) {
      return res.status(400).json({ error: 'amount y orderId son obligatorios' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: description || 'Pago Academia de Inmigrantes',
            },
            unit_amount: Math.round(Number(amount) * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail || undefined,
      client_reference_id: String(orderId),
      metadata: {
        operationType: String(operationType || ''),
        orderId: String(orderId),
        customerName: String(customerName || ''),
      },
      success_url: `${BACKEND_PUBLIC_URL}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}&orderId=${encodeURIComponent(String(orderId))}`,
      cancel_url: `${BACKEND_PUBLIC_URL}/api/stripe/cancel?orderId=${encodeURIComponent(String(orderId))}`,
    });

    console.log('✅ Stripe Checkout creado:', { orderId, sessionId: session.id });
    res.json({ url: session.url, sessionId: session.id, orderId });
  } catch (error) {
    console.error('❌ Error creando Stripe Checkout:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stripe/success', async (req, res) => {
  try {
    const orderId = String(req.query.orderId || '');
    const sessionId = String(req.query.session_id || '');
    let levelUnlocked = null;
    let importe = '';

    if (sessionId && stripe) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const operationType = session.metadata?.operationType || '';
      levelUnlocked = parseLevelFromOperation(operationType);
      importe = session.amount_total ? (session.amount_total / 100).toFixed(2) : '';
    }

    storeRecentPayment(orderId, {
      status: 'ok',
      orderId,
      levelUnlocked,
      importe,
      provider: 'stripe',
    });

    res.send(
      renderStripeResultPage({
        type: 'PAYMENT_SUCCESS',
        orderId,
        levelUnlocked,
        importe,
      })
    );
  } catch (error) {
    console.error('❌ Error en Stripe success:', error);
    res.status(500).send('Error procesando pago Stripe');
  }
});

app.get('/api/stripe/cancel', (req, res) => {
  try {
    const orderId = String(req.query.orderId || '');
    storeRecentPayment(orderId, {
      status: 'ko',
      orderId,
      levelUnlocked: null,
      provider: 'stripe',
    });
    res.send(
      renderStripeResultPage({
        type: 'PAYMENT_CANCEL',
        orderId,
        levelUnlocked: null,
        importe: '',
      })
    );
  } catch (error) {
    console.error('❌ Error en Stripe cancel:', error);
    res.status(500).send('Error procesando cancelación Stripe');
  }
});

app.get('/api/stripe/payment-status', (req, res) => {
  try {
    const orderId = String(req.query.orderId || '').trim();
    if (!orderId) {
      return res.status(400).json({ ok: false, error: 'orderId requerido' });
    }
    const data = recentPayments.get(orderId);
    if (!data) {
      return res.json({ ok: true, status: 'pending' });
    }
    return res.json({ ok: true, ...data });
  } catch (error) {
    console.error('❌ Error en Stripe payment-status:', error);
    return res.status(500).json({ ok: false, error: 'Error interno' });
  }
});

// Endpoint para enviar documentación de Arraigos
app.post('/api/arraigos/enviar', async (req, res) => {
  try {
    console.log('📁 Recibida solicitud de arraigo');
    const {
      name,
      email,
      phone,
      message,
      arraigoTypeId,
      arraigoTypeTitle,
      attachments = [],
      missingMandatory = [],
    } = req.body || {};

    if (!name || !email || !phone || !arraigoTypeId || !arraigoTypeTitle) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios (name, email, phone, arraigoTypeId, arraigoTypeTitle)'
      });
    }

    if (!Array.isArray(attachments) || attachments.length === 0) {
      return res.status(400).json({
        error: 'Adjunta al menos un documento en PDF'
      });
    }

    if (!process.env.SMTP2GO_USERNAME || !process.env.SMTP2GO_PASSWORD || !transporter) {
      console.error('❌ SMTP no configurado');
      return res.status(500).json({ error: 'Servicio de correo no disponible' });
    }

    const normalizedAttachments = attachments
      .filter((att) => att?.pdfBase64)
      .map((att, index) => ({
        filename: `${att.requirementTitle || 'documento'}-${index + 1}.pdf`,
        content: att.pdfBase64,
        encoding: 'base64',
      }));

    if (normalizedAttachments.length === 0) {
      return res.status(400).json({ error: 'No se recibió ningún PDF válido' });
    }

    const pendingList = Array.isArray(missingMandatory) && missingMandatory.length
      ? `<h4>Documentos pendientes:</h4><ul>${missingMandatory.map((item) => `<li>${item}</li>`).join('')}</ul>`
      : '';

    const mailOptions = {
      from: formatMailFrom(),
      to: getMailTo(),
      replyTo: email,
      subject: `Arraigo ${arraigoTypeTitle} - Documentación de ${name}`,
      html: `
        <h2>Nueva solicitud de Arraigo (${arraigoTypeTitle})</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Tipo:</strong> ${arraigoTypeTitle} (${arraigoTypeId})</p>
        <p><strong>Notas:</strong> ${message || 'Sin notas adicionales'}</p>
        <p>Se adjuntan ${normalizedAttachments.length} documentos en PDF generados desde la app.</p>
        ${pendingList}
      `,
      attachments: normalizedAttachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Arraigo enviado, messageId:', result.messageId);

    res.json({ success: true, message: 'Documentos enviados correctamente', messageId: result.messageId });
  } catch (error) {
    console.error('❌ Error enviando arraigo:', error);
    res.status(500).json({ error: error.message || 'Error interno al enviar arraigo' });
  }
});

// Endpoint para solicitar inscripción al examen presencial
app.post('/api/solicitar-examen-presencial', async (req, res) => {
  try {
    console.log('📧 Iniciando solicitud de inscripción al examen presencial...');
    const { nombre, email, telefono, nivel, documento, mensaje } = req.body;
    console.log('📝 Datos recibidos:', { nombre, email, telefono, nivel, documento, mensaje });
    console.log('📝 Nombre recibido (tipo y valor):', typeof nombre, nombre);
    console.log('📝 Nombre completo recibido:', JSON.stringify(nombre));

    // Validar datos requeridos
    if (!nombre || !email || !nivel) {
      console.log('❌ Validación fallida: faltan campos obligatorios');
      return res.status(400).json({
        error: 'Faltan campos obligatorios',
        required: ['nombre', 'email', 'nivel']
      });
    }

    // Verificar configuración de SMTP2GO
    if (!process.env.SMTP2GO_USERNAME || !process.env.SMTP2GO_PASSWORD) {
      console.error('❌ Credenciales de SMTP2GO no configuradas');
      return res.status(500).json({
        error: 'Configuración de email incompleta',
        details: 'Credenciales de SMTP2GO no configuradas'
      });
    }

    // Configurar el email
    const mailOptions = {
      from: formatMailFrom(),
      to: getMailTo(),
      replyTo: email,
      subject: `Solicitud de examen presencial - Nivel ${nivel} - ${nombre}`,
      html: `
        <h2>Solicitud de Inscripción al Examen Presencial</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Datos del Estudiante:</h3>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${telefono ? `<p><strong>Teléfono:</strong> ${telefono}</p>` : ''}
          ${documento ? `<p><strong>Documento:</strong> ${documento}</p>` : ''}
          <p><strong>Nivel:</strong> ${nivel}</p>
          <p><strong>Fecha de solicitud:</strong> ${new Date().toLocaleString('es-ES')}</p>
        </div>
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h3 style="color: #2e7d32; margin-top: 0;">Mensaje del Estudiante:</h3>
          <p style="font-size: 16px; font-weight: bold; color: #1b5e20;">${mensaje || 'ME APUNTO EN EXAMEN PRESENCIAL'}</p>
        </div>
        <p style="color: #666;">Este email fue enviado desde la app Academia de Inmigrantes.</p>
        <p style="color: #666;">El estudiante ha completado exitosamente el examen final del nivel ${nivel} y solicita inscribirse al examen presencial.</p>
      `,
    };

    console.log('📤 Enviando email a:', mailOptions.to);
    console.log('📤 Desde:', mailOptions.from);
    console.log('📤 Asunto:', mailOptions.subject);

    // Enviar el email usando SMTP2GO
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente:', result.messageId);

    res.json({
      success: true,
      message: 'Solicitud de examen presencial enviada correctamente',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('❌ Error enviando solicitud de examen presencial:', error);

    // Manejo de errores específico para SMTP2GO
    let errorMessage = 'Error al enviar la solicitud';
    let errorDetails = error.message;
    let errorCode = error.code;

    if (error.responseCode) {
      const responseCode = error.responseCode;
      console.error('❌ Código de respuesta SMTP:', responseCode);

      if (responseCode === 535) {
        errorMessage = 'Error de autenticación con SMTP2GO';
        errorDetails = 'Las credenciales de SMTP2GO son incorrectas.';
        errorCode = 'EAUTH';
      } else if (responseCode === 550) {
        errorMessage = 'Email rechazado';
        errorDetails = 'El servidor SMTP rechazó el email. Verifica el dominio y email remitente.';
        errorCode = 'EREJECTED';
      } else if (responseCode === 421) {
        errorMessage = 'Servicio temporalmente no disponible';
        errorDetails = 'SMTP2GO no está disponible temporalmente. Inténtalo más tarde.';
        errorCode = 'ETEMP';
      }
    } else {
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
        errorMessage = 'Timeout de conexión con SMTP2GO';
        errorDetails = 'El servidor de SMTP2GO no responde. Verificar conexión a internet.';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = 'Servidor de SMTP2GO no encontrado';
        errorDetails = 'No se puede conectar al servidor de SMTP2GO.';
      }
    }

    res.status(500).json({
      error: errorMessage,
      details: errorDetails,
      code: errorCode
    });
  }
});

const runTesseractOcr = async (buffer) => {
  const lang = process.env.OCR_LANGUAGE || 'spa';
  const { data } = await Tesseract.recognize(buffer, lang);
  return data?.text || '';
};

// OCR Aprende a Escribir (Render + Google Vision o Tesseract)
app.post('/api/ocr-aprende-escribir', async (req, res) => {
  try {
    const { imageBase64, expectedText, exerciseId, userId } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 es requerido' });
    }

    const cleanedBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanedBase64, 'base64');
    const minBytes = parseInt(process.env.OCR_MIN_BYTES || '2048', 10);
    if (!buffer.length || buffer.length < minBytes || !isSupportedImageBuffer(buffer)) {
      return res.status(400).json({ error: 'Imagen inválida o demasiado pequeña' });
    }

    let storagePath = null;
    if (storageBucket) {
      storagePath = `aprende_escribir/${userId || 'anon'}/${Date.now()}.jpg`;
      const file = storageBucket.file(storagePath);
      await file.save(buffer, {
        contentType: 'image/jpeg',
        resumable: false,
      });
    }

    const ocrProvider = (process.env.OCR_PROVIDER || 'tesseract').toLowerCase();
    let detectedText = '';

    if (ocrProvider === 'vision') {
      initGoogleClients();
      if (!visionClient) {
        return res.status(500).json({ error: 'Vision no configurado' });
      }
      const [result] = await visionClient.textDetection(buffer);
      detectedText = result?.fullTextAnnotation?.text || '';
    } else {
      detectedText = await runTesseractOcr(buffer);
    }
    const normalizedDetected = normalizeText(detectedText);
    const normalizedExpected = normalizeText(expectedText || '');
    const matched = normalizedExpected
      ? normalizedDetected.includes(normalizedExpected)
      : false;

    if (firestore) {
      await firestore.collection('aprende_escribir_submissions').add({
        storagePath,
        expectedText: expectedText || null,
        detectedText,
        matched,
        exerciseId: exerciseId || null,
        userId: userId || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({
      detectedText,
      matched,
      storagePath,
    });
  } catch (error) {
    console.error('❌ Error OCR:', error);
    res.status(500).json({ error: 'No se pudo procesar la imagen' });
  }
});

// Endpoint para enviar email de asesoría de inmigración
app.post('/api/enviar-solicitud-asesoria', async (req, res) => {
  try {
    console.log('📧 Iniciando envío de email de asesoría...');
    const {
      nombre,
      name,
      email,
      telefono,
      phone,
      tipoConsulta,
      appointmentType,
      date,
      time,
      mensaje,
      notes
    } = req.body;

    const nombreFinal = nombre || name;
    const telefonoFinal = telefono || phone;
    const tipoConsultaFinal = tipoConsulta || appointmentType;
    const mensajeFinal = mensaje || notes || 'Sin notas adicionales';

    // Validar datos requeridos (soporta ambos formatos)
    if (!nombreFinal || !email || !telefonoFinal || !tipoConsultaFinal || !date || !time) {
      console.log('❌ Validación fallida: faltan campos obligatorios');
      return res.status(400).json({
        error: 'Faltan campos obligatorios',
        required: ['nombre/name', 'email', 'telefono/phone', 'tipoConsulta/appointmentType', 'date', 'time']
      });
    }

    // Verificar configuración de SMTP2GO
    if (!process.env.SMTP2GO_USERNAME || !process.env.SMTP2GO_PASSWORD || !transporter) {
      console.error('❌ Credenciales de SMTP2GO no configuradas');
      return res.status(500).json({
        error: 'Configuración de email incompleta',
        details: 'Credenciales de SMTP2GO no configuradas'
      });
    }

    const mailOptions = {
      from: formatMailFrom(),
      to: getMailTo(),
      replyTo: email,
      subject: `Nueva solicitud de asesoría - ${nombreFinal}`,
      html: `
        <h2>Nueva Solicitud de Asesoría de Inmigración</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Datos del Solicitante:</h3>
          <p><strong>Nombre:</strong> ${nombreFinal}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefonoFinal}</p>
          <p><strong>Tipo de cita:</strong> ${tipoConsultaFinal}</p>
          <p><strong>Fecha solicitada:</strong> ${date}</p>
          <p><strong>Hora solicitada:</strong> ${time}</p>
          <h3>Notas adicionales:</h3>
          <p>${mensajeFinal}</p>
        </div>
        <p style="color: #666;">Este email fue enviado desde la app Academia de Inmigrantes.</p>
      `,
    };

    console.log('📤 Enviando email a:', mailOptions.to);
    console.log('📤 Desde:', mailOptions.from);
    console.log('📤 Asunto:', mailOptions.subject);

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente:', result.messageId);

    res.json({
      success: true,
      message: 'Solicitud de asesoría enviada correctamente',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({ error: error.message });
  }
});


// ============================================
// CONCURSO A1 (web) — solo inscripción (fase 1)
// ============================================

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeDocumento(documento) {
  return String(documento || '').trim().toUpperCase().replace(/\s+/g, '');
}

function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

async function findConcursoInscripcion(emailNorm, docNorm) {
  if (!firestore) return null;

  const byEmail = await firestore
    .collection('concurso_a1_inscripciones')
    .where('emailNorm', '==', emailNorm)
    .limit(1)
    .get();

  if (!byEmail.empty) return byEmail.docs[0];

  if (!docNorm) return null;

  const byDoc = await firestore
    .collection('concurso_a1_inscripciones')
    .where('documentoNorm', '==', docNorm)
    .limit(1)
    .get();

  return byDoc.empty ? null : byDoc.docs[0];
}

async function saveConcursoMatriculaCaptura(buffer, emailNorm) {
  if (!storageBucket || !buffer?.length) {
    return null;
  }
  const storagePath = `concurso_a1/matriculas/${emailNorm.replace(/[^a-z0-9@._-]/g, '_')}/${Date.now()}.jpg`;
  const file = storageBucket.file(storagePath);
  await file.save(buffer, {
    contentType: 'image/jpeg',
    resumable: false,
  });
  return storagePath;
}

app.post('/api/concurso-a1/inscripcion', async (req, res) => {
  try {
    const {
      nombre,
      email,
      telefono,
      documento,
      nacionalidad,
      estadoA1,
      matriculaA1,
      aceptaBases,
      fase,
      capturaMatriculaBase64,
      capturaMatriculaNombre,
    } = req.body || {};

    if (!nombre || !email || !telefono) {
      return res.status(400).json({ error: 'Nombre, email y teléfono son obligatorios' });
    }
    if (!aceptaBases) {
      return res.status(400).json({ error: 'Debes aceptar el uso de tus datos' });
    }
    if (!capturaMatriculaBase64) {
      return res.status(400).json({ error: 'Debes adjuntar la captura de matrícula A1' });
    }

    const cleanedBase64 = String(capturaMatriculaBase64).replace(/^data:image\/\w+;base64,/, '');
    const capturaBuffer = Buffer.from(cleanedBase64, 'base64');
    const maxBytes = 4 * 1024 * 1024;
    if (!capturaBuffer.length || capturaBuffer.length > maxBytes) {
      return res.status(400).json({ error: 'Captura inválida o demasiado grande (máx. 4 MB)' });
    }
    if (!isSupportedImageBuffer(capturaBuffer)) {
      return res.status(400).json({ error: 'La captura debe ser JPG o PNG' });
    }

    const emailNorm = normalizeEmail(email);
    const docNorm = documento ? normalizeDocumento(documento) : '';

    if (!firestore) {
      return res.status(503).json({ error: 'Servicio temporalmente no disponible. Inténtalo más tarde.' });
    }

    const existing = await findConcursoInscripcion(emailNorm, docNorm);
    if (existing) {
      return res.json({
        success: true,
        message: 'Ya consta tu inscripción.',
        inscripcionId: existing.id,
      });
    }

    let capturaStoragePath = null;
    try {
      capturaStoragePath = await saveConcursoMatriculaCaptura(capturaBuffer, emailNorm);
    } catch (storageErr) {
      console.warn('⚠️ No se pudo guardar captura en Storage:', storageErr.message);
    }

    const payload = {
      nombre: String(nombre).trim(),
      email: String(email).trim(),
      emailNorm,
      telefono: String(telefono).trim(),
      nacionalidad: String(nacionalidad || '').trim(),
      estadoA1: String(estadoA1 || '').trim(),
      matriculaA1: Boolean(matriculaA1),
      aceptaBases: true,
      fase: fase || 'solo_inscripcion',
      estado: 'apuntado',
      capturaMatriculaPath: capturaStoragePath,
      capturaMatriculaNombre: String(capturaMatriculaNombre || 'matricula-a1.jpg').trim(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (documento) {
      payload.documento = String(documento).trim();
      payload.documentoNorm = docNorm;
    }

    const ref = await firestore.collection('concurso_a1_inscripciones').add(payload);

    if (transporter) {
      try {
        const matriculaLabel =
          estadoA1 === 'si'
            ? 'Ya matriculado A1'
            : estadoA1 === 'no'
              ? 'Quiere matricularse'
              : 'Interesado, sin matrícula aún';
        const mailOptions = {
          from: formatMailFrom(),
          to: getMailTo(),
          replyTo: email,
          subject: `Concurso A1 · Apuntado · ${nombre}`,
          html: `
            <h2>Nuevo apunte Concurso A1</h2>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Teléfono:</strong> ${telefono}</p>
            <p><strong>Nacionalidad:</strong> ${nacionalidad || '—'}</p>
            <p><strong>Estado A1:</strong> ${matriculaLabel}</p>
            <p><strong>Captura (Firebase Storage):</strong> ${capturaStoragePath || 'No guardada en bucket'}</p>
            <p style="color:#666;">Ver captura en Firebase Console → Storage.</p>
          `,
        };
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.warn('⚠️ Email inscripción concurso A1 no enviado:', mailErr.message);
      }
    }

    res.json({ success: true, inscripcionId: ref.id, capturaMatriculaPath: capturaStoragePath });
  } catch (error) {
    console.error('❌ Error inscripción concurso A1:', error);
    res.status(500).json({ error: 'No se pudo registrar la inscripción' });
  }
});

app.post('/api/concurso-a1/expresion-escrita', async (req, res) => {
  try {
    const { email, documento, texto, palabras } = req.body || {};

    if (!email || !documento || !texto) {
      return res.status(400).json({ error: 'Email, documento y texto son obligatorios' });
    }

    const wordCount = countWords(texto);
    if (wordCount < 80) {
      return res.status(400).json({ error: 'El texto debe tener al menos 80 palabras' });
    }
    if (wordCount > 180) {
      return res.status(400).json({ error: 'El texto supera el máximo permitido (150 palabras aprox.)' });
    }

    const emailNorm = normalizeEmail(email);
    const docNorm = normalizeDocumento(documento);

    if (!firestore) {
      return res.status(503).json({ error: 'Servicio temporalmente no disponible' });
    }

    const inscripcionDoc = await findConcursoInscripcion(emailNorm, docNorm);
    if (!inscripcionDoc) {
      return res.status(404).json({
        error: 'No encontramos tu inscripción. Inscríbete primero en el concurso.',
      });
    }

    const inscripcion = inscripcionDoc.data();
    const textoLimpio = String(texto).trim().slice(0, 4000);

    await inscripcionDoc.ref.set(
      {
        pruebaEscrita: 'recibida',
        expresionEscrita: {
          texto: textoLimpio,
          palabras: wordCount,
          enviadoAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    await firestore.collection('concurso_a1_expresiones').add({
      inscripcionId: inscripcionDoc.id,
      nombre: inscripcion.nombre || '',
      email: inscripcion.email || email,
      emailNorm,
      documentoNorm: docNorm,
      texto: textoLimpio,
      palabras: wordCount,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (transporter) {
      try {
        await transporter.sendMail({
          from: formatMailFrom(),
          to: getMailTo(),
          replyTo: inscripcion.email || email,
          subject: `Concurso A1 · Expresión escrita · ${inscripcion.nombre || email}`,
          html: `
            <h2>Expresión escrita recibida</h2>
            <p><strong>Participante:</strong> ${inscripcion.nombre || '—'}</p>
            <p><strong>Email:</strong> ${inscripcion.email || email}</p>
            <p><strong>Palabras:</strong> ${wordCount}</p>
            <hr />
            <pre style="white-space:pre-wrap;font-family:sans-serif;">${textoLimpio.replace(/</g, '&lt;')}</pre>
          `,
        });
      } catch (mailErr) {
        console.warn('⚠️ Email expresión escrita no enviado:', mailErr.message);
      }
    }

    res.json({ success: true, palabras: wordCount });
  } catch (error) {
    console.error('❌ Error expresión escrita concurso A1:', error);
    res.status(500).json({ error: 'No se pudo enviar la expresión escrita' });
  }
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado en puerto', PORT);
  console.log('🌍 Entorno:', NODE_ENV);
  console.log('🔗 URL: http://localhost:' + PORT);
  console.log('💳 Stripe configurado:', !!stripe);
  console.log('📧 Email configurado:', !!transporter);
  
  // Inicializar Firebase y listener de notificaciones
  try {
    initGoogleClients();
    if (firestore) {
      startNotificationListener();
      console.log('📡 Listener de push notifications activado');
    }
  } catch (error) {
    console.warn('⚠️ No se pudo iniciar listener de notificaciones:', error.message);
  }
});
