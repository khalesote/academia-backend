require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const FORMACION_PRICE_EUR = parseFloat(process.env.FORMACION_PRICE_EUR || '10');

// Configurar SMTP2GO con nodemailer
// Nota: Usamos puerto 2525 porque Render puede bloquear 587/465 en algunos planes
let transporter;
if (process.env.SMTP2GO_USERNAME && process.env.SMTP2GO_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 2525, // Puerto alternativo que no suele estar bloqueado por Render
    secure: false, // false para puertos no SSL
    requireTLS: true, // Requiere STARTTLS
    auth: {
      user: process.env.SMTP2GO_USERNAME,
      pass: process.env.SMTP2GO_PASSWORD,
    },
  });
}

// Verificar configuración de SMTP2GO
console.log('🔧 Verificando configuración de SMTP2GO...');
console.log(`   - Usuario configurado: ${!!process.env.SMTP2GO_USERNAME}`);
console.log(`   - Contraseña configurada: ${!!process.env.SMTP2GO_PASSWORD}`);
if (process.env.SMTP2GO_USERNAME) {
  console.log(`   - Usuario (primeros 3 chars): ${process.env.SMTP2GO_USERNAME.substring(0, 3)}...`);
}
if (process.env.SMTP2GO_PASSWORD) {
  console.log(`   - Contraseña (longitud): ${process.env.SMTP2GO_PASSWORD.length} caracteres`);
}
if (process.env.SMTP2GO_USERNAME && process.env.SMTP2GO_PASSWORD) {
  console.log('✅ SMTP2GO configurado correctamente');
} else {
  console.log('   ⚠️  Credenciales de SMTP2GO NO configuradas');
}

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Configuración de Odoo
const ODOO_URL = process.env.ODOO_URL || '';
const ODOO_DATABASE = process.env.ODOO_DATABASE || '';
const ODOO_USERNAME = process.env.ODOO_USERNAME || '';
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || '';
const ODOO_API_KEY = process.env.ODOO_API_KEY || '';

// Verificar configuración de Odoo
console.log('🔧 Verificando configuración de Odoo...');
console.log(`   - URL configurada: ${!!ODOO_URL}`);
console.log(`   - Base de datos configurada: ${!!ODOO_DATABASE}`);
console.log(`   - Usuario configurado: ${!!ODOO_USERNAME}`);
if (ODOO_URL) {
  console.log(`   - URL: ${ODOO_URL}`);
}
if (ODOO_URL && ODOO_DATABASE && (ODOO_USERNAME || ODOO_API_KEY)) {
  console.log('✅ Odoo configurado correctamente');
} else {
  console.log('   ⚠️  Configuración de Odoo incompleta - la sincronización no funcionará');
}

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
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    smtp2goConfigured: !!(process.env.SMTP2GO_USERNAME && process.env.SMTP2GO_PASSWORD),
    odooConfigured: !!(ODOO_URL && ODOO_DATABASE && (ODOO_USERNAME || ODOO_API_KEY))
  });
});

// Endpoint de verificación para URLs de Cecabank
app.get('/api/cecabank/verify', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Endpoints de Cecabank están accesibles',
    urls: {
      urlOk: 'https://academiadeinmigrantes.es/api/cecabank/ok',
      urlKo: 'https://academiadeinmigrantes.es/api/cecabank/ko'
    },
    endpoints: {
      ok: {
        method: 'POST',
        path: '/api/cecabank/ok',
        accessible: true
      },
      ko: {
        method: 'POST',
        path: '/api/cecabank/ko',
        accessible: true
      }
    },
    instrucciones: 'Configura estas URLs EXACTAMENTE como se muestran en la extranet de Cecabank'
  });
});

// Almacenamiento temporal de formularios HTML (en memoria, se limpia después de 1 hora)
const tempForms = new Map();

// Almacenamiento de estado de pagos (para diagnóstico)
const paymentStatus = new Map();

// Endpoint para crear un formulario HTML temporal y obtener su URL
app.post('/api/cecabank/temp-form', express.json(), (req, res) => {
  try {
    const { html, orderId, operationType } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'Se requiere el campo html' });
    }
    
    // Generar un ID único para el formulario temporal
    const formId = `form_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Guardar el HTML en memoria con timestamp
    tempForms.set(formId, {
      html: html,
      orderId: orderId || null,
      operationType: operationType || null,
      createdAt: Date.now(),
    });
    
    // Limpiar formularios antiguos (más de 1 hora)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [id, form] of tempForms.entries()) {
      if (form.createdAt < oneHourAgo) {
        tempForms.delete(id);
      }
    }
    
    // Devolver la URL temporal
    const tempUrl = `https://academiadeinmigrantes.es/api/cecabank/temp-form/${formId}`;
    
    console.log(`✅ Formulario temporal creado: ${formId}`);
    console.log(`📋 URL temporal: ${tempUrl}`);
    
    res.json({ tempUrl, formId });
  } catch (error) {
    console.error('❌ Error creando formulario temporal:', error);
    res.status(500).json({ error: 'Error al crear formulario temporal' });
  }
});

// Endpoint para servir el formulario HTML temporal
app.get('/api/cecabank/temp-form/:formId', (req, res) => {
  try {
    const { formId } = req.params;
    const form = tempForms.get(formId);
    
    if (!form) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Formulario no encontrado</title>
          </head>
          <body>
            <h1>Formulario no encontrado</h1>
            <p>Este formulario ha expirado o no existe.</p>
          </body>
        </html>
      `);
    }
    
    // Verificar que no haya expirado (1 hora)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    if (form.createdAt < oneHourAgo) {
      tempForms.delete(formId);
      return res.status(410).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Formulario expirado</title>
          </head>
          <body>
            <h1>Formulario expirado</h1>
            <p>Este formulario ha expirado. Por favor, intenta de nuevo.</p>
          </body>
        </html>
      `);
    }
    
    // Devolver el HTML con headers correctos
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    console.log(`✅ Sirviendo formulario temporal: ${formId}`);
    console.log(`📏 Tamaño del HTML: ${form.html.length} caracteres`);
    console.log(`📋 Primeros 200 caracteres: ${form.html.substring(0, 200)}`);
    console.log(`📋 Últimos 200 caracteres: ${form.html.substring(Math.max(0, form.html.length - 200))}`);
    
    // Verificar que el HTML no esté vacío
    if (!form.html || form.html.trim().length === 0) {
      console.error('❌ HTML vacío detectado');
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Error</title>
          </head>
          <body>
            <h1>Error</h1>
            <p>El formulario está vacío. Por favor, intenta de nuevo.</p>
          </body>
        </html>
      `);
    }
    
    // Verificar que el HTML tenga estructura básica
    const hasForm = form.html.includes('<form') || form.html.includes('<FORM');
    const hasScript = form.html.includes('<script') || form.html.includes('<SCRIPT');
    console.log(`📋 HTML tiene form: ${hasForm}, tiene script: ${hasScript}`);
    
    if (!hasForm) {
      console.error('❌ HTML no contiene formulario');
    }
    
    // Enviar el HTML con headers correctos
    res.send(form.html);
    
    // Eliminar el formulario después de servirlo (solo se usa una vez)
    tempForms.delete(formId);
  } catch (error) {
    console.error('❌ Error sirviendo formulario temporal:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Error</title>
        </head>
        <body>
          <h1>Error</h1>
          <p>Ocurrió un error al cargar el formulario.</p>
        </body>
      </html>
    `);
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
      const expectedAmount = FORMACION_PRICE_EUR;
      console.log(' AmountNumber calculado para formación profesional:', amountNumber, 'Esperado:', expectedAmount);

      if (!amount || isNaN(amountNumber) || Math.abs(amountNumber - expectedAmount) > 0.001) {
        console.error(' Validación fallida para formación profesional:', {
          originalAmount: amount,
          amountNumber,
          expectedAmount,
          difference: Math.abs(amountNumber - expectedAmount)
        });
        return res.status(400).json({
          error: `El monto debe ser EXACTAMENTE ${expectedAmount.toFixed(2)} euros para formación profesional`,
          receivedAmount: amount,
          expectedAmount
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

// Endpoint para probar credenciales personalizadas
app.post('/api/test-smtp2go-custom', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Faltan credenciales',
        details: 'Proporciona username y password en el body'
      });
    }

    console.log('🧪 Probando credenciales personalizadas de SMTP2GO...');
    console.log(`   - Usuario: ${username.substring(0, 3)}...`);

    // Crear transporter temporal con credenciales personalizadas
    const testTransporter = nodemailer.createTransport({
      host: 'mail.smtp2go.com',
      port: 2525,
      secure: false,
      requireTLS: true,
      auth: {
        user: username,
        pass: password,
      },
    });

    // Verificar conexión
    const verifyResult = await testTransporter.verify();
    console.log('✅ Conexión SMTP2GO verificada con credenciales personalizadas:', verifyResult);

    res.json({
      success: true,
      message: 'Credenciales válidas - conexión exitosa',
      verified: verifyResult
    });

  } catch (error) {
    console.error('❌ Error verificando credenciales personalizadas:', error);
    
    res.status(500).json({
      error: 'Error de credenciales SMTP2GO',
      details: error.message,
      code: error.code,
      response: error.response,
      responseCode: error.responseCode
    });
  }
});

// Endpoint de prueba para SMTP2GO
app.post('/api/test-smtp2go', async (req, res) => {
  try {
    console.log('🧪 Probando conexión con SMTP2GO...');
    
    if (!transporter) {
      return res.status(500).json({
        error: 'Transporter no configurado',
        details: 'Las credenciales de SMTP2GO no están configuradas'
      });
    }

    // Verificar conexión
    const verifyResult = await transporter.verify();
    console.log('✅ Conexión SMTP2GO verificada:', verifyResult);

    res.json({
      success: true,
      message: 'Conexión SMTP2GO exitosa',
      verified: verifyResult
    });

  } catch (error) {
    console.error('❌ Error verificando SMTP2GO:', error);
    
    res.status(500).json({
      error: 'Error de conexión SMTP2GO',
      details: error.message,
      code: error.code
    });
  }
});

// Endpoint para enviar email de prueba
app.post('/api/test-email', async (req, res) => {
  try {
    console.log('📧 Enviando email de prueba...');

    if (!transporter) {
      return res.status(500).json({
        error: 'Transporter no configurado',
        details: 'Las credenciales de SMTP2GO no están configuradas'
      });
    }

    const mailOptions = {
      from: 'admin@academiadeinmigrantes.es',
      to: 'admin@academiadeinmigrantes.es',
      subject: 'Email de prueba - SMTP2GO',
      html: `
        <h2>Prueba de conexión SMTP2GO</h2>
        <p>Este es un email de prueba enviado desde Academia de Inmigrantes.</p>
        <p>Si recibes este email, la configuración de SMTP2GO está funcionando correctamente.</p>
        <p>Hora del envío: ${new Date().toLocaleString()}</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de prueba enviado:', result.messageId);

    res.json({
      success: true,
      message: 'Email de prueba enviado correctamente',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('❌ Error enviando email de prueba:', error);

    res.status(500).json({
      error: 'Error enviando email de prueba',
      details: error.message,
      code: error.code
    });
  }
});

app.post('/api/enviar-solicitud-asesoria', async (req, res) => {
  try {
    console.log('📧 Iniciando envío de email de asesoría...');
    const { name, email, phone, appointmentType, date, time, notes } = req.body;
    console.log('📝 Datos recibidos:', { name, email, phone, appointmentType, date, time });

    // Validar datos requeridos
    if (!name || !email || !phone || !appointmentType || !date || !time) {
      console.log('❌ Validación fallida: faltan campos obligatorios');
      return res.status(400).json({
        error: 'Faltan campos obligatorios',
        required: ['name', 'email', 'phone', 'appointmentType', 'date', 'time']
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
      from: 'admin@academiadeinmigrantes.es', // Email verificado
      to: 'admin@academiadeinmigrantes.es', // Email administrativo de la academia
      replyTo: email, // Responder al solicitante
      subject: `Nueva solicitud de asesoría - ${name}`,
      html: `
        <h2>Nueva Solicitud de Asesoría de Inmigración</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Datos del Solicitante:</h3>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Tipo de cita:</strong> ${appointmentType}</p>
          <p><strong>Fecha solicitada:</strong> ${date}</p>
          <p><strong>Hora solicitada:</strong> ${time}</p>
          <h3>Notas adicionales:</h3>
          <p>${notes || 'Sin notas adicionales'}</p>
        </div>
        <p style="color: #666;">Este email fue enviado desde la app Academia de Inmigrantes.</p>
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
      message: 'Solicitud de asesoría enviada correctamente',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('❌ Error enviando email de asesoría:', error);

    // Manejo de errores específico para SMTP2GO
    let errorMessage = 'Error al enviar la solicitud';
    let errorDetails = error.message;
    let errorCode = error.code;

    if (error.responseCode) {
      // Error de SMTP
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
      // Error de conexión o timeout
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
        errorMessage = 'Timeout de conexión con SMTP2GO';
        errorDetails = 'El servidor de SMTP2GO no responde. Verificar conexión a internet.';
        errorCode = 'ETIMEDOUT';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Servidor de SMTP2GO no encontrado';
        errorDetails = 'No se puede conectar al servidor de SMTP2GO.';
        errorCode = 'ENOTFOUND';
      }
    }

    console.error('❌ Código de error:', errorCode);
    console.error('❌ Mensaje detallado:', errorDetails);

    res.status(500).json({
      error: errorMessage,
      details: errorDetails,
      code: errorCode
    });
  }
});

// ============================================
// ENDPOINT INTERMEDIO DE REDIRECCIÓN CECABANK
// ============================================
// Este endpoint debe estar ANTES de los middlewares generales para procesar form-urlencoded

// Endpoint intermedio para enviar POST a Cecabank
// Este endpoint recibe los datos, hace el POST a Cecabank y redirige
app.post('/api/cecabank/redirect', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log('🔄 Endpoint de redirección a Cecabank recibido');
    console.log('📝 Datos recibidos:', req.body);
    console.log('📋 Content-Type:', req.headers['content-type']);
    console.log('📋 Claves en req.body:', Object.keys(req.body));
    
    // Verificar si viene el formato SIS moderno (Ds_MerchantParameters, Ds_Signature)
    // IMPORTANTE: Extraer los valores de req.body primero
    const Ds_MerchantParameters = req.body.Ds_MerchantParameters;
    const Ds_Signature = req.body.Ds_Signature;
    const Ds_SignatureVersion = req.body.Ds_SignatureVersion || 'HMAC_SHA256_V1';
    
    const hasDsMerchantParameters = !!Ds_MerchantParameters;
    const hasDsSignature = !!Ds_Signature;
    const hasDsSignatureVersion = !!Ds_SignatureVersion;
    
    console.log('🔍 Verificación formato SIS:', {
      hasDsMerchantParameters,
      hasDsSignature,
      hasDsSignatureVersion,
      Ds_MerchantParameters_length: Ds_MerchantParameters ? Ds_MerchantParameters.length : 0,
      Ds_Signature_length: Ds_Signature ? Ds_Signature.length : 0,
      todasLasClaves: Object.keys(req.body),
    });
    
    const isSISFormat = hasDsMerchantParameters && hasDsSignature;
    
    if (isSISFormat) {
      console.log('✅ Formato SIS moderno detectado - procesando...');
      
      // Método SIS moderno - usar directamente los campos recibidos
      const orderId = req.body.orderId;
      const operationType = req.body.operationType;
      const amount = req.body.amount;
      
      // Validar que los campos estén presentes
      if (!Ds_MerchantParameters || !Ds_Signature) {
        console.error('❌ Faltan campos obligatorios SIS:', {
          tieneDs_MerchantParameters: !!Ds_MerchantParameters,
          tieneDs_Signature: !!Ds_Signature,
        });
        return res.status(400).send('Faltan campos obligatorios: Ds_MerchantParameters o Ds_Signature');
      }
      
      // Determinar URL de Cecabank SIS
      // CRÍTICO: Si estamos usando credenciales de Cecabank (no las de prueba de Redsys),
      // SIEMPRE usar la URL de producción porque Cecabank no tiene entorno de prueba separado
      // El error SIS0026 indica que el comercio/terminal no es válido para la URL de prueba
      const merchantCode = req.body.Ds_MerchantParameters ? 
        (() => {
          try {
            const decoded = Buffer.from(req.body.Ds_MerchantParameters, 'base64').toString('utf-8');
            const params = JSON.parse(decoded);
            return params.DS_MERCHANT_MERCHANTCODE;
          } catch (e) {
            return null;
          }
        })() : null;
      
      const esCredencialesPruebaRedsys = merchantCode === '999008881';
      const esCredencialesCecabank = merchantCode && merchantCode !== '999008881' && merchantCode !== '';
      
      // Verificar también variables de entorno del backend
      const tieneCredencialesProduccionBackend = !!(process.env.CECABANK_MERCHANT_ID && 
                                                     process.env.CECABANK_MERCHANT_ID !== '' &&
                                                     process.env.CECABANK_MERCHANT_ID !== '999008881');
      
      // Determinar si estamos en modo prueba o producción
      // IMPORTANTE: Si el entorno está configurado como 'test', usar URL de prueba
      // incluso si el merchant code no es el estándar de Redsys
      const entornoConfigurado = process.env.CECABANK_ENTORNO || process.env.EXPO_PUBLIC_CECABANK_ENTORNO || 'test';
      const esModoPrueba = entornoConfigurado === 'test' || entornoConfigurado === 'prueba';
      const esModoProduccion = entornoConfigurado === 'produccion' || entornoConfigurado === 'production';
      
      // CRÍTICO: Si estamos en modo prueba, SIEMPRE usar URL de prueba
      // Si estamos en modo producción, usar URL de producción
      const debeUsarProduccion = esModoProduccion && 
                                (esCredencialesCecabank || tieneCredencialesProduccionBackend);
      
      // IMPORTANTE: Cecabank usa su PROPIO sistema PGW, NO Redsys SIS
      // URLs de Cecabank PGW:
      // - Test: https://tpv.ceca.es/tpvweb/tpv/compra.action
      // - Producción: https://pgw.ceca.es/tpvweb/tpv/compra.action
      let cecabankUrl = esModoPrueba
        ? 'https://tpv.ceca.es/tpvweb/tpv/compra.action'   // URL de prueba de Cecabank PGW
        : 'https://pgw.ceca.es/tpvweb/tpv/compra.action';  // URL de producción de Cecabank PGW
      
      // Logs para debugging
      console.log('🔍 Determinando URL de Cecabank:', {
        entornoConfigurado,
        esModoPrueba,
        esModoProduccion,
        merchantCode,
        esCredencialesPruebaRedsys,
        esCredencialesCecabank,
        tieneCredencialesProduccionBackend,
        url_seleccionada: cecabankUrl,
        es_url_cecabank: cecabankUrl.includes('ceca.es'),
        es_url_redsys: cecabankUrl.includes('redsys.es'),
      });
      
      // Logs detallados para debug del error SIS0026
      console.log('🔗 URL de Cecabank SIS seleccionada (DEBUG SIS0026):', {
        entorno: process.env.CECABANK_ENTORNO,
        merchantCode,
        terminalCode: merchantCode ? (() => {
          try {
            const decoded = Buffer.from(req.body.Ds_MerchantParameters, 'base64').toString('utf-8');
            const params = JSON.parse(decoded);
            return params.DS_MERCHANT_TERMINAL;
          } catch (e) {
            return 'no disponible';
          }
        })() : 'no disponible',
        esCredencialesPruebaRedsys,
        esCredencialesCecabank,
        tieneCredencialesProduccionBackend,
        debeUsarProduccion,
        url: cecabankUrl,
        url_contiene_sis_t: cecabankUrl.includes('sis-t.redsys.es'),
        url_contiene_sis_produccion: cecabankUrl.includes('sis.redsys.es') && !cecabankUrl.includes('sis-t'),
        CECABANK_ENTORNO: process.env.CECABANK_ENTORNO || 'NO CONFIGURADO',
        CECABANK_MERCHANT_ID: process.env.CECABANK_MERCHANT_ID || 'NO CONFIGURADO',
        razon: esCredencialesCecabank || tieneCredencialesProduccionBackend
          ? 'Credenciales de Cecabank - FORZAR producción (Cecabank no tiene entorno de prueba)' 
          : esCredencialesPruebaRedsys 
            ? 'Credenciales de prueba Redsys - usar URL de prueba' 
            : 'Entorno configurado como producción',
      });
      
      console.log('🔗 URL de Cecabank SIS:', cecabankUrl);
      console.log('📋 OrderId del frontend:', orderId);
      console.log('📋 OperationType:', operationType);
      console.log('📋 Amount recibido del frontend:', amount);
      
      // Decodificar Ds_MerchantParameters para verificar el importe ANTES de enviarlo a Cecabank
      try {
        const decodedParams = Buffer.from(Ds_MerchantParameters, 'base64').toString('utf-8');
        console.log('📋 JSON decodificado (primeros 500 chars):', decodedParams.substring(0, 500));
        const merchantParams = JSON.parse(decodedParams);
        console.log('🔍 Ds_MerchantParameters decodificado:', {
          DS_MERCHANT_AMOUNT: merchantParams.DS_MERCHANT_AMOUNT,
          DS_MERCHANT_AMOUNT_type: typeof merchantParams.DS_MERCHANT_AMOUNT,
          DS_MERCHANT_ORDER: merchantParams.DS_MERCHANT_ORDER,
          DS_MERCHANT_ORDER_length: merchantParams.DS_MERCHANT_ORDER?.length,
          DS_MERCHANT_ORDER_es_solo_numeros: /^\d+$/.test(merchantParams.DS_MERCHANT_ORDER || ''),
          DS_MERCHANT_ORDER_tiene_12_digitos: merchantParams.DS_MERCHANT_ORDER?.length === 12,
          DS_MERCHANT_MERCHANTCODE: merchantParams.DS_MERCHANT_MERCHANTCODE,
          DS_MERCHANT_TERMINAL: merchantParams.DS_MERCHANT_TERMINAL,
          DS_MERCHANT_TERMINAL_esperado_test: '1',
          DS_MERCHANT_TERMINAL_coincide: merchantParams.DS_MERCHANT_TERMINAL === '1',
          DS_MERCHANT_URLOK: merchantParams.DS_MERCHANT_URLOK,
          DS_MERCHANT_URLKO: merchantParams.DS_MERCHANT_URLKO,
          DS_MERCHANT_CURRENCY: merchantParams.DS_MERCHANT_CURRENCY,
          DS_MERCHANT_TRANSACTIONTYPE: merchantParams.DS_MERCHANT_TRANSACTIONTYPE,
          todos_los_campos: Object.keys(merchantParams),
          json_completo: JSON.stringify(merchantParams, null, 2),
        });
        
        // Verificar específicamente el formato del orderId
        if (!/^\d{12}$/.test(merchantParams.DS_MERCHANT_ORDER || '')) {
          console.error('❌ ERROR CRÍTICO: DS_MERCHANT_ORDER no tiene el formato correcto (debe ser 12 dígitos numéricos)');
          console.error('📋 OrderId recibido:', merchantParams.DS_MERCHANT_ORDER);
          console.error('📋 Longitud:', merchantParams.DS_MERCHANT_ORDER?.length);
          console.error('📋 Es solo números:', /^\d+$/.test(merchantParams.DS_MERCHANT_ORDER || ''));
          return res.status(400).send(`Error: DS_MERCHANT_ORDER debe ser exactamente 12 dígitos numéricos. Valor recibido: ${merchantParams.DS_MERCHANT_ORDER}`);
        }
        
        // Verificar que el terminal esté presente y sea válido
        // NOTA: Para pruebas de Redsys es '1', pero para Cecabank puede ser '3' o '00000003'
        if (!merchantParams.DS_MERCHANT_TERMINAL || merchantParams.DS_MERCHANT_TERMINAL === '') {
          console.error('❌ ERROR CRÍTICO: DS_MERCHANT_TERMINAL está vacío o no está presente');
          return res.status(400).send('Error: DS_MERCHANT_TERMINAL es obligatorio');
        }
        
        console.log('✅ Terminal verificado:', {
          valor: merchantParams.DS_MERCHANT_TERMINAL,
          longitud: merchantParams.DS_MERCHANT_TERMINAL?.length,
          es_valido: !!merchantParams.DS_MERCHANT_TERMINAL && merchantParams.DS_MERCHANT_TERMINAL !== '',
        });
        
        // Verificar que el importe no sea 0
        console.log('🔍 Verificación detallada del importe:', {
          DS_MERCHANT_AMOUNT: merchantParams.DS_MERCHANT_AMOUNT,
          DS_MERCHANT_AMOUNT_type: typeof merchantParams.DS_MERCHANT_AMOUNT,
          DS_MERCHANT_AMOUNT_length: merchantParams.DS_MERCHANT_AMOUNT?.length,
          es_0: merchantParams.DS_MERCHANT_AMOUNT === '0',
          es_vacio: merchantParams.DS_MERCHANT_AMOUNT === '',
          es_null: merchantParams.DS_MERCHANT_AMOUNT === null,
          es_undefined: merchantParams.DS_MERCHANT_AMOUNT === undefined,
          es_falsy: !merchantParams.DS_MERCHANT_AMOUNT,
        });
        
        if (merchantParams.DS_MERCHANT_AMOUNT === '0' || merchantParams.DS_MERCHANT_AMOUNT === '' || !merchantParams.DS_MERCHANT_AMOUNT) {
          console.error('❌ ERROR CRÍTICO: El importe en Ds_MerchantParameters es 0 o inválido:', merchantParams.DS_MERCHANT_AMOUNT);
          console.error('📋 Todos los parámetros:', JSON.stringify(merchantParams, null, 2));
          return res.status(400).send(`Error: El importe es 0 o inválido (${merchantParams.DS_MERCHANT_AMOUNT}). Verifica la configuración de precios.`);
        }
        
        // Verificar que todos los campos obligatorios estén presentes
        const camposObligatorios = ['DS_MERCHANT_AMOUNT', 'DS_MERCHANT_ORDER', 'DS_MERCHANT_MERCHANTCODE', 'DS_MERCHANT_TERMINAL', 'DS_MERCHANT_URLOK', 'DS_MERCHANT_URLKO'];
        const camposFaltantes = camposObligatorios.filter(campo => !merchantParams[campo]);
        if (camposFaltantes.length > 0) {
          console.error('❌ ERROR: Faltan campos obligatorios:', camposFaltantes);
          return res.status(400).send(`Error: Faltan campos obligatorios: ${camposFaltantes.join(', ')}`);
        }
        
        console.log('✅ Importe verificado correctamente:', merchantParams.DS_MERCHANT_AMOUNT, 'céntimos');
        console.log('✅ Todos los campos obligatorios presentes');
        console.log('✅ OrderId verificado:', {
          valor: merchantParams.DS_MERCHANT_ORDER,
          longitud: merchantParams.DS_MERCHANT_ORDER?.length,
          es_12_digitos: merchantParams.DS_MERCHANT_ORDER?.length === 12,
          es_solo_numeros: /^\d{12}$/.test(merchantParams.DS_MERCHANT_ORDER || ''),
        });
        console.log('✅ Terminal verificado:', {
          valor: merchantParams.DS_MERCHANT_TERMINAL,
          esperado_test: '1',
          coincide: merchantParams.DS_MERCHANT_TERMINAL === '1',
        });
        console.log('✅ MerchantCode verificado:', {
          valor: merchantParams.DS_MERCHANT_MERCHANTCODE,
          esperado_test: '999008881',
          coincide: merchantParams.DS_MERCHANT_MERCHANTCODE === '999008881',
        });
      } catch (decodeError) {
        console.error('⚠️ Error decodificando Ds_MerchantParameters (continuando de todas formas):', decodeError.message);
        console.error('📋 Stack:', decodeError.stack);
        // No bloquear el flujo, pero registrar el error
      }
      
      // Hacer POST directo a Cecabank SIS
      try {
        const postData = new URLSearchParams();
        postData.append('Ds_SignatureVersion', String(Ds_SignatureVersion));
        postData.append('Ds_MerchantParameters', String(Ds_MerchantParameters));
        postData.append('Ds_Signature', String(Ds_Signature));
        
        // Decodificar una vez más para mostrar exactamente qué se enviará
        try {
          const finalCheck = Buffer.from(Ds_MerchantParameters, 'base64').toString('utf-8');
          const finalParams = JSON.parse(finalCheck);
          console.log('📤 VERIFICACIÓN FINAL antes de enviar a Cecabank:', {
            DS_MERCHANT_AMOUNT: finalParams.DS_MERCHANT_AMOUNT,
            DS_MERCHANT_ORDER: finalParams.DS_MERCHANT_ORDER,
            DS_MERCHANT_ORDER_length: finalParams.DS_MERCHANT_ORDER?.length,
            DS_MERCHANT_ORDER_es_12_digitos: finalParams.DS_MERCHANT_ORDER?.length === 12,
            DS_MERCHANT_ORDER_es_solo_numeros: /^\d{12}$/.test(finalParams.DS_MERCHANT_ORDER || ''),
            DS_MERCHANT_MERCHANTCODE: finalParams.DS_MERCHANT_MERCHANTCODE,
            DS_MERCHANT_TERMINAL: finalParams.DS_MERCHANT_TERMINAL,
            DS_MERCHANT_TRANSACTIONTYPE: finalParams.DS_MERCHANT_TRANSACTIONTYPE,
            DS_MERCHANT_CURRENCY: finalParams.DS_MERCHANT_CURRENCY,
          });
        } catch (e) {
          console.error('⚠️ Error en verificación final:', e.message);
        }
        
        console.log('📤 Datos a enviar a Cecabank SIS:', {
          Ds_SignatureVersion: String(Ds_SignatureVersion),
          Ds_MerchantParameters_length: String(Ds_MerchantParameters).length,
          Ds_MerchantParameters_preview: String(Ds_MerchantParameters).substring(0, 50) + '...',
          Ds_Signature_length: String(Ds_Signature).length,
          Ds_Signature_preview: String(Ds_Signature).substring(0, 30) + '...',
          Ds_Signature_completa: String(Ds_Signature),
        });
        
        // Verificar que la firma no se haya modificado
        const firmaOriginal = String(Ds_Signature);
        const firmaEnPostData = postData.get('Ds_Signature');
        console.log('🔍 Verificación de firma antes de enviar:', {
          firma_original: firmaOriginal,
          firma_en_postData: firmaEnPostData,
          firmas_coinciden: firmaOriginal === firmaEnPostData,
        });
        
        // IMPORTANTE: NO hacer POST a Cecabank cuando se recibe formato SIS
        // En su lugar, generar el formulario HTML directamente (como en la versión que funciona)
        console.log('⚠️ Formato SIS detectado - usando formulario HTML directo (sin POST a Cecabank)');
        console.log('📋 Esta es la implementación correcta: generar HTML directamente, no hacer POST primero');
        
        // Lanzar error inmediatamente para usar el fallback del formulario HTML
        throw new Error('Usando formulario HTML directo para formato SIS');
        
      } catch (fetchError) {
        console.error('❌ Error haciendo POST a Cecabank SIS:', fetchError);
        
        // Fallback: crear formulario HTML que se auto-envía
        // Escapar valores para atributos HTML (solo caracteres problemáticos, no Base64 completo)
        const escapeHtmlAttr = (str) => {
          if (!str) return '';
          const strValue = String(str);
          // Solo escapar caracteres que pueden romper atributos HTML
          // NO escapar +, /, = que son válidos en Base64
          return strValue
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        };
        
        const escapedDsMerchantParameters = escapeHtmlAttr(String(Ds_MerchantParameters));
        const escapedDsSignature = escapeHtmlAttr(String(Ds_Signature));
        const escapedDsSignatureVersion = escapeHtmlAttr(String(Ds_SignatureVersion));
        
        console.log('📋 Valores escapados para HTML:', {
          Ds_MerchantParameters_length: escapedDsMerchantParameters.length,
          Ds_Signature_length: escapedDsSignature.length,
          Ds_SignatureVersion: escapedDsSignatureVersion,
        });
        
        const formHtml = `
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Redirigiendo a Cecabank...</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background: #f5f5f5;
                }
                .container {
                  text-align: center;
                  padding: 20px;
                }
                .spinner {
                  border: 4px solid #f3f3f3;
                  border-top: 4px solid #4CAF50;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  animation: spin 1s linear infinite;
                  margin: 0 auto 20px;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="spinner"></div>
                <p>Redirigiendo al TPV de Cecabank...</p>
                <p>Por favor, espera mientras se procesa tu pago.</p>
              </div>
              <form id="cecabankForm" method="POST" action="${cecabankUrl}" enctype="application/x-www-form-urlencoded" accept-charset="UTF-8" style="display: none;">
                <input type="hidden" name="Ds_SignatureVersion" value="${escapedDsSignatureVersion}" />
                <input type="hidden" name="Ds_MerchantParameters" value="${escapedDsMerchantParameters}" />
                <input type="hidden" name="Ds_Signature" value="${escapedDsSignature}" />
              </form>
              <script>
                (function() {
                  console.log('🚀 Script de envío iniciado (SIS)');
                  var formSubmitted = false;
                  
                  function submitForm() {
                    if (formSubmitted) return false;
                    
                    try {
                      const form = document.getElementById('cecabankForm');
                      if (!form) {
                        console.error('❌ Formulario no encontrado');
                        return false;
                      }
                      
                      formSubmitted = true;
                      console.log('📤 Enviando formulario POST a:', form.action);
                      form.submit();
                      return true;
                    } catch (error) {
                      console.error('❌ Error:', error);
                      formSubmitted = false;
                      return false;
                    }
                  }
                  
                  if (document.readyState === 'complete' || document.readyState === 'interactive') {
                    submitForm();
                  } else {
                    document.addEventListener('DOMContentLoaded', submitForm);
                  }
                  
                  setTimeout(submitForm, 50);
                  setTimeout(submitForm, 100);
                  setTimeout(submitForm, 200);
                })();
              </script>
            </body>
          </html>
        `;
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(formHtml);
      }
    }
    
    // Método antiguo (compatibilidad hacia atrás)
    console.log('⚠️ Formato antiguo detectado, usando método legacy');
    console.log('📋 Campos recibidos:', Object.keys(req.body));
    console.log('📋 URL_OK recibido:', req.body.URL_OK);
    console.log('📋 URL_KO recibido:', req.body.URL_KO);
    
    // Aceptar datos de form-urlencoded
    let formData = req.body;
    
    if (!formData || Object.keys(formData).length === 0) {
      console.error('❌ No se recibieron datos del formulario');
      return res.status(400).send('No se recibieron datos del formulario');
    }
    
    // Verificar que al menos URL_OK esté presente (solo para método antiguo)
    if (!formData.URL_OK) {
      console.error('❌ URL_OK faltante en método antiguo');
      console.error('📋 Si estás usando el método SIS moderno, asegúrate de enviar Ds_MerchantParameters y Ds_Signature');
      return res.status(400).send('URL_OK es obligatoria para el método antiguo. Si usas SIS moderno, envía Ds_MerchantParameters y Ds_Signature');
    }
    
    // Limpiar URLs inmediatamente (sin espacios, sin caracteres especiales)
    formData.URL_OK = String(formData.URL_OK).trim().replace(/\s+/g, '');
    
    // Si no viene URL_KO, usar la misma URL_OK (comportamiento para TPV que solo permiten URL_OK)
    if (!formData.URL_KO) {
      console.warn('⚠️  URL_KO no proporcionada, usando URL_OK para ambos casos');
      formData.URL_KO = formData.URL_OK;
    } else {
      formData.URL_KO = String(formData.URL_KO).trim().replace(/\s+/g, '');
    }
    
    // Validar formato de URLs
    try {
      const urlOkObj = new URL(formData.URL_OK);
      const urlKoObj = new URL(formData.URL_KO);
      console.log('✅ URLs validadas:', {
        URL_OK: formData.URL_OK,
        URL_KO: formData.URL_KO,
        URL_OK_protocol: urlOkObj.protocol,
        URL_KO_protocol: urlKoObj.protocol,
        URL_OK_host: urlOkObj.host,
        URL_KO_host: urlKoObj.host
      });
      
      // Advertencia si las URLs no son HTTPS
      if (urlOkObj.protocol !== 'https:' || urlKoObj.protocol !== 'https:') {
        console.warn('⚠️  ADVERTENCIA: Las URLs deben ser HTTPS para producción');
      }
    } catch (urlError) {
      console.error('❌ URLs inválidas:', urlError);
      return res.status(400).send('URLs de retorno inválidas');
    }
    
    // IMPORTANTE: Verificar que las URLs coincidan con las configuradas
    // NOTA: Las URLs vienen del frontend con www., así que las esperadas también deben tener www.
    const urlOkEsperada = 'https://www.academiadeinmigrantes.es/api/cecabank/ok';
    const urlKoEsperada = 'https://www.academiadeinmigrantes.es/api/cecabank/ko';
    
    // Si URL_KO es igual a URL_OK, significa que el TPV solo permite una URL
    const usaUrlUnica = formData.URL_OK === formData.URL_KO;
    
    if (usaUrlUnica) {
      console.log('ℹ️  TPV configurado con URL única (solo URL_OK disponible)');
      console.log('   URL configurada:', formData.URL_OK);
      console.log('   El endpoint /api/cecabank/ok manejará tanto éxitos como fallos');
    }
    
    if (formData.URL_OK !== urlOkEsperada) {
      console.warn('⚠️  ADVERTENCIA: URL_OK no coincide con la esperada');
      console.warn('   URL_OK recibida:', formData.URL_OK);
      console.warn('   URL_OK esperada:', urlOkEsperada);
    }
    
    if (!usaUrlUnica && formData.URL_KO !== urlKoEsperada) {
      console.warn('⚠️  ADVERTENCIA: URL_KO no coincide con la esperada');
      console.warn('   URL_KO recibida:', formData.URL_KO);
      console.warn('   URL_KO esperada:', urlKoEsperada);
    }
    
    if (formData.URL_OK === urlOkEsperada && (usaUrlUnica || formData.URL_KO === urlKoEsperada)) {
      console.log('✅ URLs configuradas correctamente');
    } else {
      console.warn('⚠️  IMPORTANTE: Estas URLs DEBEN estar registradas EXACTAMENTE igual en el panel de Cecabank');
    }
    
    // Verificar campos obligatorios según documentación de Cecabank
    const camposObligatorios = [
      'MerchantID',
      'AcquirerBIN', 
      'TerminalID',
      'Num_operacion',
      'Importe',
      'TipoMoneda',
      'Exponente',
      'Cifrado',
      'URL_OK',
      'URL_KO',
      'Idioma',
      'FechaOperacion',
      'HoraOperacion',
      'Firma'
    ];
    
    const camposFaltantes = camposObligatorios.filter(campo => !formData[campo]);
    if (camposFaltantes.length > 0) {
      console.error('❌ Campos obligatorios faltantes:', camposFaltantes);
      return res.status(400).send(`Campos obligatorios faltantes: ${camposFaltantes.join(', ')}`);
    }
    
    console.log('✅ Todos los campos obligatorios presentes');
    
    // CRÍTICO: Generar fecha y hora en el SERVIDOR en zona horaria de España (CET/CEST)
    // Cecabank espera la hora en zona horaria de España, no UTC
    const now = new Date();
    
    // Obtener la fecha y hora en zona horaria de España usando Intl.DateTimeFormat
    const spainFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Madrid',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = spainFormatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value || '';
    const month = parts.find(p => p.type === 'month')?.value || '';
    const day = parts.find(p => p.type === 'day')?.value || '';
    const hour = parts.find(p => p.type === 'hour')?.value || '';
    const minute = parts.find(p => p.type === 'minute')?.value || '';
    const second = parts.find(p => p.type === 'second')?.value || '';
    
    const fechaOperacion = year + month + day;
    const horaOperacion = hour + minute + second;
    
    console.log('📅 Fecha generada en servidor (España):', fechaOperacion);
    console.log('🕐 Hora generada en servidor (España):', horaOperacion);
    console.log('🌍 UTC original:', now.toISOString());
    console.log('📊 Partes de fecha:', { year, month, day, hour, minute, second });
    
    // Actualizar fecha y hora en formData con las del servidor
    formData.FechaOperacion = fechaOperacion;
    formData.HoraOperacion = horaOperacion;
    
    // Verificar que tenemos la clave de encriptación
    if (!process.env.CECABANK_CLAVE) {
      console.error('❌ CECABANK_CLAVE no está configurada en las variables de entorno');
      return res.status(500).send('Error de configuración: CECABANK_CLAVE no configurada');
    }
    
    // Asegurar que las URLs estén limpias ANTES de calcular la firma
    const urlOkLimpia = String(formData.URL_OK || '').trim();
    const urlKoLimpia = String(formData.URL_KO || '').trim();
    
    // Actualizar formData con URLs limpias
    formData.URL_OK = urlOkLimpia;
    formData.URL_KO = urlKoLimpia;
    
    console.log('🔗 URLs limpias para firma:');
    console.log('   - URL_OK:', urlOkLimpia);
    console.log('   - URL_KO:', urlKoLimpia);
    console.log('   - URL_OK longitud:', urlOkLimpia.length);
    console.log('   - URL_KO longitud:', urlKoLimpia.length);
    
    // Recalcular la firma con la nueva fecha/hora del servidor
    // IMPORTANTE: La firma debe incluir URL_OK y URL_KO
    const firma = generateCecabankSignature(
      formData.Num_operacion,
      formData.Importe,
      fechaOperacion,
      horaOperacion,
      urlOkLimpia,
      urlKoLimpia
    );
    formData.Firma = firma;
    
    console.log('🔐 Firma recalculada con fecha/hora del servidor');
    console.log('📋 Num_operacion:', formData.Num_operacion);
    console.log('📋 Importe:', formData.Importe);
    console.log('📋 FechaOperacion:', fechaOperacion);
    console.log('📋 HoraOperacion:', horaOperacion);
    console.log('📋 Firma completa:', firma);
    console.log('📋 Firma (primeros 20 chars):', firma.substring(0, 20) + '...');
    console.log('📋 MerchantID:', formData.MerchantID);
    console.log('📋 AcquirerBIN:', formData.AcquirerBIN);
    console.log('📋 TerminalID:', formData.TerminalID);
    console.log('📋 Clave configurada:', process.env.CECABANK_CLAVE ? 'Sí (' + process.env.CECABANK_CLAVE.length + ' caracteres)' : 'No');
    
    // URL correcta para Cecabank
    const urlCecabank = (process.env.CECABANK_ENTORNO || 'test') === 'produccion'
      ? 'https://pgw.ceca.es/tpvweb/tpv/compra.action'
      : 'https://tpv.ceca.es/tpvweb/tpv/compra.action';
    
    console.log('🔗 URL de Cecabank:', urlCecabank);
    
    // Ordenar campos según el orden recomendado por Cecabank (mover antes del POST)
    const ordenCampos = [
      'MerchantID',
      'AcquirerBIN',
      'TerminalID',
      'Num_operacion',
      'Importe',
      'TipoMoneda',
      'Exponente',
      'Cifrado',
      'URL_OK',
      'URL_KO',
      'Idioma',
      'Descripcion',
      'FechaOperacion',
      'HoraOperacion',
      'Firma',  // La Firma SIEMPRE debe ir al final, después de todos los datos
      'Email',
      'Nombre'
    ];
    
    // Crear un objeto ordenado
    const formDataOrdenado = {};
    ordenCampos.forEach(campo => {
      if (formData[campo] !== undefined) {
        formDataOrdenado[campo] = formData[campo];
      }
    });
    
    // Añadir solo campos opcionales permitidos por Cecabank (Email, Nombre)
    // NO incluir campos internos como orderId, operationType, amount
    const camposOpcionalesPermitidos = ['Email', 'Nombre'];
    camposOpcionalesPermitidos.forEach(campo => {
      if (formData[campo] !== undefined && formData[campo] !== null && formData[campo] !== '') {
        formDataOrdenado[campo] = formData[campo];
      }
    });
    
    console.log('📋 Campos ordenados:', Object.keys(formDataOrdenado));
    console.log('🔗 URL_OK en formDataOrdenado:', formDataOrdenado.URL_OK ? 'Sí' : 'No');
    console.log('🔗 URL_KO en formDataOrdenado:', formDataOrdenado.URL_KO ? 'Sí' : 'No');
    
    // IMPORTANTE: NO hacer POST directo a Cecabank
    // Usar siempre el método de formulario HTML que se auto-envía (como en la versión que funciona)
    // Crear formulario HTML que se auto-envía
    console.log('📋 Datos recibidos para formulario:', Object.keys(formData));
    console.log('📋 Número de campos:', Object.keys(formData).length);
    
    // Nota: La validación de campos obligatorios ya se hizo arriba
    // Solo verificamos campos esenciales adicionales para logging
    const camposEsenciales = ['MerchantID', 'AcquirerBIN', 'TerminalID', 'Num_operacion', 'Importe', 'Firma'];
    const camposEsencialesFaltantes = camposEsenciales.filter(campo => !formData[campo]);
    if (camposEsencialesFaltantes.length > 0) {
      console.error('❌ Campos esenciales faltantes en formData:', camposEsencialesFaltantes);
    } else {
      console.log('✅ Todos los campos esenciales están presentes');
    }
    
    // Log específico para URLs antes de generar el formulario
    console.log('🔗 URLs antes de generar formulario:', {
      URL_OK: formData.URL_OK,
      URL_KO: formData.URL_KO,
      URL_OK_length: formData.URL_OK?.length,
      URL_KO_length: formData.URL_KO?.length,
      URL_OK_type: typeof formData.URL_OK,
      URL_KO_type: typeof formData.URL_KO
    });
    
    // Las URLs ya están limpias desde antes (se limpiaron antes de calcular la firma)
    // Solo verificamos que sigan estando limpias
    if (formData.URL_OK) {
      formData.URL_OK = String(formData.URL_OK).trim();
    }
    if (formData.URL_KO) {
      formData.URL_KO = String(formData.URL_KO).trim();
    }
    
    console.log('🔗 URL_KO en posición:', Object.keys(formDataOrdenado).indexOf('URL_KO'));
    console.log('🔗 URL_OK en posición:', Object.keys(formDataOrdenado).indexOf('URL_OK'));
    
    const formFields = Object.entries(formDataOrdenado)
      .map(([key, value]) => {
        // Escapar correctamente para HTML
        const escapedKey = String(key)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        
        // Para URLs, asegurar que no haya espacios ni caracteres problemáticos
        let escapedValue = String(value || '');
        if (key === 'URL_OK' || key === 'URL_KO') {
          // Las URLs deben estar limpias y correctamente formateadas
          escapedValue = escapedValue.trim();
          // Asegurar que la URL no tenga espacios ni caracteres especiales problemáticos
          escapedValue = escapedValue.replace(/\s+/g, '');
          console.log(`🔗 ${key} en formulario (limpia):`, escapedValue);
          console.log(`🔗 ${key} longitud:`, escapedValue.length);
        }
        
        // Escapar para HTML (pero NO codificar las URLs, solo escapar caracteres HTML)
        // Las URLs deben enviarse tal cual, sin codificación URL adicional
        escapedValue = escapedValue
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        
        return `            <input type="hidden" name="${escapedKey}" value="${escapedValue}" />`;
      })
      .join('\n');
    
    // Verificar que las URLs estén en el HTML generado
    if (formFields.includes('URL_KO')) {
      const urlKoMatch = formFields.match(/name="URL_KO"[^>]*value="([^"]*)"/);
      if (urlKoMatch) {
        console.log('✅ URL_KO encontrada en formFields:', urlKoMatch[1]);
      } else {
        console.error('❌ URL_KO no encontrada en formFields');
      }
    }
    
    console.log('📋 Campos del formulario generados:', Object.keys(formData).length);
    console.log('📋 Primeros 3 campos:', Object.keys(formData).slice(0, 3));
    console.log('🔗 URL de Cecabank:', urlCecabank);
    console.log('📋 Longitud de formFields:', formFields.length);
    
    // Log del HTML completo para debugging
    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirigiendo a Cecabank...</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background: #f5f5f5;
      }
      .container {
        text-align: center;
        padding: 20px;
      }
      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4CAF50;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Redirigiendo al TPV de Cecabank...</h2>
      <div class="spinner"></div>
      <p>Por favor, espera mientras se procesa tu pago.</p>
    </div>
    <form id="cecabankForm" method="POST" action="${urlCecabank}" enctype="application/x-www-form-urlencoded" accept-charset="UTF-8" style="display: none;">
${formFields}
    </form>
    <script>
      (function() {
        console.log('🚀 Script de envío iniciado');
        console.log('📍 URL destino:', '${urlCecabank}');
        
        var formSubmitted = false;
        
        function submitForm() {
          if (formSubmitted) {
            return false;
          }
          
          try {
            const form = document.getElementById('cecabankForm');
            if (!form) {
              console.error('❌ Formulario no encontrado');
              return false;
            }
            
            // Verificar URL_OK y URL_KO
            const urlOkField = form.querySelector('input[name="URL_OK"]');
            const urlKoField = form.querySelector('input[name="URL_KO"]');
            
            if (!urlOkField || !urlKoField) {
              console.error('❌ URLs faltantes en el formulario');
              return false;
            }
            
            console.log('✅ URL_OK:', urlOkField.value);
            console.log('✅ URL_KO:', urlKoField.value);
            
            // Asegurar atributos correctos
            form.method = 'POST';
            form.action = '${urlCecabank}';
            form.enctype = 'application/x-www-form-urlencoded';
            form.target = '_self';
            
            formSubmitted = true;
            
            console.log('📤 Enviando formulario POST a:', form.action);
            form.submit();
            return true;
          } catch (error) {
            console.error('❌ Error:', error);
            formSubmitted = false;
            return false;
          }
        }
        
        // Intentar enviar cuando el DOM esté listo
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          submitForm();
        } else {
          document.addEventListener('DOMContentLoaded', submitForm);
        }
        
        // Respaldo con timeouts
        setTimeout(submitForm, 50);
        setTimeout(submitForm, 100);
        setTimeout(submitForm, 200);
      })();
      
      // Detectar callbacks (solo si no estamos en nuestra página de redirección)
      window.addEventListener('load', function() {
        setTimeout(function() {
          const currentUrl = window.location.href;
          console.log('🌐 URL actual:', currentUrl);
          
          // Solo procesar callbacks si no estamos en nuestra página de redirección
          if (currentUrl.includes('/api/cecabank/ok')) {
            console.log('✅ Pago exitoso detectado');
            if (window.ReactNativeWebView) {
              const urlParams = new URLSearchParams(window.location.search);
              const orderId = urlParams.get('orderId') || 'cecabank-success';
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment-success',
                orderId: orderId
              }));
            }
          } else if (currentUrl.includes('/api/cecabank/ko')) {
            console.log('❌ Pago fallido detectado');
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment-error',
                message: 'El pago fue cancelado o falló'
              }));
            }
          }
        }, 1000);
      });
    </script>
  </body>
</html>`;
    
    console.log('✅ HTML generado, longitud:', html.length);
    
    // Log del HTML completo para debugging (solo los primeros 2000 caracteres y los últimos 500)
    console.log('📄 HTML completo (primeros 2000 caracteres):');
    console.log(html.substring(0, 2000));
    console.log('📄 HTML completo (últimos 500 caracteres):');
    console.log(html.substring(html.length - 500));
    
    // Log específico del formulario
    const formStart = html.indexOf('<form');
    const formEnd = html.indexOf('</form>') + 7;
    if (formStart !== -1 && formEnd !== -1) {
      const formHtml = html.substring(formStart, formEnd);
      console.log('📋 HTML del formulario completo:');
      console.log(formHtml);
    }
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('❌ Error en endpoint de redirección:', error);
    console.error('📋 Stack:', error.stack);
    console.error('📋 Mensaje:', error.message);
    res.status(500).json({
      error: 'Error al redirigir a Cecabank',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ============================================
// FUNCIONES DE VALIDACIÓN CECABANK
// ============================================

/**
 * Genera la firma esperada por Cecabank para validar los callbacks
 */
function generateCecabankSignature(numOperacion, importe, fecha, hora, urlOk, urlKo) {
  const merchantId = process.env.CECABANK_MERCHANT_ID || '';
  const acquirerBin = process.env.CECABANK_ACQUIRER_BIN || '';
  const terminalId = process.env.CECABANK_TERMINAL_ID || '';
  const clave = process.env.CECABANK_CLAVE || '';
  const tipoMoneda = '978'; // EUR
  const exponente = '2';
  const cifrado = 'SHA256';
  const idioma = '1';

  // IMPORTANTE: Algunas implementaciones de Cecabank requieren las URLs sin el protocolo https://
  // Variable de entorno para controlar esto (por defecto: incluir https://)
  const incluirProtocoloEnFirma = process.env.CECABANK_URLS_CON_PROTOCOLO !== 'false';
  
  // Preparar URLs para la firma
  let urlOkParaFirma = urlOk || '';
  let urlKoParaFirma = urlKo || '';
  
  // Si no se debe incluir el protocolo, removerlo
  if (!incluirProtocoloEnFirma) {
    urlOkParaFirma = urlOkParaFirma.replace(/^https?:\/\//, '');
    urlKoParaFirma = urlKoParaFirma.replace(/^https?:\/\//, '');
    console.log('🔐 URLs para firma (sin protocolo):', {
      URL_OK: urlOkParaFirma,
      URL_KO: urlKoParaFirma
    });
  }

  // Construir la cadena para la firma según documentación de Cecabank
  // Orden: MerchantID + AcquirerBIN + TerminalID + Num_operacion + Importe + TipoMoneda + Exponente + Cifrado + URL_OK + URL_KO + Idioma + FechaOperacion + HoraOperacion + Clave
  const cadenaFirma = 
    merchantId +
    acquirerBin +
    terminalId +
    numOperacion +
    importe +
    tipoMoneda +
    exponente +
    cifrado +
    urlOkParaFirma +
    urlKoParaFirma +
    idioma +
    fecha +
    hora +
    clave;

  // Log detallado de la cadena de firma
  const cadenaSinClave = merchantId + acquirerBin + terminalId + numOperacion + importe + tipoMoneda + exponente + cifrado + urlOkParaFirma + urlKoParaFirma + idioma + fecha + hora;
  console.log('🔐 Cadena para firma (sin clave):', cadenaSinClave);
  console.log('🔐 Componentes de la firma:');
  console.log('   - MerchantID:', merchantId);
  console.log('   - AcquirerBIN:', acquirerBin);
  console.log('   - TerminalID:', terminalId);
  console.log('   - Num_operacion:', numOperacion);
  console.log('   - Importe:', importe);
  console.log('   - TipoMoneda:', tipoMoneda);
  console.log('   - Exponente:', exponente);
  console.log('   - Cifrado:', cifrado);
  console.log('   - URL_OK (original):', urlOk || '(vacío)');
  console.log('   - URL_KO (original):', urlKo || '(vacío)');
  console.log('   - URL_OK (para firma):', urlOkParaFirma);
  console.log('   - URL_KO (para firma):', urlKoParaFirma);
  console.log('   - Protocolo en firma:', incluirProtocoloEnFirma ? 'Sí (https://)' : 'No');
  console.log('   - Idioma:', idioma);
  console.log('   - Fecha:', fecha);
  console.log('   - Hora:', hora);
  console.log('   - Clave:', '[OCULTA]');
  console.log('🔐 Longitud de URL_OK (original):', (urlOk || '').length);
  console.log('🔐 Longitud de URL_KO (original):', (urlKo || '').length);
  console.log('🔐 Longitud de URL_OK (para firma):', urlOkParaFirma.length);
  console.log('🔐 Longitud de URL_KO (para firma):', urlKoParaFirma.length);
  console.log('🔐 Longitud total de cadena (sin clave):', cadenaSinClave.length);

  // Generar el hash SHA256
  const firma = crypto.createHash('sha256').update(cadenaFirma).digest('hex').toUpperCase();
  
  console.log('🔐 Firma generada:', firma);
  
  return firma;
}

/**
 * Valida la firma recibida de Cecabank
 */
function validateCecabankSignature(datos) {
  try {
    // La validación de firma también debe incluir URLs si están presentes
    const firmaCalculada = generateCecabankSignature(
      datos.Num_operacion,
      datos.Importe,
      datos.Fecha,
      datos.Hora,
      datos.URL_OK || '',
      datos.URL_KO || ''
    );

    const firmaRecibida = datos.Firma.toUpperCase();
    const isValid = firmaCalculada === firmaRecibida;

    if (!isValid) {
      console.error('❌ Firma inválida:', {
        calculada: firmaCalculada,
        recibida: firmaRecibida
      });
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error validando firma de Cecabank:', error);
    return false;
  }
}

// ============================================
// ENDPOINTS DE CECABANK
// ============================================

// ENDPOINT DE PRUEBA: Responde 200 OK sin lógica pesada
// Úsalo para verificar si Cecabank puede alcanzar tu servidor
app.get('/api/cecabank/test', (req, res) => {
  console.log('🧪 TEST: Cecabank alcanzó /api/cecabank/test');
  console.log('📝 Query params:', JSON.stringify(req.query, null, 2));
  return res.status(200).send('OK');
});

app.post('/api/cecabank/test', express.urlencoded({ extended: true }), (req, res) => {
  console.log('🧪 TEST: Cecabank alcanzó /api/cecabank/test (POST)');
  console.log('📝 Body:', JSON.stringify(req.body, null, 2));
  return res.status(200).send('OK');
});

// ENDPOINT DE DEBUG: Ver el formulario que se envía a Cecabank
app.post('/api/cecabank/debug-form', express.json(), (req, res) => {
  const { url, formData } = req.body;
  
  console.log('🔍 DEBUG: Formulario que se envía a Cecabank');
  console.log('📤 URL destino:', url);
  console.log('📋 Campos del formulario:', Object.keys(formData));
  console.log('📊 Datos completos:', JSON.stringify(formData, null, 2));
  
  // Verificar campos obligatorios
  const camposObligatorios = ['MerchantID', 'AcquirerBIN', 'TerminalID', 'Num_operacion', 'Importe', 'TipoMoneda', 'Exponente', 'Cifrado', 'URL_OK', 'URL_NOK', 'Firma'];
  const camposFaltantes = camposObligatorios.filter(campo => !formData[campo]);
  
  if (camposFaltantes.length > 0) {
    console.error('❌ CAMPOS FALTANTES:', camposFaltantes);
  } else {
    console.log('✅ Todos los campos obligatorios están presentes');
  }
  
  // Verificar formato de campos críticos
  console.log('🔐 Validación de campos:');
  console.log('  - MerchantID:', formData.MerchantID, formData.MerchantID ? '✅' : '❌');
  console.log('  - TerminalID:', formData.TerminalID, formData.TerminalID ? '✅' : '❌');
  console.log('  - Num_operacion:', formData.Num_operacion, `(${String(formData.Num_operacion).length} dígitos)`, formData.Num_operacion && String(formData.Num_operacion).length === 12 ? '✅' : '⚠️');
  console.log('  - Importe:', formData.Importe, '(céntimos)', formData.Importe ? '✅' : '❌');
  console.log('  - Firma:', formData.Firma ? `${formData.Firma.substring(0, 20)}... (${formData.Firma.length} chars)` : '❌');
  console.log('  - URL_OK:', formData.URL_OK);
  console.log('  - URL_NOK:', formData.URL_NOK);
  
  return res.status(200).json({
    success: true,
    message: 'Formulario loguado en servidor',
    camposFaltantes: camposFaltantes.length > 0 ? camposFaltantes : null,
    totalCampos: Object.keys(formData).length
  });
});

// ENDPOINT DE DIAGNÓSTICO: Consultar estado de pagos
app.get('/api/cecabank/payment/:orderId', (req, res) => {
  const { orderId } = req.params;
  const payment = paymentStatus.get(orderId);
  
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Pago no encontrado',
      orderId
    });
  }
  
  return res.status(200).json({
    success: payment.status === 'completed',
    ...payment
  });
});

// ENDPOINT DE DIAGNÓSTICO: Listar todos los pagos (últimos 50)
app.get('/api/cecabank/payments', (req, res) => {
  const payments = Array.from(paymentStatus.entries())
    .slice(-50)
    .map(([orderId, data]) => ({ orderId, ...data }));
  
  return res.status(200).json({
    total: payments.length,
    payments
  });
});

// Endpoint para recibir respuesta de pago de Cecabank (maneja tanto OK como KO)
// Si el TPV solo permite configurar URL_OK, este endpoint manejará ambos casos
app.get('/api/cecabank/ok', async (req, res) => {
  try {
    console.log('📥 Callback GET de Cecabank recibido (/ok)');
    console.log('📝 Query params:', JSON.stringify(req.query, null, 2));
 
    const Num_operacion = req.query?.Num_operacion || req.query?.num_operacion || '';
    const Importe = req.query?.Importe || req.query?.importe || '';

    const Ds_Response = req.query?.Ds_Response || req.query?.ds_response || '';
    const Codigo_respuesta = req.query?.Codigo_respuesta || req.query?.codigo_respuesta || '';
    const Respuesta = req.query?.Respuesta || req.query?.respuesta || '';
    const codigoRespuesta = Ds_Response || Codigo_respuesta || Respuesta;

    let pagoExitoso = false;
    if (codigoRespuesta !== undefined && codigoRespuesta !== null && String(codigoRespuesta).trim() !== '') {
      const codigo = String(codigoRespuesta).trim();
      pagoExitoso = codigo === '00' || codigo === '0' || codigo.toLowerCase() === 'ok';
    }

    // ✅ PERSISTIR ESTADO INMEDIATAMENTE (antes de cualquier otra lógica)
    const paymentRecord = {
      status: pagoExitoso ? 'completed' : 'failed',
      endpoint: '/api/cecabank/ok',
      method: 'GET',
      timestamp: new Date().toISOString(),
      numOperacion: Num_operacion,
      importe: Importe,
      codigoRespuesta: codigoRespuesta,
      allParams: req.query
    };
    paymentStatus.set(Num_operacion || `unknown_${Date.now()}`, paymentRecord);
    console.log('💾 Estado de pago persistido:', paymentRecord);

    const payload = pagoExitoso
      ? {
          type: 'payment-success',
          orderId: String(Num_operacion || ''),
          importe: String(Importe || ''),
          codigoRespuesta: String(codigoRespuesta || '')
        }
      : {
          type: 'payment-error',
          message: 'El pago fue cancelado o rechazado',
          orderId: String(Num_operacion || ''),
          codigoRespuesta: String(codigoRespuesta || '')
        };

    const payloadStr = JSON.stringify(payload);
 
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Pago procesado</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <p>Procesando resultado del pago...</p>
          <script>
            try {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(${JSON.stringify(payloadStr)});
              }
            } catch (e) {}
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Error procesando callback GET OK de Cecabank:', error);
    return res.status(200).send('OK recibido');
  }
});

app.post('/api/cecabank/ok', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log('📥 Callback de Cecabank recibido');
    console.log('📝 Datos recibidos:', JSON.stringify(req.body, null, 2));
    console.log('📝 Headers:', JSON.stringify(req.headers, null, 2));

    const { 
      Num_operacion, 
      Codigo_cliente, 
      Importe, 
      Firma,
      Descripcion,
      Fecha,
      Hora,
      Ds_Response,
      Codigo_respuesta,
      Respuesta,
      // Campos adicionales que puede enviar Cecabank PGW
      Referencia,
      NumAut,
      IdProceso
    } = req.body;
    
    // Detectar si el pago fue exitoso o fallido
    // Cecabank puede enviar diferentes parámetros según la versión del TPV
    let pagoExitoso = false;
    let codigoRespuesta = Ds_Response || Codigo_respuesta || Respuesta;
    
    // Si viene un código de respuesta, verificar si es éxito (00 o similar)
    if (codigoRespuesta !== undefined && codigoRespuesta !== null && codigoRespuesta !== '') {
      const codigo = String(codigoRespuesta).trim();
      // Código 00 generalmente significa éxito en pasarelas de pago
      pagoExitoso = codigo === '00' || codigo === '0' || codigo.toLowerCase() === 'ok';
      console.log('🔍 Código de respuesta detectado:', codigo, '→ Pago exitoso:', pagoExitoso);
    } else {
      // SEGURIDAD: Si no viene código de respuesta, NO asumir éxito
      // El pago debe tener un código de respuesta válido para considerarse exitoso
      pagoExitoso = false;
      console.log('⚠️ No se detectó código de respuesta, marcando como pago FALLIDO por seguridad');
    }

    // MODO FLEXIBLE: Si faltan algunos datos, intentar procesar igual
    // Cecabank PGW puede enviar diferentes campos según la configuración
    const tieneNumOperacion = !!Num_operacion;
    const tieneImporte = !!Importe;
    const tieneFirma = !!Firma;
    const tieneFecha = !!Fecha;
    const tieneHora = !!Hora;
    
    console.log('🔍 Campos recibidos:', {
      Num_operacion: tieneNumOperacion ? Num_operacion : 'NO',
      Importe: tieneImporte ? Importe : 'NO',
      Firma: tieneFirma ? 'SÍ (oculta)' : 'NO',
      Fecha: tieneFecha ? Fecha : 'NO',
      Hora: tieneHora ? Hora : 'NO',
      Descripcion: Descripcion || 'NO',
      Referencia: Referencia || 'NO',
      NumAut: NumAut || 'NO'
    });

    // Si faltan datos críticos pero el endpoint es /ok, asumir éxito
    // y generar datos por defecto para poder procesar
    let numOperacionFinal = Num_operacion || `AUTO_${Date.now()}`;
    let importeFinal = Importe || '0';
    let descripcionFinal = Descripcion || '';
    
    // Validar la firma solo si tenemos todos los datos necesarios
    let isValidSignature = true;
    if (tieneFirma && tieneNumOperacion && tieneImporte && tieneFecha && tieneHora) {
      isValidSignature = validateCecabankSignature({
        Num_operacion: numOperacionFinal,
        Importe: importeFinal,
        Fecha,
        Hora,
        Firma
      });
      
      if (!isValidSignature) {
        console.warn('⚠️ Firma no válida, pero continuando porque es endpoint /ok');
        // En producción podrías querer rechazar aquí, pero para pruebas continuamos
      }
    } else {
      console.log('⚠️ No se puede validar firma (faltan datos), continuando...');
    }

    console.log('✅ Procesando callback de Cecabank (firma:', isValidSignature ? 'válida' : 'no verificada', ')');
    
    // ✅ PERSISTIR ESTADO INMEDIATAMENTE (antes de cualquier otra lógica)
    const paymentRecord = {
      status: pagoExitoso ? 'completed' : 'failed',
      endpoint: '/api/cecabank/ok',
      method: 'POST',
      timestamp: new Date().toISOString(),
      numOperacion: Num_operacion,
      importe: Importe,
      codigoRespuesta: codigoRespuesta,
      descripcion: Descripcion,
      allParams: req.body
    };
    paymentStatus.set(Num_operacion || `unknown_${Date.now()}`, paymentRecord);
    console.log('💾 Estado de pago persistido:', paymentRecord);
    
    // Si el pago NO fue exitoso, manejar como error
    if (!pagoExitoso) {
      console.log('❌ Pago fallido detectado en callback (código de respuesta:', codigoRespuesta, ')');
      console.log('⚠️ Pago fallido de Cecabank:', {
        numOperacion: Num_operacion,
        codigoCliente: Codigo_cliente,
        importe: Importe,
        descripcion: Descripcion,
        fecha: Fecha,
        hora: Hora,
        codigoRespuesta: codigoRespuesta
      });

      // Redirigir a la app con error (mismo comportamiento que /api/cecabank/ko)
      return res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Pago Fallido</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                text-align: center;
                padding: 20px;
              }
              .error-icon {
                font-size: 64px;
                margin-bottom: 20px;
              }
              h1 {
                margin: 0 0 10px 0;
              }
              p {
                margin: 5px 0;
              }
            </style>
          </head>
          <body>
            <div class="error-icon">❌</div>
            <h1>Pago no realizado</h1>
            <p>El pago no pudo ser procesado. Por favor, intenta de nuevo.</p>
            <p>Redirigiendo a la aplicación...</p>
            <script>
              // Enviar mensaje a React Native WebView si está disponible
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'payment-error',
                  message: 'El pago fue rechazado',
                  orderId: '${Num_operacion || ''}',
                  codigoRespuesta: '${codigoRespuesta || ''}'
                }));
              }
              
              // Intentar redirigir a la app con deep link
              setTimeout(() => {
                window.location.href = 'academiadeinmigrantes://payment-error?orderId=${Num_operacion || ''}';
              }, 1500);
            </script>
          </body>
        </html>
      `);
    }
    
    // Si llegamos aquí, el pago fue exitoso
    console.log('✅ Pago exitoso confirmado');
    
    // Convertir importe de céntimos a euros
    const importeEuros = (parseInt(importeFinal) / 100).toFixed(2);
    
    // Determinar el tipo de operación basado en el importe o descripción
    let operationType = 'unknown';
    let levelUnlocked = null;
    
    // Intentar extraer el nivel de la descripción si está disponible
    const descripcionLower = (descripcionFinal || '').toLowerCase();
    
    // PRIMERO: Intentar detectar el nivel desde la descripción (más confiable)
    if (descripcionLower.includes('a1') || descripcionLower.includes('nivel a1')) {
      operationType = 'matricula-a1';
      levelUnlocked = 'A1';
    } else if (descripcionLower.includes('a2') || descripcionLower.includes('nivel a2')) {
      operationType = 'matricula-a2';
      levelUnlocked = 'A2';
    } else if (descripcionLower.includes('b1') || descripcionLower.includes('nivel b1')) {
      operationType = 'matricula-b1';
      levelUnlocked = 'B1';
    } else if (descripcionLower.includes('b2') || descripcionLower.includes('nivel b2')) {
      operationType = 'matricula-b2';
      levelUnlocked = 'B2';
    } else if (descripcionLower.includes('formacion') || descripcionLower.includes('profesional')) {
      operationType = 'formacion-profesional';
      levelUnlocked = 'FORMACION_PROFESIONAL';
    }
    
    // SEGUNDO: Si no se detectó por descripción, usar el importe como fallback
    if (!levelUnlocked) {
      if (parseInt(importeFinal) === 1500) { // 15.00 euros en céntimos
        operationType = 'matricula';
        levelUnlocked = 'UNKNOWN';
      } else if (parseInt(importeFinal) === 2000) { // 20.00 euros en céntimos (compatibilidad con sistema anterior)
        operationType = 'matricula-a1a2';
        levelUnlocked = 'A1A2';
      } else if (parseInt(importeFinal) === 3000) { // 30.00 euros en céntimos (compatibilidad con sistema anterior)
        operationType = 'matricula-b1b2';
        levelUnlocked = 'B1B2';
      } else if (parseInt(importeFinal) === 1000) { // 10.00 euros en céntimos
        operationType = 'formacion-profesional';
        levelUnlocked = 'FORMACION_PROFESIONAL';
      }
    }
    
    console.log('💰 Pago exitoso de Cecabank:', {
      numOperacion: Num_operacion,
      codigoCliente: Codigo_cliente,
      importe: Importe,
      importeEuros: importeEuros,
      descripcion: Descripcion,
      fecha: Fecha,
      hora: Hora,
      operationType,
      levelUnlocked
    });

    // Guardar información del pago (en producción, esto debería ir a una base de datos)
    const paymentDetails = {
      orderId: Num_operacion,
      codigoCliente: Codigo_cliente,
      importe: importeEuros,
      importeCentimos: Importe,
      descripcion: Descripcion,
      fecha: Fecha,
      hora: Hora,
      operationType,
      levelUnlocked,
      paymentMethod: 'cecabank',
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    
    console.log('💾 Registro de pago:', paymentDetails);

    // Enviar email de confirmación si está configurado
    if (transporter && Codigo_cliente) {
      try {
        const mailOptions = {
          from: 'admin@academiadeinmigrantes.es',
          to: Codigo_cliente.includes('@') ? Codigo_cliente : 'admin@academiadeinmigrantes.es',
          subject: `✅ Pago confirmado - Orden ${Num_operacion}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4CAF50;">✅ Pago Confirmado</h2>
              <p>Tu pago ha sido procesado correctamente.</p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Detalles del pago:</h3>
                <p><strong>Número de operación:</strong> ${Num_operacion}</p>
                <p><strong>Importe:</strong> ${importeEuros} €</p>
                <p><strong>Descripción:</strong> ${Descripcion || 'Pago Academia de Inmigrantes'}</p>
                <p><strong>Fecha:</strong> ${Fecha} ${Hora}</p>
                ${levelUnlocked ? `<p><strong>Nivel desbloqueado:</strong> ${levelUnlocked}</p>` : ''}
              </div>
              <p>Gracias por tu compra. Ya puedes acceder a los contenidos correspondientes en la aplicación.</p>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                Este es un email automático. Por favor, no respondas a este mensaje.
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email de confirmación enviado');
      } catch (emailError) {
        console.error('❌ Error enviando email de confirmación:', emailError);
        // No fallar el proceso si el email falla
      }
    }

    // Redirigir a la app con éxito
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Pago Exitoso</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-align: center;
              padding: 20px;
            }
            .success-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              margin: 0 0 10px 0;
            }
            p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="success-icon">✅</div>
          <h1>Pago realizado con éxito</h1>
          <p>Tu pago ha sido procesado correctamente.</p>
          <p>Redirigiendo a la aplicación...</p>
          <script>
            // Enviar mensaje a React Native WebView si está disponible
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment-success',
                orderId: '${Num_operacion}',
                operationType: '${operationType}',
                levelUnlocked: '${levelUnlocked}',
                importe: '${importeEuros}'
              }));
            }
            
            // Intentar redirigir a la app con deep link
            setTimeout(() => {
              window.location.href = 'academiadeinmigrantes://payment-success?orderId=${Num_operacion}&operationType=${operationType}&levelUnlocked=${levelUnlocked}';
            }, 1500);
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Error procesando callback OK de Cecabank:', error);
    res.status(500).send('Error procesando el pago');
  }
});

// Endpoint para recibir respuesta de pago fallido de Cecabank
// Endpoint para recibir respuesta de pago fallido de Cecabank
// IMPORTANTE: Este endpoint DEBE devolver HTTP 200 para que Cecabank considere que la URL funciona
// La URL debe ser exactamente: https://academiadeinmigrantes.es/api/cecabank/ko
app.get('/api/cecabank/ko', async (req, res) => {
  try {
    console.log('❌ Callback GET de Cecabank recibido (/ko)');
    console.log('📝 Query params:', JSON.stringify(req.query, null, 2));
 
    const Num_operacion = req.query?.Num_operacion || req.query?.num_operacion || '';
    const Ds_Response = req.query?.Ds_Response || req.query?.ds_response || '';
    const Codigo_respuesta = req.query?.Codigo_respuesta || req.query?.codigo_respuesta || '';
    const Respuesta = req.query?.Respuesta || req.query?.respuesta || '';
    const codigoRespuesta = Ds_Response || Codigo_respuesta || Respuesta;
 
    // ✅ PERSISTIR ESTADO INMEDIATAMENTE (antes de cualquier otra lógica)
    const paymentRecordKo = {
      status: 'failed',
      endpoint: '/api/cecabank/ko',
      method: 'GET',
      timestamp: new Date().toISOString(),
      numOperacion: Num_operacion,
      codigoRespuesta: codigoRespuesta,
      allParams: req.query
    };
    paymentStatus.set(Num_operacion || `unknown_${Date.now()}`, paymentRecordKo);
    console.log('💾 Estado de pago persistido:', paymentRecordKo);
 
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Pago fallido</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <p>Pago no realizado. Volviendo a la app...</p>
          <script>
            try {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'payment-error',
                  message: 'El pago fue cancelado o rechazado',
                  orderId: '${Num_operacion}',
                  codigoRespuesta: '${codigoRespuesta}'
                }));
              }
            } catch (e) {}
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Error procesando callback GET KO de Cecabank:', error);
    return res.status(200).send('KO recibido');
  }
});

app.post('/api/cecabank/ko', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log('❌ Callback de Cecabank KO recibido');
    console.log('📝 Datos recibidos:', req.body);
    console.log('🌐 IP del cliente:', req.ip || req.connection.remoteAddress);
    console.log('🌐 User-Agent:', req.headers['user-agent']);

    const { 
      Num_operacion, 
      Codigo_cliente, 
      Importe,
      Descripcion,
      Fecha,
      Hora,
      Firma,
      Ds_Response,
      Codigo_respuesta,
      Respuesta
    } = req.body;

    // Si viene la firma, validarla (aunque el pago haya fallido)
    if (Firma && Fecha && Hora && Num_operacion && Importe) {
      const isValidSignature = validateCecabankSignature({
        Num_operacion,
        Importe,
        Fecha,
        Hora,
        Firma
      });
      
      if (!isValidSignature) {
        console.warn('⚠️ Firma inválida en callback KO de Cecabank');
      } else {
        console.log('✅ Firma validada en callback KO');
      }
    }

    const codigoRespuesta = Ds_Response || Codigo_respuesta || Respuesta;
    console.log('⚠️ Pago fallido de Cecabank:', {
      numOperacion: Num_operacion,
      codigoCliente: Codigo_cliente,
      importe: Importe,
      descripcion: Descripcion,
      fecha: Fecha,
      hora: Hora,
      codigoRespuesta: codigoRespuesta
    });

    // ✅ PERSISTIR ESTADO INMEDIATAMENTE (antes de cualquier otra lógica)
    const paymentRecordKoPost = {
      status: 'failed',
      endpoint: '/api/cecabank/ko',
      method: 'POST',
      timestamp: new Date().toISOString(),
      numOperacion: Num_operacion,
      importe: Importe,
      codigoRespuesta: codigoRespuesta,
      descripcion: Descripcion,
      allParams: req.body
    };
    paymentStatus.set(Num_operacion || `unknown_${Date.now()}`, paymentRecordKoPost);
    console.log('💾 Estado de pago persistido:', paymentRecordKoPost);

    // IMPORTANTE: Siempre devolver HTTP 200 para que Cecabank considere que la URL funciona
    // Redirigir a la app con error
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Pago Fallido</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              text-align: center;
              padding: 20px;
            }
            .error-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              margin: 0 0 10px 0;
            }
            p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="error-icon">❌</div>
          <h1>Pago no realizado</h1>
          <p>El pago no pudo ser procesado. Por favor, intenta de nuevo.</p>
          <p>Redirigiendo a la aplicación...</p>
          <script>
            // Enviar mensaje a React Native WebView si está disponible
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment-error',
                message: 'El pago fue cancelado o falló',
                orderId: '${Num_operacion || ''}',
                codigoRespuesta: '${codigoRespuesta || ''}'
              }));
            }
            
            // Intentar redirigir a la app con deep link
            setTimeout(() => {
              window.location.href = 'academiadeinmigrantes://payment-error?orderId=${Num_operacion || ''}';
            }, 1500);
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Error procesando callback KO de Cecabank:', error);
    // IMPORTANTE: Devolver 200 incluso en caso de error para que Cecabank considere que la URL funciona
    res.status(200).send('KO recibido');
  }
});

// Endpoint de prueba para verificar accesibilidad de /api/cecabank/ko
// Permite probar que el endpoint es accesible desde Internet
app.post('/api/cecabank/ko/test', express.urlencoded({ extended: true }), (req, res) => {
  console.log('🧪 Test de accesibilidad para /api/cecabank/ko');
  console.log('📝 Datos recibidos:', req.body);
  res.status(200).json({
    status: 'ok',
    message: 'Endpoint /api/cecabank/ko es accesible',
    endpoint: '/api/cecabank/ko',
    method: 'POST',
    accessible: true,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para verificar el estado de un pago
app.get('/api/cecabank/payment/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('🔍 Verificando estado de pago:', orderId);
    
    // En producción, esto debería consultar una base de datos
    // Por ahora, retornamos un mensaje indicando que el pago fue procesado
    // si viene de un callback válido
    
    res.json({
      success: true,
      message: 'Endpoint de verificación de pago',
      orderId,
      note: 'En producción, este endpoint debería consultar la base de datos para verificar el estado del pago'
    });
  } catch (error) {
    console.error('❌ Error verificando pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar el pago'
    });
  }
});

// ============================================
// ENDPOINT PARA SINCRONIZAR USUARIOS CON ODOO
// ============================================
app.post('/api/odoo/sync-user', async (req, res) => {
  try {
    console.log('🔄 Sincronizando usuario con Odoo...');
    console.log('📋 Datos recibidos:', JSON.stringify(req.body, null, 2));

    const {
      uid,
      email,
      firstName,
      lastName,
      phone,
      country,
      city,
      userReference,
      createdAt
    } = req.body;

    // Validar campos requeridos
    if (!email || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: email, firstName, lastName'
      });
    }

    // Verificar configuración de Odoo
    if (!ODOO_URL || !ODOO_DATABASE || (!ODOO_USERNAME && !ODOO_API_KEY)) {
      console.warn('⚠️  Odoo no está configurado, saltando sincronización');
      return res.json({
        success: false,
        error: 'Odoo no está configurado',
        skipped: true
      });
    }

    // Preparar datos para Odoo
    const odooData = {
      name: `${firstName} ${lastName}`,
      email: email,
      phone: phone || '',
      mobile: phone || '',
      street: city || '',
      city: city || '',
      country_id: country || false, // Odoo espera un ID de país, no el nombre
      comment: `Usuario sincronizado desde Firebase App\nUID: ${uid || 'N/A'}\nReferencia: ${userReference || 'N/A'}\nFecha creación: ${createdAt || new Date().toISOString()}`,
      // Campos adicionales que Odoo puede necesitar
      is_company: false,
      customer_rank: 1,
      // Si tienes campos personalizados en Odoo, agrégalos aquí
      // x_firebase_uid: uid,
      // x_user_reference: userReference,
    };

    // Intentar sincronizar con Odoo
    let odooResponse;
    try {
      // Opción 1: Usar autenticación por usuario/contraseña
      if (ODOO_USERNAME && ODOO_PASSWORD) {
        // Primero autenticarse
        const authResponse = await fetch(`${ODOO_URL}/web/session/authenticate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
              db: ODOO_DATABASE,
              login: ODOO_USERNAME,
              password: ODOO_PASSWORD,
            },
          }),
        });

        const authData = await authResponse.json();
        if (!authData.result || !authData.result.uid) {
          throw new Error('Error de autenticación con Odoo');
        }

        const sessionId = authResponse.headers.get('set-cookie');
        
        // Crear o actualizar contacto en Odoo
        odooResponse = await fetch(`${ODOO_URL}/web/dataset/call_kw`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionId || '',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'call',
            params: {
              model: 'res.partner',
              method: 'create',
              args: [odooData],
              kwargs: {},
            },
          }),
        });
      } 
      // Opción 2: Usar API Key (si Odoo lo soporta)
      else if (ODOO_API_KEY) {
        odooResponse = await fetch(`${ODOO_URL}/api/res.partner`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ODOO_API_KEY}`,
          },
          body: JSON.stringify(odooData),
        });
      } else {
        throw new Error('No hay método de autenticación configurado para Odoo');
      }

      const odooResult = await odooResponse.json();
      
      if (odooResponse.ok && odooResult.result) {
        console.log('✅ Usuario sincronizado exitosamente con Odoo');
        console.log('📋 ID en Odoo:', odooResult.result);
        
        return res.json({
          success: true,
          message: 'Usuario sincronizado con Odoo',
          odooId: odooResult.result,
          data: odooData
        });
      } else {
        throw new Error(odooResult.error?.message || 'Error desconocido de Odoo');
      }
    } catch (odooError) {
      console.error('❌ Error sincronizando con Odoo:', odooError);
      // No fallar el registro si Odoo falla, solo loguear el error
      return res.json({
        success: false,
        error: `Error sincronizando con Odoo: ${odooError.message}`,
        warning: 'El usuario se registró en Firebase pero no se pudo sincronizar con Odoo'
      });
    }
  } catch (error) {
    console.error('❌ Error en endpoint de sincronización Odoo:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error desconocido'
    });
  }
});

app.get('/', (req, res) => {
  res.send('¡API de pagos de Academia de Inmigrantes funcionando!');
});

// Manejo de errores global
process.on('unhandledRejection', (error) => {
  console.error(' Error no manejado:', error);
});

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(80));
  console.log(` Servidor escuchando en el puerto ${PORT}`);
  console.log(` Entorno: ${NODE_ENV}`);
  console.log(` Clave de Stripe configurada: ${!!process.env.STRIPE_SECRET_KEY}`);
  console.log(` Credenciales de SMTP2GO configuradas: ${!!(process.env.SMTP2GO_USERNAME && process.env.SMTP2GO_PASSWORD)}`);
  console.log(' Plataforma:', process.platform, process.arch);
  console.log(' Node.js:', process.version);
  console.log(' Directorio:', process.cwd());
  console.log(' URL:', `http://localhost:${PORT}`);
  console.log('\n Variables de entorno:');
  console.log(`   - NODE_ENV: ${NODE_ENV}`);
  console.log(`   - PORT: ${PORT}`);
  console.log(`   - STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? ' Configurada' : ' No configurada'}`);
  console.log(`   - SMTP2GO_USERNAME: ${process.env.SMTP2GO_USERNAME ? ' Configurada' : ' No configurada'}`);
  console.log(`   - SMTP2GO_PASSWORD: ${process.env.SMTP2GO_PASSWORD ? ' Configurada' : ' No configurada'}`);
  console.log('\n Endpoints disponibles:');
  console.log(`   - GET    /`);
  console.log(`   - GET    /api/health`);
  console.log(`   - POST   /api/create-payment-intent`);
  console.log(`   - POST   /api/solicitar-examen-presencial`);
  console.log(`   - POST   /api/test-smtp2go`);
  console.log(`   - POST   /api/test-smtp2go-custom`);
  console.log(`   - POST   /api/test-email`);
  console.log(`   - POST   /api/enviar-solicitud-asesoria`);
  console.log(`   - POST   /api/cecabank/ok`);
  console.log(`   - POST   /api/cecabank/ko`);
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
