require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const FORMACION_PRICE_EUR = parseFloat(process.env.FORMACION_PRICE_EUR || '10');

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

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Configurar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123456789', {
  apiVersion: '2023-10-16',
});

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
      createPaymentIntent: '/api/create-payment-intent'
    }
  });
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
      stripe: !!process.env.STRIPE_SECRET_KEY,
      smtp2go: !!transporter
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
      from: 'admin@academiadeinmigrantes.es',
      to: 'admin@academiadeinmigrantes.es',
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
      from: 'admin@academiadeinmigrantes.es',
      to: 'admin@academiadeinmigrantes.es',
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
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado en puerto', PORT);
  console.log('🌍 Entorno:', NODE_ENV);
  console.log('🔗 URL: http://localhost:' + PORT);
  console.log('💳 Stripe configurado:', !!process.env.STRIPE_SECRET_KEY);
  console.log('📧 Email configurado:', !!transporter);
});
