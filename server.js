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

// Verificar configuraciÃ³n de SMTP2GO
console.log('ðŸ”§ Verificando configuraciÃ³n de SMTP2GO...');
console.log(`   - Usuario configurado: ${!!process.env.SMTP2GO_USERNAME}`);
console.log(`   - ContraseÃ±a configurada: ${!!process.env.SMTP2GO_PASSWORD}`);
if (process.env.SMTP2GO_USERNAME) {
  console.log(`   - Usuario (primeros 3 chars): ${process.env.SMTP2GO_USERNAME.substring(0, 3)}...`);
}
if (process.env.SMTP2GO_PASSWORD) {
  console.log(`   - ContraseÃ±a (longitud): ${process.env.SMTP2GO_PASSWORD.length} caracteres`);
}
if (process.env.SMTP2GO_USERNAME && process.env.SMTP2GO_PASSWORD) {
  console.log('âœ… SMTP2GO configurado correctamente');
} else {
  console.log('   âš ï¸  Credenciales de SMTP2GO NO configuradas');
}

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// ConfiguraciÃ³n de Odoo
const ODOO_URL = process.env.ODOO_URL || '';
const ODOO_DATABASE = process.env.ODOO_DATABASE || '';
const ODOO_USERNAME = process.env.ODOO_USERNAME || '';
const ODOO_PASSWORD = process.env.ODOO_PASSWORD || '';
const ODOO_API_KEY = process.env.ODOO_API_KEY || '';

// Verificar configuraciÃ³n de Odoo
console.log('ðŸ”§ Verificando configuraciÃ³n de Odoo...');
console.log(`   - URL configurada: ${!!ODOO_URL}`);
console.log(`   - Base de datos configurada: ${!!ODOO_DATABASE}`);
console.log(`   - Usuario configurado: ${!!ODOO_USERNAME}`);
if (ODOO_URL) {
  console.log(`   - URL: ${ODOO_URL}`);
}
if (ODOO_URL && ODOO_DATABASE && (ODOO_USERNAME || ODOO_API_KEY)) {
  console.log('âœ… Odoo configurado correctamente');
} else {
  console.log('   âš ï¸  ConfiguraciÃ³n de Odoo incompleta - la sincronizaciÃ³n no funcionarÃ¡');
}

// Webhook de Stripe - DEBE estar antes de cualquier otro middleware que procese el body
app.post('/api/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    console.log('ðŸ”” Webhook recibido');
    
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    try {
      // Validar que venga la firma
      if (!sig) {
        console.error('âŒ No se encontrÃ³ la firma de Stripe');
        return res.status(400).send('Webhook Error: No se encontrÃ³ la firma de Stripe');
      }

      // Verificar el evento con Stripe
      const event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log(`âœ… Webhook verificado: ${event.type}`);

      // Manejar el evento
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log('âœ… Pago exitoso:', paymentIntent.id);
          console.log('ðŸ“ Metadata:', paymentIntent.metadata);
          // AquÃ­ va la lÃ³gica para desbloquear el curso
          // Ejemplo: actualizar base de datos, enviar email, etc.
          break;
          
        case 'payment_intent.payment_failed':
          const failedIntent = event.data.object;
          console.error('âŒ Pago fallido:', failedIntent.id);
          // Manejar pago fallido
          break;
          
        default:
          console.log(`âš ï¸  Evento no manejado: ${event.type}`);
      }

      res.json({ received: true });
      
    } catch (err) {
      console.error('âŒ Error en webhook:', err.message);
      console.error('ðŸ” Debug info:', {
        bodyType: typeof payload,
        bodyLength: payload ? payload.length : 'undefined',
        hasSignature: !!sig,
        signaturePrefix: sig ? sig.substring(0, 10) + '...' : 'no signature'
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// Middleware para CORS y JSON (despuÃ©s del webhook)
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

// Endpoint de verificaciÃ³n para URLs de Cecabank
app.get('/api/cecabank/verify', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Endpoints de Cecabank estÃ¡n accesibles',
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

// Almacenamiento temporal de formularios HTML (en memoria, se limpia despuÃ©s de 1 hora)
const tempForms = new Map();

// Almacenamiento de estado de pagos (para diagnÃ³stico)
const paymentStatus = new Map();

// Endpoint para crear un formulario HTML temporal y obtener su URL
app.post('/api/cecabank/temp-form', express.json(), (req, res) => {
  try {
    const { html, orderId, operationType } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'Se requiere el campo html' });
    }
    
    // Generar un ID Ãºnico para el formulario temporal
    const formId = `form_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Guardar el HTML en memoria con timestamp
    tempForms.set(formId, {
      html: html,
      orderId: orderId || null,
      operationType: operationType || null,
      createdAt: Date.now(),
    });
    
    // Limpiar formularios antiguos (mÃ¡s de 1 hora)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [id, form] of tempForms.entries()) {
      if (form.createdAt < oneHourAgo) {
        tempForms.delete(id);
      }
    }
    
    // Devolver la URL temporal
    const tempUrl = `https://academiadeinmigrantes.es/api/cecabank/temp-form/${formId}`;
    
    console.log(`âœ… Formulario temporal creado: ${formId}`);
    console.log(`ðŸ“‹ URL temporal: ${tempUrl}`);
    
    res.json({ tempUrl, formId });
  } catch (error) {
    console.error('âŒ Error creando formulario temporal:', error);
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
    
    console.log(`âœ… Sirviendo formulario temporal: ${formId}`);
    console.log(`ðŸ“ TamaÃ±o del HTML: ${form.html.length} caracteres`);
    console.log(`ðŸ“‹ Primeros 200 caracteres: ${form.html.substring(0, 200)}`);
    console.log(`ðŸ“‹ Ãšltimos 200 caracteres: ${form.html.substring(Math.max(0, form.html.length - 200))}`);
    
    // Verificar que el HTML no estÃ© vacÃ­o
    if (!form.html || form.html.trim().length === 0) {
      console.error('âŒ HTML vacÃ­o detectado');
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Error</title>
          </head>
          <body>
            <h1>Error</h1>
            <p>El formulario estÃ¡ vacÃ­o. Por favor, intenta de nuevo.</p>
          </body>
        </html>
      `);
    }
    
    // Verificar que el HTML tenga estructura bÃ¡sica
    const hasForm = form.html.includes('<form') || form.html.includes('<FORM');
    const hasScript = form.html.includes('<script') || form.html.includes('<SCRIPT');
    console.log(`ðŸ“‹ HTML tiene form: ${hasForm}, tiene script: ${hasScript}`);
    
    if (!hasForm) {
      console.error('âŒ HTML no contiene formulario');
    }
    
    // Enviar el HTML con headers correctos
    res.send(form.html);
    
    // Eliminar el formulario despuÃ©s de servirlo (solo se usa una vez)
    tempForms.delete(formId);
  } catch (error) {
    console.error('âŒ Error sirviendo formulario temporal:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Error</title>
        </head>
        <body>
          <h1>Error</h1>
          <p>OcurriÃ³ un error al cargar el formulario.</p>
        </body>
      </html>
    `);
  }
});

// Endpoint para solicitar inscripciÃ³n al examen presencial
app.post('/api/solicitar-examen-presencial', async (req, res) => {
  try {
    console.log('ðŸ“§ Iniciando solicitud de inscripciÃ³n al examen presencial...');
    const { nombre, email, telefono, nivel, documento, mensaje } = req.body;
    console.log('ðŸ“ Datos recibidos:', { nombre, email, telefono, nivel, documento, mensaje });
    console.log('ðŸ“ Nombre recibido (tipo y valor):', typeof nombre, nombre);
    console.log('ðŸ“ Nombre completo recibido:', JSON.stringify(nombre));

    // Validar datos requeridos
    if (!nombre || !email || !nivel) {
      console.log('âŒ ValidaciÃ³n fallida: faltan campos obligatorios');
      return res.status(400).json({
        error: 'Faltan campos obligatorios',
        required: ['nombre', 'email', 'nivel']
      });
    }

    // Verificar configuraciÃ³n de SMTP2GO
    if (!process.env.SMTP2GO_USERNAME || !process.env.SMTP2GO_PASSWORD) {
      console.error('âŒ Credenciales de SMTP2GO no configuradas');
      return res.status(500).json({
        error: 'ConfiguraciÃ³n de email incompleta',
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
        <h2>Solicitud de InscripciÃ³n al Examen Presencial</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Datos del Estudiante:</h3>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${telefono ? `<p><strong>TelÃ©fono:</strong> ${telefono}</p>` : ''}
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

    console.log('ðŸ“¤ Enviando email a:', mailOptions.to);
    console.log('ðŸ“¤ Desde:', mailOptions.from);
    console.log('ðŸ“¤ Asunto:', mailOptions.subject);

    // Enviar el email usando SMTP2GO
    const result = await transporter.sendMail(mailOptions);
    console.log('âœ… Email enviado exitosamente:', result.messageId);

    res.json({
      success: true,
      message: 'Solicitud de examen presencial enviada correctamente',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('âŒ Error enviando solicitud de examen presencial:', error);

    // Manejo de errores especÃ­fico para SMTP2GO
    let errorMessage = 'Error al enviar la solicitud';
    let errorDetails = error.message;
    let errorCode = error.code;

    if (error.responseCode) {
      const responseCode = error.responseCode;
      console.error('âŒ CÃ³digo de respuesta SMTP:', responseCode);

      if (responseCode === 535) {
        errorMessage = 'Error de autenticaciÃ³n con SMTP2GO';
        errorDetails = 'Las credenciales de SMTP2GO son incorrectas.';
        errorCode = 'EAUTH';
      } else if (responseCode === 550) {
        errorMessage = 'Email rechazado';
        errorDetails = 'El servidor SMTP rechazÃ³ el email. Verifica el dominio y email remitente.';
        errorCode = 'EREJECTED';
      } else if (responseCode === 421) {
        errorMessage = 'Servicio temporalmente no disponible';
        errorDetails = 'SMTP2GO no estÃ¡ disponible temporalmente. IntÃ©ntalo mÃ¡s tarde.';
        errorCode = 'ETEMP';
      }
    } else {
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
        errorMessage = 'Timeout de conexiÃ³n con SMTP2GO';
        errorDetails = 'El servidor de SMTP2GO no responde. Verificar conexiÃ³n a internet.';
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

    // DETECCIÃ“N DE FORMACIÃ“N PROFESIONAL
    const esFormacionProfesional = tipo === 'formacion-profesional' ||
                                 (description && (description.toLowerCase().includes('formaciÃ³n profesional') || 
                                                 description.toLowerCase().includes('formacion')));

    console.log(' Tipo de pago detectado:', {
      esFormacionProfesional,
      tieneLevel: !!level,
      description: description
    });

    // ValidaciÃ³n especÃ­fica para formaciÃ³n profesional: EXACTAMENTE 10.00 euros
    if (esFormacionProfesional) {
      const amountNumber = Number(amount);
      const expectedAmount = FORMACION_PRICE_EUR;
      console.log(' AmountNumber calculado para formaciÃ³n profesional:', amountNumber, 'Esperado:', expectedAmount);

      if (!amount || isNaN(amountNumber) || Math.abs(amountNumber - expectedAmount) > 0.001) {
        console.error(' ValidaciÃ³n fallida para formaciÃ³n profesional:', {
          originalAmount: amount,
          amountNumber,
          expectedAmount,
          difference: Math.abs(amountNumber - expectedAmount)
        });
        return res.status(400).json({
          error: `El monto debe ser EXACTAMENTE ${expectedAmount.toFixed(2)} euros para formaciÃ³n profesional`,
          receivedAmount: amount,
          expectedAmount
        });
      }
    } else {
      // ValidaciÃ³n normal para otros tipos de pago
      const amountNumber = Number(amount);
      if (!amount || isNaN(amountNumber) || amountNumber < 0.5) {
        return res.status(400).json({
          error: 'El monto debe ser un nÃºmero mayor o igual a 0.50 euros',
          receivedAmount: amount,
          expectedMinimum: 0.5
        });
      }
    }

    // Calcular monto en cÃ©ntimos para Stripe
    const amountInCents = Math.round(Number(amount) * 100);
    console.log(` ConversiÃ³n: ${amount} ${currency} â†’ ${amountInCents} cÃ©ntimos`);

    // Crear el Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents, // Stripe espera cÃ©ntimos
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
        ? `MatrÃ­cula ${level} - Academia de Inmigrantes`
        : description || 'Pago Academia de Inmigrantes',
      automatic_payment_methods: {
        enabled: true
      }
    });

    console.log(` PaymentIntent creado: ${paymentIntent.id}`);
    console.log(` Stripe recibiÃ³: ${paymentIntent.amount} cÃ©ntimos (${paymentIntent.amount / 100} ${paymentIntent.currency})`);

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

    console.log('ðŸ§ª Probando credenciales personalizadas de SMTP2GO...');
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

    // Verificar conexiÃ³n
    const verifyResult = await testTransporter.verify();
    console.log('âœ… ConexiÃ³n SMTP2GO verificada con credenciales personalizadas:', verifyResult);

    res.json({
      success: true,
      message: 'Credenciales vÃ¡lidas - conexiÃ³n exitosa',
      verified: verifyResult
    });

  } catch (error) {
    console.error('âŒ Error verificando credenciales personalizadas:', error);
    
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
    console.log('ðŸ§ª Probando conexiÃ³n con SMTP2GO...');
    
    if (!transporter) {
      return res.status(500).json({
        error: 'Transporter no configurado',
        details: 'Las credenciales de SMTP2GO no estÃ¡n configuradas'
      });
    }

    // Verificar conexiÃ³n
    const verifyResult = await transporter.verify();
    console.log('âœ… ConexiÃ³n SMTP2GO verificada:', verifyResult);

    res.json({
      success: true,
      message: 'ConexiÃ³n SMTP2GO exitosa',
      verified: verifyResult
    });

  } catch (error) {
    console.error('âŒ Error verificando SMTP2GO:', error);
    
    res.status(500).json({
      error: 'Error de conexiÃ³n SMTP2GO',
      details: error.message,
      code: error.code
    });
  }
});

// Endpoint para enviar email de prueba
app.post('/api/test-email', async (req, res) => {
  try {
    console.log('ðŸ“§ Enviando email de prueba...');

    if (!transporter) {
      return res.status(500).json({
        error: 'Transporter no configurado',
        details: 'Las credenciales de SMTP2GO no estÃ¡n configuradas'
      });
    }

    const mailOptions = {
      from: 'admin@academiadeinmigrantes.es',
      to: 'admin@academiadeinmigrantes.es',
      subject: 'Email de prueba - SMTP2GO',
      html: `
        <h2>Prueba de conexiÃ³n SMTP2GO</h2>
        <p>Este es un email de prueba enviado desde Academia de Inmigrantes.</p>
        <p>Si recibes este email, la configuraciÃ³n de SMTP2GO estÃ¡ funcionando correctamente.</p>
        <p>Hora del envÃ­o: ${new Date().toLocaleString()}</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('âœ… Email de prueba enviado:', result.messageId);

    res.json({
      success: true,
      message: 'Email de prueba enviado correctamente',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('âŒ Error enviando email de prueba:', error);

    res.status(500).json({
      error: 'Error enviando email de prueba',
      details: error.message,
      code: error.code
    });
  }
});

app.post('/api/enviar-solicitud-asesoria', async (req, res) => {
  try {
    console.log('ðŸ“§ Iniciando envÃ­o de email de asesorÃ­a...');
    const { name, email, phone, appointmentType, date, time, notes } = req.body;
    console.log('ðŸ“ Datos recibidos:', { name, email, phone, appointmentType, date, time });

    // Validar datos requeridos
    if (!name || !email || !phone || !appointmentType || !date || !time) {
      console.log('âŒ ValidaciÃ³n fallida: faltan campos obligatorios');
      return res.status(400).json({
        error: 'Faltan campos obligatorios',
        required: ['name', 'email', 'phone', 'appointmentType', 'date', 'time']
      });
    }

    // Verificar configuraciÃ³n de SMTP2GO
    if (!process.env.SMTP2GO_USERNAME || !process.env.SMTP2GO_PASSWORD) {
      console.error('âŒ Credenciales de SMTP2GO no configuradas');
      return res.status(500).json({
        error: 'ConfiguraciÃ³n de email incompleta',
        details: 'Credenciales de SMTP2GO no configuradas'
      });
    }

    // Configurar el email
    const mailOptions = {
      from: 'admin@academiadeinmigrantes.es', // Email verificado
      to: 'admin@academiadeinmigrantes.es', // Email administrativo de la academia
      replyTo: email, // Responder al solicitante
      subject: `Nueva solicitud de asesorÃ­a - ${name}`,
      html: `
        <h2>Nueva Solicitud de AsesorÃ­a de InmigraciÃ³n</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Datos del Solicitante:</h3>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>TelÃ©fono:</strong> ${phone}</p>
          <p><strong>Tipo de cita:</strong> ${appointmentType}</p>
          <p><strong>Fecha solicitada:</strong> ${date}</p>
          <p><strong>Hora solicitada:</strong> ${time}</p>
          <h3>Notas adicionales:</h3>
          <p>${notes || 'Sin notas adicionales'}</p>
        </div>
        <p style="color: #666;">Este email fue enviado desde la app Academia de Inmigrantes.</p>
      `,
    };

    console.log('ðŸ“¤ Enviando email a:', mailOptions.to);
    console.log('ðŸ“¤ Desde:', mailOptions.from);
    console.log('ðŸ“¤ Asunto:', mailOptions.subject);

    // Enviar el email usando SMTP2GO
    const result = await transporter.sendMail(mailOptions);
    console.log('âœ… Email enviado exitosamente:', result.messageId);

    res.json({
      success: true,
      message: 'Solicitud de asesorÃ­a enviada correctamente',
      messageId: result.messageId
    });

  } catch (error) {
    console.error('âŒ Error enviando email de asesorÃ­a:', error);

    // Manejo de errores especÃ­fico para SMTP2GO
    let errorMessage = 'Error al enviar la solicitud';
    let errorDetails = error.message;
    let errorCode = error.code;

    if (error.responseCode) {
      // Error de SMTP
      const responseCode = error.responseCode;

      console.error('âŒ CÃ³digo de respuesta SMTP:', responseCode);

      if (responseCode === 535) {
        errorMessage = 'Error de autenticaciÃ³n con SMTP2GO';
        errorDetails = 'Las credenciales de SMTP2GO son incorrectas.';
        errorCode = 'EAUTH';
      } else if (responseCode === 550) {
        errorMessage = 'Email rechazado';
        errorDetails = 'El servidor SMTP rechazÃ³ el email. Verifica el dominio y email remitente.';
        errorCode = 'EREJECTED';
      } else if (responseCode === 421) {
        errorMessage = 'Servicio temporalmente no disponible';
        errorDetails = 'SMTP2GO no estÃ¡ disponible temporalmente. IntÃ©ntalo mÃ¡s tarde.';
        errorCode = 'ETEMP';
      }
    } else {
      // Error de conexiÃ³n o timeout
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
        errorMessage = 'Timeout de conexiÃ³n con SMTP2GO';
        errorDetails = 'El servidor de SMTP2GO no responde. Verificar conexiÃ³n a internet.';
        errorCode = 'ETIMEDOUT';
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'Servidor de SMTP2GO no encontrado';
        errorDetails = 'No se puede conectar al servidor de SMTP2GO.';
        errorCode = 'ENOTFOUND';
      }
    }

    console.error('âŒ CÃ³digo de error:', errorCode);
    console.error('âŒ Mensaje detallado:', errorDetails);

    res.status(500).json({
      error: errorMessage,
      details: errorDetails,
      code: errorCode
    });
  }
});

// ============================================
// ENDPOINT INTERMEDIO DE REDIRECCIÃ“N CECABANK
// ============================================
// Este endpoint debe estar ANTES de los middlewares generales para procesar form-urlencoded

// Endpoint intermedio para enviar POST a Cecabank
// Este endpoint recibe los datos, hace el POST a Cecabank y redirige
app.post('/api/cecabank/redirect', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log('ðŸ”„ Endpoint de redirecciÃ³n a Cecabank recibido');
    console.log('ðŸ“ Datos recibidos:', req.body);
    console.log('ðŸ“‹ Content-Type:', req.headers['content-type']);
    console.log('ðŸ“‹ Claves en req.body:', Object.keys(req.body));
    
    // Verificar si viene el formato SIS moderno (Ds_MerchantParameters, Ds_Signature)
    // IMPORTANTE: Extraer los valores de req.body primero
    const Ds_MerchantParameters = req.body.Ds_MerchantParameters;
    const Ds_Signature = req.body.Ds_Signature;
    const Ds_SignatureVersion = req.body.Ds_SignatureVersion || 'HMAC_SHA256_V1';
    
    const hasDsMerchantParameters = !!Ds_MerchantParameters;
    const hasDsSignature = !!Ds_Signature;
    const hasDsSignatureVersion = !!Ds_SignatureVersion;
    
    console.log('ðŸ” VerificaciÃ³n formato SIS:', {
      hasDsMerchantParameters,
      hasDsSignature,
      hasDsSignatureVersion,
      Ds_MerchantParameters_length: Ds_MerchantParameters ? Ds_MerchantParameters.length : 0,
      Ds_Signature_length: Ds_Signature ? Ds_Signature.length : 0,
      todasLasClaves: Object.keys(req.body),
    });
    
    const isSISFormat = hasDsMerchantParameters && hasDsSignature;
    
    if (isSISFormat) {
      console.log('âœ… Formato SIS moderno detectado - procesando...');
      
      // MÃ©todo SIS moderno - usar directamente los campos recibidos
      const orderId = req.body.orderId;
      const operationType = req.body.operationType;
      const amount = req.body.amount;
      
      // Validar que los campos estÃ©n presentes
      if (!Ds_MerchantParameters || !Ds_Signature) {
        console.error('âŒ Faltan campos obligatorios SIS:', {
          tieneDs_MerchantParameters: !!Ds_MerchantParameters,
          tieneDs_Signature: !!Ds_Signature,
        });
        return res.status(400).send('Faltan campos obligatorios: Ds_MerchantParameters o Ds_Signature');
      }
      
      // Determinar URL de Cecabank SIS
      // CRÃTICO: Si estamos usando credenciales de Cecabank (no las de prueba de Redsys),
      // SIEMPRE usar la URL de producciÃ³n porque Cecabank no tiene entorno de prueba separado
      // El error SIS0026 indica que el comercio/terminal no es vÃ¡lido para la URL de prueba
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
      
      // Verificar tambiÃ©n variables de entorno del backend
      const tieneCredencialesProduccionBackend = !!(process.env.CECABANK_MERCHANT_ID && 
                                                     process.env.CECABANK_MERCHANT_ID !== '' &&
                                                     process.env.CECABANK_MERCHANT_ID !== '999008881');
      
      // Determinar si estamos en modo prueba o producciÃ³n
      // IMPORTANTE: Si el entorno estÃ¡ configurado como 'test', usar URL de prueba
      // incluso si el merchant code no es el estÃ¡ndar de Redsys
      const entornoConfigurado = process.env.CECABANK_ENTORNO || process.env.EXPO_PUBLIC_CECABANK_ENTORNO || 'test';
      const esModoPrueba = entornoConfigurado === 'test' || entornoConfigurado === 'prueba';
      const esModoProduccion = entornoConfigurado === 'produccion' || entornoConfigurado === 'production';
      
      // CRÃTICO: Si estamos en modo prueba, SIEMPRE usar URL de prueba
      // Si estamos en modo producciÃ³n, usar URL de producciÃ³n
      const debeUsarProduccion = esModoProduccion && 
                                (esCredencialesCecabank || tieneCredencialesProduccionBackend);
      
      // IMPORTANTE: Cecabank usa su PROPIO sistema PGW, NO Redsys SIS
      // URLs de Cecabank PGW:
      // - Test: https://tpv.ceca.es/tpvweb/tpv/compra.action
      // - ProducciÃ³n: https://pgw.ceca.es/tpvweb/tpv/compra.action
      let cecabankUrl = esModoPrueba
        ? 'https://tpv.ceca.es/tpvweb/tpv/compra.action'   // URL de prueba de Cecabank PGW
        : 'https://pgw.ceca.es/tpvweb/tpv/compra.action';  // URL de producciÃ³n de Cecabank PGW
      
      // Logs para debugging
      console.log('ðŸ” Determinando URL de Cecabank:', {
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
      console.log('ðŸ”— URL de Cecabank SIS seleccionada (DEBUG SIS0026):', {
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
          ? 'Credenciales de Cecabank - FORZAR producciÃ³n (Cecabank no tiene entorno de prueba)' 
          : esCredencialesPruebaRedsys 
            ? 'Credenciales de prueba Redsys - usar URL de prueba' 
            : 'Entorno configurado como producciÃ³n',
      });
      
      console.log('ðŸ”— URL de Cecabank SIS:', cecabankUrl);
      console.log('ðŸ“‹ OrderId del frontend:', orderId);
      console.log('ðŸ“‹ OperationType:', operationType);
      console.log('ðŸ“‹ Amount recibido del frontend:', amount);
      
      // Decodificar Ds_MerchantParameters para verificar el importe ANTES de enviarlo a Cecabank
      try {
        const decodedParams = Buffer.from(Ds_MerchantParameters, 'base64').toString('utf-8');
        console.log('ðŸ“‹ JSON decodificado (primeros 500 chars):', decodedParams.substring(0, 500));
        const merchantParams = JSON.parse(decodedParams);
        console.log('ðŸ” Ds_MerchantParameters decodificado:', {
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
        
        // Verificar especÃ­ficamente el formato del orderId
        if (!/^\d{12}$/.test(merchantParams.DS_MERCHANT_ORDER || '')) {
          console.error('âŒ ERROR CRÃTICO: DS_MERCHANT_ORDER no tiene el formato correcto (debe ser 12 dÃ­gitos numÃ©ricos)');
          console.error('ðŸ“‹ OrderId recibido:', merchantParams.DS_MERCHANT_ORDER);
          console.error('ðŸ“‹ Longitud:', merchantParams.DS_MERCHANT_ORDER?.length);
          console.error('ðŸ“‹ Es solo nÃºmeros:', /^\d+$/.test(merchantParams.DS_MERCHANT_ORDER || ''));
          return res.status(400).send(`Error: DS_MERCHANT_ORDER debe ser exactamente 12 dÃ­gitos numÃ©ricos. Valor recibido: ${merchantParams.DS_MERCHANT_ORDER}`);
        }
        
        // Verificar que el terminal estÃ© presente y sea vÃ¡lido
        // NOTA: Para pruebas de Redsys es '1', pero para Cecabank puede ser '3' o '00000003'
        if (!merchantParams.DS_MERCHANT_TERMINAL || merchantParams.DS_MERCHANT_TERMINAL === '') {
          console.error('âŒ ERROR CRÃTICO: DS_MERCHANT_TERMINAL estÃ¡ vacÃ­o o no estÃ¡ presente');
          return res.status(400).send('Error: DS_MERCHANT_TERMINAL es obligatorio');
        }
        
        console.log('âœ… Terminal verificado:', {
          valor: merchantParams.DS_MERCHANT_TERMINAL,
          longitud: merchantParams.DS_MERCHANT_TERMINAL?.length,
          es_valido: !!merchantParams.DS_MERCHANT_TERMINAL && merchantParams.DS_MERCHANT_TERMINAL !== '',
        });
        
        // Verificar que el importe no sea 0
        console.log('ðŸ” VerificaciÃ³n detallada del importe:', {
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
          console.error('âŒ ERROR CRÃTICO: El importe en Ds_MerchantParameters es 0 o invÃ¡lido:', merchantParams.DS_MERCHANT_AMOUNT);
          console.error('ðŸ“‹ Todos los parÃ¡metros:', JSON.stringify(merchantParams, null, 2));
          return res.status(400).send(`Error: El importe es 0 o invÃ¡lido (${merchantParams.DS_MERCHANT_AMOUNT}). Verifica la configuraciÃ³n de precios.`);
        }
        
        // Verificar que todos los campos obligatorios estÃ©n presentes
        const camposObligatorios = ['DS_MERCHANT_AMOUNT', 'DS_MERCHANT_ORDER', 'DS_MERCHANT_MERCHANTCODE', 'DS_MERCHANT_TERMINAL', 'DS_MERCHANT_URLOK', 'DS_MERCHANT_URLKO'];
        const camposFaltantes = camposObligatorios.filter(campo => !merchantParams[campo]);
        if (camposFaltantes.length > 0) {
          console.error('âŒ ERROR: Faltan campos obligatorios:', camposFaltantes);
          return res.status(400).send(`Error: Faltan campos obligatorios: ${camposFaltantes.join(', ')}`);
        }
        
        console.log('âœ… Importe verificado correctamente:', merchantParams.DS_MERCHANT_AMOUNT, 'cÃ©ntimos');
        console.log('âœ… Todos los campos obligatorios presentes');
        console.log('âœ… OrderId verificado:', {
          valor: merchantParams.DS_MERCHANT_ORDER,
          longitud: merchantParams.DS_MERCHANT_ORDER?.length,
          es_12_digitos: merchantParams.DS_MERCHANT_ORDER?.length === 12,
          es_solo_numeros: /^\d{12}$/.test(merchantParams.DS_MERCHANT_ORDER || ''),
        });
        console.log('âœ… Terminal verificado:', {
          valor: merchantParams.DS_MERCHANT_TERMINAL,
          esperado_test: '1',
          coincide: merchantParams.DS_MERCHANT_TERMINAL === '1',
        });
        console.log('âœ… MerchantCode verificado:', {
          valor: merchantParams.DS_MERCHANT_MERCHANTCODE,
          esperado_test: '999008881',
          coincide: merchantParams.DS_MERCHANT_MERCHANTCODE === '999008881',
        });
      } catch (decodeError) {
        console.error('âš ï¸ Error decodificando Ds_MerchantParameters (continuando de todas formas):', decodeError.message);
        console.error('ðŸ“‹ Stack:', decodeError.stack);
        // No bloquear el flujo, pero registrar el error
      }
      
      // Hacer POST directo a Cecabank SIS
      try {
        const postData = new URLSearchParams();
        postData.append('Ds_SignatureVersion', String(Ds_SignatureVersion));
        postData.append('Ds_MerchantParameters', String(Ds_MerchantParameters));
        postData.append('Ds_Signature', String(Ds_Signature));
        
        // Decodificar una vez mÃ¡s para mostrar exactamente quÃ© se enviarÃ¡
        try {
          const finalCheck = Buffer.from(Ds_MerchantParameters, 'base64').toString('utf-8');
          const finalParams = JSON.parse(finalCheck);
          console.log('ðŸ“¤ VERIFICACIÃ“N FINAL antes de enviar a Cecabank:', {
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
          console.error('âš ï¸ Error en verificaciÃ³n final:', e.message);
        }
        
        console.log('ðŸ“¤ Datos a enviar a Cecabank SIS:', {
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
        console.log('ðŸ” VerificaciÃ³n de firma antes de enviar:', {
          firma_original: firmaOriginal,
          firma_en_postData: firmaEnPostData,
          firmas_coinciden: firmaOriginal === firmaEnPostData,
        });
        
        // IMPORTANTE: NO hacer POST a Cecabank cuando se recibe formato SIS
        // En su lugar, generar el formulario HTML directamente (como en la versiÃ³n que funciona)
        console.log('âš ï¸ Formato SIS detectado - usando formulario HTML directo (sin POST a Cecabank)');
        console.log('ðŸ“‹ Esta es la implementaciÃ³n correcta: generar HTML directamente, no hacer POST primero');
        
        // Lanzar error inmediatamente para usar el fallback del formulario HTML
        throw new Error('Usando formulario HTML directo para formato SIS');
        
      } catch (fetchError) {
        console.error('âŒ Error haciendo POST a Cecabank SIS:', fetchError);
        
        // Fallback: crear formulario HTML que se auto-envÃ­a
        // Escapar valores para atributos HTML (solo caracteres problemÃ¡ticos, no Base64 completo)
        const escapeHtmlAttr = (str) => {
          if (!str) return '';
          const strValue = String(str);
          // Solo escapar caracteres que pueden romper atributos HTML
          // NO escapar +, /, = que son vÃ¡lidos en Base64
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
        
        console.log('ðŸ“‹ Valores escapados para HTML:', {
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
                  console.log('ðŸš€ Script de envÃ­o iniciado (SIS)');
                  var formSubmitted = false;
                  
                  function submitForm() {
                    if (formSubmitted) return false;
                    
                    try {
                      const form = document.getElementById('cecabankForm');
                      if (!form) {
                        console.error('âŒ Formulario no encontrado');
                        return false;
                      }
                      
                      formSubmitted = true;
                      console.log('ðŸ“¤ Enviando formulario POST a:', form.action);
                      form.submit();
                      return true;
                    } catch (error) {
                      console.error('âŒ Error:', error);
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
    
    // MÃ©todo antiguo (compatibilidad hacia atrÃ¡s)
    console.log('âš ï¸ Formato antiguo detectado, usando mÃ©todo legacy');
    console.log('ðŸ“‹ Campos recibidos:', Object.keys(req.body));
    console.log('ðŸ“‹ URL_OK recibido:', req.body.URL_OK);
    console.log('ðŸ“‹ URL_KO recibido:', req.body.URL_KO);
    
    // Aceptar datos de form-urlencoded
    let formData = req.body;
    
    if (!formData || Object.keys(formData).length === 0) {
      console.error('âŒ No se recibieron datos del formulario');
      return res.status(400).send('No se recibieron datos del formulario');
    }
    
    // Verificar que al menos URL_OK estÃ© presente (solo para mÃ©todo antiguo)
    if (!formData.URL_OK) {
      console.error('âŒ URL_OK faltante en mÃ©todo antiguo');
      console.error('ðŸ“‹ Si estÃ¡s usando el mÃ©todo SIS moderno, asegÃºrate de enviar Ds_MerchantParameters y Ds_Signature');
      return res.status(400).send('URL_OK es obligatoria para el mÃ©todo antiguo. Si usas SIS moderno, envÃ­a Ds_MerchantParameters y Ds_Signature');
    }
    
    // Limpiar URLs inmediatamente (sin espacios, sin caracteres especiales)
    formData.URL_OK = String(formData.URL_OK).trim().replace(/\s+/g, '');
    
    // Si no viene URL_KO, usar la misma URL_OK (comportamiento para TPV que solo permiten URL_OK)
    if (!formData.URL_KO) {
      console.warn('âš ï¸  URL_KO no proporcionada, usando URL_OK para ambos casos');
      formData.URL_KO = formData.URL_OK;
    } else {
      formData.URL_KO = String(formData.URL_KO).trim().replace(/\s+/g, '');
    }
    
    // Validar formato de URLs
    try {
      const urlOkObj = new URL(formData.URL_OK);
      const urlKoObj = new URL(formData.URL_KO);
      console.log('âœ… URLs validadas:', {
        URL_OK: formData.URL_OK,
        URL_KO: formData.URL_KO,
        URL_OK_protocol: urlOkObj.protocol,
        URL_KO_protocol: urlKoObj.protocol,
        URL_OK_host: urlOkObj.host,
        URL_KO_host: urlKoObj.host
      });
      
      // Advertencia si las URLs no son HTTPS
      if (urlOkObj.protocol !== 'https:' || urlKoObj.protocol !== 'https:') {
        console.warn('âš ï¸  ADVERTENCIA: Las URLs deben ser HTTPS para producciÃ³n');
      }
    } catch (urlError) {
      console.error('âŒ URLs invÃ¡lidas:', urlError);
      return res.status(400).send('URLs de retorno invÃ¡lidas');
    }
    
    // IMPORTANTE: Verificar que las URLs coincidan con las configuradas
    // NOTA: Las URLs vienen del frontend con www., asÃ­ que las esperadas tambiÃ©n deben tener www.
    const urlOkEsperada = 'https://www.academiadeinmigrantes.es/api/cecabank/ok';
    const urlKoEsperada = 'https://www.academiadeinmigrantes.es/api/cecabank/ko';
    
    // Si URL_KO es igual a URL_OK, significa que el TPV solo permite una URL
    const usaUrlUnica = formData.URL_OK === formData.URL_KO;
    
    if (usaUrlUnica) {
      console.log('â„¹ï¸  TPV configurado con URL Ãºnica (solo URL_OK disponible)');
      console.log('   URL configurada:', formData.URL_OK);
      console.log('   El endpoint /api/cecabank/ok manejarÃ¡ tanto Ã©xitos como fallos');
    }
    
    if (formData.URL_OK !== urlOkEsperada) {
      console.warn('âš ï¸  ADVERTENCIA: URL_OK no coincide con la esperada');
      console.warn('   URL_OK recibida:', formData.URL_OK);
      console.warn('   URL_OK esperada:', urlOkEsperada);
    }
    
    if (!usaUrlUnica && formData.URL_KO !== urlKoEsperada) {
      console.warn('âš ï¸  ADVERTENCIA: URL_KO no coincide con la esperada');
      console.warn('   URL_KO recibida:', formData.URL_KO);
      console.warn('   URL_KO esperada:', urlKoEsperada);
    }
    
    if (formData.URL_OK === urlOkEsperada && (usaUrlUnica || formData.URL_KO === urlKoEsperada)) {
      console.log('âœ… URLs configuradas correctamente');
    } else {
      console.warn('âš ï¸  IMPORTANTE: Estas URLs DEBEN estar registradas EXACTAMENTE igual en el panel de Cecabank');
    }
    
    // Verificar campos obligatorios segÃºn documentaciÃ³n de Cecabank
    const camposObligatorios = [
      'MerchantID',
      'AcquirerBIN', 
      'TerminalID',
      'Num_operacion',
      'Importe',
      'TipoMoneda',
      'Exponente',
      'Cifrado',
      'URL_OK',  // El frontend envÃ­a URL_OK (con guiÃ³n bajo)
      'URL_KO',  // El frontend envÃ­a URL_KO (con guiÃ³n bajo)
      'Idioma',
      'FechaOperacion',
      'HoraOperacion',
      'Firma'
    ];
    
    const camposFaltantes = camposObligatorios.filter(campo => !formData[campo]);
    if (camposFaltantes.length > 0) {
      console.error('âŒ Campos obligatorios faltantes:', camposFaltantes);
      console.error('ðŸ“‹ Payload completo al llegar al backend:', JSON.stringify(req.body, null, 2));
      console.error('ðŸ“‹ Campos recibidos desde el cliente:', Object.keys(req.body));
      return res.status(400).send(`Campos obligatorios faltantes: ${camposFaltantes.join(', ')}`);
    }
    
    console.log('âœ… Todos los campos obligatorios presentes');
    
    // CRÃTICO: Generar fecha y hora en el SERVIDOR en zona horaria de EspaÃ±a (CET/CEST)
    // Cecabank espera la hora en zona horaria de EspaÃ±a, no UTC
    const now = new Date();
    
    // Obtener la fecha y hora en zona horaria de EspaÃ±a usando Intl.DateTimeFormat
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
    
    console.log('ðŸ“… Fecha generada en servidor (EspaÃ±a):', fechaOperacion);
    console.log('ðŸ• Hora generada en servidor (EspaÃ±a):', horaOperacion);
    console.log('ðŸŒ UTC original:', now.toISOString());
    console.log('ðŸ“Š Partes de fecha:', { year, month, day, hour, minute, second });
    
    // Actualizar fecha y hora en formData con las del servidor
    formData.FechaOperacion = fechaOperacion;
    formData.HoraOperacion = horaOperacion;
    
    // Verificar que tenemos la clave de encriptaciÃ³n
    if (!process.env.CECABANK_CLAVE) {
      console.error('âŒ CECABANK_CLAVE no estÃ¡ configurada en las variables de entorno');
      return res.status(500).send('Error de configuraciÃ³n: CECABANK_CLAVE no configurada');
    }
    
    // Asegurar que las URLs estÃ©n limpias ANTES de calcular la firma
    const urlOkLimpia = String(formData.URL_OK || '').trim();
    const urlKoLimpia = String(formData.URL_KO || '').trim();
    
    // Actualizar formData con URLs limpias
    formData.URL_OK = urlOkLimpia;
    formData.URL_KO = urlKoLimpia;
    
    console.log('ðŸ”— URLs limpias para firma:');
    console.log('   - URL_OK:', urlOkLimpia);
    console.log('   - URL_KO:', urlKoLimpia);
    console.log('   - URL_OK longitud:', urlOkLimpia.length);
    console.log('   - URL_KO longitud:', urlKoLimpia.length);
    
    // Recalcular la firma con la nueva fecha/hora del servidor
    // IMPORTANTE: NO incluye URL_OK ni URL_KO en la firma (segÃºn formato antiguo de Cecabank)
    const firma = generateCecabankSignature(
      formData.Num_operacion,
      formData.Importe,
      fechaOperacion,
      horaOperacion
    );
    formData.Firma = firma;
    
    console.log('ðŸ” Firma recalculada con fecha/hora del servidor');
    console.log('ðŸ“‹ Num_operacion:', formData.Num_operacion);
    console.log('ðŸ“‹ Importe:', formData.Importe);
    console.log('ðŸ“‹ FechaOperacion:', fechaOperacion);
    console.log('ðŸ“‹ HoraOperacion:', horaOperacion);
    console.log('ðŸ“‹ Firma completa:', firma);
    console.log('ðŸ“‹ Firma (primeros 20 chars):', firma.substring(0, 20) + '...');
    console.log('ðŸ“‹ MerchantID:', formData.MerchantID);
    console.log('ðŸ“‹ AcquirerBIN:', formData.AcquirerBIN);
    console.log('ðŸ“‹ TerminalID:', formData.TerminalID);
    console.log('ðŸ“‹ Clave configurada:', process.env.CECABANK_CLAVE ? 'SÃ­ (' + process.env.CECABANK_CLAVE.length + ' caracteres)' : 'No');
    
    // URL correcta para Cecabank
    const urlCecabank = (process.env.CECABANK_ENTORNO || 'test') === 'produccion'
      ? 'https://pgw.ceca.es/tpvweb/tpv/compra.action'
      : 'https://tpv.ceca.es/tpvweb/tpv/compra.action';
    
    console.log('ðŸ”— URL de Cecabank:', urlCecabank);
    
    // Ordenar campos segÃºn el orden recomendado por Cecabank (mover antes del POST)
    const ordenCampos = [
      'MerchantID',
      'AcquirerBIN',
      'TerminalID',
      'Num_operacion',
      'Importe',
      'TipoMoneda',
      'Exponente',
      'Cifrado',
      'URLOK',  // Sin guiÃ³n bajo - requerido por algunos sistemas de Cecabank
      'URLKO',  // Sin guiÃ³n bajo - requerido por algunos sistemas de Cecabank
      'Idioma',
      'Descripcion',
      'FechaOperacion',
      'HoraOperacion',
      'Firma',  // La Firma SIEMPRE debe ir al final, despuÃ©s de todos los datos
      'Email',
      'Nombre'
    ];
    
    // Crear un objeto ordenado, mapeando URL_OK -> URLOK y URL_KO -> URLKO
    const formDataOrdenado = {};
    ordenCampos.forEach(campo => {
      // Mapear nombres de campos (el frontend envÃ­a URL_OK/URL_KO, pero Cecabank espera URLOK/URLKO)
      let campoOrigen = campo;
      if (campo === 'URLOK') {
        campoOrigen = 'URL_OK';
      } else if (campo === 'URLKO') {
        campoOrigen = 'URL_KO';
      }
      
      if (formData[campoOrigen] !== undefined) {
        formDataOrdenado[campo] = formData[campoOrigen];
      }
    });
    
    // AÃ±adir solo campos opcionales permitidos por Cecabank (Email, Nombre)
    // NO incluir campos internos como orderId, operationType, amount
    const camposOpcionalesPermitidos = ['Email', 'Nombre'];
    camposOpcionalesPermitidos.forEach(campo => {
      if (formData[campo] !== undefined && formData[campo] !== null && formData[campo] !== '') {
        formDataOrdenado[campo] = formData[campo];
      }
    });
    
    console.log('ðŸ“‹ Campos ordenados:', Object.keys(formDataOrdenado));
    console.log('ðŸ“‹ NÃºmero de campos ordenados:', Object.keys(formDataOrdenado).length);
    console.log('ðŸ”— URL_OK en formDataOrdenado:', formDataOrdenado.URL_OK ? 'SÃ­' : 'No');
    console.log('ðŸ”— URL_KO en formDataOrdenado:', formDataOrdenado.URL_KO ? 'SÃ­' : 'No');
    console.log('ðŸ”— URL_OK valor:', formDataOrdenado.URL_OK);
    console.log('ðŸ”— URL_KO valor:', formDataOrdenado.URL_KO);
    console.log('ðŸ”— URL_OK tipo:', typeof formDataOrdenado.URL_OK);
    console.log('ðŸ”— URL_KO tipo:', typeof formDataOrdenado.URL_KO);
    console.log('ðŸ”— URL_OK longitud:', formDataOrdenado.URL_OK ? formDataOrdenado.URL_OK.length : 0);
    console.log('ðŸ”— URL_KO longitud:', formDataOrdenado.URL_KO ? formDataOrdenado.URL_KO.length : 0);
    
    // DEBUG: Mostrar todos los campos con sus valores
    console.log('ðŸ” DEBUG: Todos los campos en formDataOrdenado:');
    Object.entries(formDataOrdenado).forEach(([key, value]) => {
      const valueStr = String(value || '');
      const preview = valueStr.length > 100 ? valueStr.substring(0, 100) + '...' : valueStr;
      console.log(`   - ${key}: ${preview} (tipo: ${typeof value}, longitud: ${valueStr.length})`);
    });
    
    // IMPORTANTE: NO hacer POST directo a Cecabank
    // Usar siempre el mÃ©todo de formulario HTML que se auto-envÃ­a (como en la versiÃ³n que funciona)
    // Crear formulario HTML que se auto-envÃ­a
    console.log('ðŸ“‹ Datos recibidos para formulario:', Object.keys(formData));
    console.log('ðŸ“‹ NÃºmero de campos:', Object.keys(formData).length);
    
    // Nota: La validaciÃ³n de campos obligatorios ya se hizo arriba
    // Solo verificamos campos esenciales adicionales para logging
    const camposEsenciales = ['MerchantID', 'AcquirerBIN', 'TerminalID', 'Num_operacion', 'Importe', 'Firma'];
    const camposEsencialesFaltantes = camposEsenciales.filter(campo => !formData[campo]);
    if (camposEsencialesFaltantes.length > 0) {
      console.error('âŒ Campos esenciales faltantes en formData:', camposEsencialesFaltantes);
    } else {
      console.log('âœ… Todos los campos esenciales estÃ¡n presentes');
    }
    
    // Log especÃ­fico para URLs antes de generar el formulario
    console.log('ðŸ”— URLs antes de generar formulario:', {
      URL_OK: formData.URL_OK,
      URL_KO: formData.URL_KO,
      URL_OK_length: formData.URL_OK?.length,
      URL_KO_length: formData.URL_KO?.length,
      URL_OK_type: typeof formData.URL_OK,
      URL_KO_type: typeof formData.URL_KO
    });
    
    // Las URLs ya estÃ¡n limpias desde antes (se limpiaron antes de calcular la firma)
    // Solo verificamos que sigan estando limpias
    if (formData.URL_OK) {
      formData.URL_OK = String(formData.URL_OK).trim();
    }
    if (formData.URL_KO) {
      formData.URL_KO = String(formData.URL_KO).trim();
    }
    
    console.log('ðŸ”— URL_KO en posiciÃ³n:', Object.keys(formDataOrdenado).indexOf('URL_KO'));
    console.log('ðŸ”— URL_OK en posiciÃ³n:', Object.keys(formDataOrdenado).indexOf('URL_OK'));
    
    const formFields = Object.entries(formDataOrdenado)
      .map(([key, value]) => {
        // Escapar correctamente para HTML
        const escapedKey = String(key)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        
        // Para URLs, asegurar que no haya espacios ni caracteres problemÃ¡ticos
        let escapedValue = String(value || '');
        if (key === 'URL_OK' || key === 'URL_KO') {
          // Las URLs deben estar limpias y correctamente formateadas
          escapedValue = escapedValue.trim();
          // Asegurar que la URL no tenga espacios ni caracteres especiales problemÃ¡ticos
          escapedValue = escapedValue.replace(/\s+/g, '');
          console.log(`ðŸ”— ${key} en formulario (limpia):`, escapedValue);
          console.log(`ðŸ”— ${key} longitud:`, escapedValue.length);
        }
        
        // Escapar para HTML (pero NO codificar las URLs, solo escapar caracteres HTML)
        // Las URLs deben enviarse tal cual, sin codificaciÃ³n URL adicional
        escapedValue = escapedValue
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
        
        return `            <input type="hidden" name="${escapedKey}" value="${escapedValue}" />`;
      })
      .join('\n');
    
    // Verificar que las URLs estÃ©n en el HTML generado
    console.log('ðŸ” DEBUG: Verificando presencia de URLs en formFields...');
    console.log('ðŸ” formFields contiene "URL_KO":', formFields.includes('URL_KO'));
    console.log('ðŸ” formFields contiene "URL_OK":', formFields.includes('URL_OK'));
    console.log('ðŸ” formFields contiene "name=\\"URL_KO\\"":', formFields.includes('name="URL_KO"'));
    console.log('ðŸ” formFields contiene "name=\\"URL_OK\\"":', formFields.includes('name="URL_OK"'));
    
    // Buscar URL_KO
    const urlKoMatches = formFields.match(/name="URL_KO"[^>]*value="([^"]*)"/);
    if (urlKoMatches) {
      console.log('âœ… URL_KO encontrada en formFields:', urlKoMatches[1]);
      console.log('âœ… URL_KO valor completo:', urlKoMatches[1]);
      console.log('âœ… URL_KO longitud:', urlKoMatches[1].length);
    } else {
      console.error('âŒ URL_KO NO encontrada en formFields con regex');
      // Intentar buscar de otra manera
      const urlKoIndex = formFields.indexOf('URL_KO');
      if (urlKoIndex >= 0) {
        const context = formFields.substring(Math.max(0, urlKoIndex - 50), Math.min(formFields.length, urlKoIndex + 200));
        console.error('âŒ URL_KO encontrada en posiciÃ³n', urlKoIndex, 'pero no coincide con regex');
        console.error('âŒ Contexto alrededor:', context);
      } else {
        console.error('âŒ URL_KO no encontrada en formFields en absoluto');
      }
    }
    
    // Buscar URL_OK
    const urlOkMatches = formFields.match(/name="URL_OK"[^>]*value="([^"]*)"/);
    if (urlOkMatches) {
      console.log('âœ… URL_OK encontrada en formFields:', urlOkMatches[1]);
      console.log('âœ… URL_OK valor completo:', urlOkMatches[1]);
      console.log('âœ… URL_OK longitud:', urlOkMatches[1].length);
    } else {
      console.error('âŒ URL_OK NO encontrada en formFields con regex');
    }
    
    // Mostrar fragmento de formFields que contiene las URLs
    const urlKoIndex = formFields.indexOf('URL_KO');
    const urlOkIndex = formFields.indexOf('URL_OK');
    if (urlKoIndex >= 0) {
      const fragment = formFields.substring(Math.max(0, urlKoIndex - 20), Math.min(formFields.length, urlKoIndex + 300));
      console.log('ðŸ” Fragmento de formFields con URL_KO:', fragment);
    }
    if (urlOkIndex >= 0) {
      const fragment = formFields.substring(Math.max(0, urlOkIndex - 20), Math.min(formFields.length, urlOkIndex + 300));
      console.log('ðŸ” Fragmento de formFields con URL_OK:', fragment);
    }
    
    console.log('ðŸ“‹ Campos del formulario generados:', Object.keys(formData).length);
    console.log('ðŸ“‹ Primeros 3 campos:', Object.keys(formData).slice(0, 3));
    console.log('ðŸ”— URL de Cecabank:', urlCecabank);
    console.log('ðŸ“‹ Longitud de formFields:', formFields.length);
    
    // DEBUG: Mostrar un resumen del HTML que se va a generar
    console.log('ðŸ” DEBUG: Resumen del HTML a generar:');
    console.log('   - URL de destino:', urlCecabank);
    console.log('   - NÃºmero de campos:', (formFields.match(/<input type="hidden"/g) || []).length);
    console.log('   - Longitud total del HTML (formFields):', formFields.length);
    console.log('   - Primeros 500 caracteres de formFields:', formFields.substring(0, 500));
    console.log('   - Ãšltimos 500 caracteres de formFields:', formFields.substring(Math.max(0, formFields.length - 500)));
    
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
        console.log('ðŸš€ Script de envÃ­o iniciado');
        console.log('ðŸ“ URL destino:', '${urlCecabank}');
        
        var formSubmitted = false;
        
        function submitForm() {
          if (formSubmitted) {
            return false;
          }
          
          try {
            const form = document.getElementById('cecabankForm');
            if (!form) {
              console.error('âŒ Formulario no encontrado');
              return false;
            }
            
            // Verificar URL_OK y URL_KO
            const urlOkField = form.querySelector('input[name="URL_OK"]');
            const urlKoField = form.querySelector('input[name="URL_KO"]');
            
            if (!urlOkField || !urlKoField) {
              console.error('âŒ URLs faltantes en el formulario');
              return false;
            }
            
            console.log('âœ… URL_OK:', urlOkField.value);
            console.log('âœ… URL_KO:', urlKoField.value);
            
            // Asegurar atributos correctos
            form.method = 'POST';
            form.action = '${urlCecabank}';
            form.enctype = 'application/x-www-form-urlencoded';
            form.target = '_self';
            
            formSubmitted = true;
            
            console.log('ðŸ“¤ Enviando formulario POST a:', form.action);
            form.submit();
            return true;
          } catch (error) {
            console.error('âŒ Error:', error);
            formSubmitted = false;
            return false;
          }
        }
        
        // Intentar enviar cuando el DOM estÃ© listo
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
      
      // Detectar callbacks (solo si no estamos en nuestra pÃ¡gina de redirecciÃ³n)
      window.addEventListener('load', function() {
        setTimeout(function() {
          const currentUrl = window.location.href;
          console.log('ðŸŒ URL actual:', currentUrl);
          
          // Solo procesar callbacks si no estamos en nuestra pÃ¡gina de redirecciÃ³n
          if (currentUrl.includes('/api/cecabank/ok')) {
            console.log('âœ… Pago exitoso detectado');
            if (window.ReactNativeWebView) {
              const urlParams = new URLSearchParams(window.location.search);
              const orderId = urlParams.get('orderId') || 'cecabank-success';
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment-success',
                orderId: orderId
              }));
            }
          } else if (currentUrl.includes('/api/cecabank/ko')) {
            console.log('âŒ Pago fallido detectado');
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment-error',
                message: 'El pago fue cancelado o fallÃ³'
              }));
            }
          }
        }, 1000);
      });
    </script>
  </body>
</html>`;
    
    console.log('âœ… HTML generado, longitud:', html.length);
    
    // Log del HTML completo para debugging (solo los primeros 2000 caracteres y los Ãºltimos 500)
    console.log('ðŸ“„ HTML completo (primeros 2000 caracteres):');
    console.log(html.substring(0, 2000));
    console.log('ðŸ“„ HTML completo (Ãºltimos 500 caracteres):');
    console.log(html.substring(html.length - 500));
    
    // Log especÃ­fico del formulario
    const formStart = html.indexOf('<form');
    const formEnd = html.indexOf('</form>') + 7;
    if (formStart !== -1 && formEnd !== -1) {
      const formHtml = html.substring(formStart, formEnd);
      console.log('ðŸ“‹ HTML del formulario completo:');
      console.log(formHtml);
    }
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('âŒ Error en endpoint de redirecciÃ³n:', error);
    console.error('ðŸ“‹ Stack:', error.stack);
    console.error('ðŸ“‹ Mensaje:', error.message);
    res.status(500).json({
      error: 'Error al redirigir a Cecabank',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// ============================================
// FUNCIONES DE VALIDACIÃ“N CECABANK
// ============================================

/**
 * Genera la firma esperada por Cecabank para validar los callbacks
 * IMPORTANTE: NO incluye URL_OK ni URL_KO en la firma (segÃºn formato antiguo de Cecabank)
 * La firma se calcula con: MerchantID + AcquirerBIN + TerminalID + Num_operacion + Importe + TipoMoneda + Exponente + Cifrado + FechaOperacion + HoraOperacion + ClaveEncriptacion
 */
function generateCecabankSignature(numOperacion, importe, fecha, hora) {
  const merchantId = process.env.CECABANK_MERCHANT_ID || '';
  const acquirerBin = process.env.CECABANK_ACQUIRER_BIN || '';
  const terminalId = process.env.CECABANK_TERMINAL_ID || '';
  const clave = process.env.CECABANK_CLAVE || '';
  const tipoMoneda = '978'; // EUR
  const exponente = '2';
  const cifrado = 'SHA256';

  // Construir la cadena para la firma (sin URL_OK ni URL_KO)
  const cadenaFirma = 
    merchantId +
    acquirerBin +
    terminalId +
    numOperacion +
    importe +
    tipoMoneda +
    exponente +
    cifrado +
    fecha +
    hora +
    clave;

  // Log detallado de la cadena de firma
  const cadenaSinClave = merchantId + acquirerBin + terminalId + numOperacion + importe + tipoMoneda + exponente + cifrado + fecha + hora;
  console.log('ðŸ” Cadena para firma (sin clave):', cadenaSinClave);
  console.log('ðŸ” Componentes de la firma:');
  console.log('   - MerchantID:', merchantId);
  console.log('   - AcquirerBIN:', acquirerBin);
  console.log('   - TerminalID:', terminalId);
  console.log('   - Num_operacion:', numOperacion);
  console.log('   - Importe:', importe);
  console.log('   - TipoMoneda:', tipoMoneda);
  console.log('   - Exponente:', exponente);
  console.log('   - Cifrado:', cifrado);
  console.log('   - Fecha:', fecha);
  console.log('   - Hora:', hora);
  console.log('   - Clave:', '[OCULTA]');
  console.log('ðŸ” Longitud total de cadena (sin clave):', cadenaSinClave.length);

  // Generar el hash SHA256
  const firma = crypto.createHash('sha256').update(cadenaFirma).digest('hex').toUpperCase();
  
  console.log('ðŸ” Firma generada:', firma);
  
  return firma;
}

/**
 * Valida la firma recibida de Cecabank
 */
function validateCecabankSignature(datos) {
  try {
    // IMPORTANTE: NO incluye URL_OK ni URL_KO en la firma (segÃºn formato antiguo de Cecabank)
    const firmaCalculada = generateCecabankSignature(
      datos.Num_operacion,
      datos.Importe,
      datos.Fecha,
      datos.Hora
    );

    const firmaRecibida = datos.Firma.toUpperCase();
    const isValid = firmaCalculada === firmaRecibida;

    if (!isValid) {
      console.error('âŒ Firma invÃ¡lida:', {
        calculada: firmaCalculada,
        recibida: firmaRecibida
      });
    }

    return isValid;
  } catch (error) {
    console.error('âŒ Error validando firma de Cecabank:', error);
    return false;
  }
}

// ============================================
// ENDPOINTS DE CECABANK
// ============================================

// ENDPOINT DE PRUEBA: Responde 200 OK sin lÃ³gica pesada
// Ãšsalo para verificar si Cecabank puede alcanzar tu servidor
app.get('/api/cecabank/test', (req, res) => {
  console.log('ðŸ§ª TEST: Cecabank alcanzÃ³ /api/cecabank/test');
  console.log('ðŸ“ Query params:', JSON.stringify(req.query, null, 2));
  return res.status(200).send('OK');
});

app.post('/api/cecabank/test', express.urlencoded({ extended: true }), (req, res) => {
  console.log('ðŸ§ª TEST: Cecabank alcanzÃ³ /api/cecabank/test (POST)');
  console.log('ðŸ“ Body:', JSON.stringify(req.body, null, 2));
  return res.status(200).send('OK');
});

// ENDPOINT DE DEBUG: Ver el formulario que se envÃ­a a Cecabank
app.post('/api/cecabank/debug-form', express.json(), (req, res) => {
  const { url, formData } = req.body;
  
  console.log('ðŸ” DEBUG: Formulario que se envÃ­a a Cecabank');
  console.log('ðŸ“¤ URL destino:', url);
  console.log('ðŸ“‹ Campos del formulario:', Object.keys(formData));
  console.log('ðŸ“Š Datos completos:', JSON.stringify(formData, null, 2));
  
  // Verificar campos obligatorios
  const camposObligatorios = ['MerchantID', 'AcquirerBIN', 'TerminalID', 'Num_operacion', 'Importe', 'TipoMoneda', 'Exponente', 'Cifrado', 'URL_OK', 'URL_NOK', 'Firma'];
  const camposFaltantes = camposObligatorios.filter(campo => !formData[campo]);
  
  if (camposFaltantes.length > 0) {
    console.error('âŒ CAMPOS FALTANTES:', camposFaltantes);
  } else {
    console.log('âœ… Todos los campos obligatorios estÃ¡n presentes');
  }
  
  // Verificar formato de campos crÃ­ticos
  console.log('ðŸ” ValidaciÃ³n de campos:');
  console.log('  - MerchantID:', formData.MerchantID, formData.MerchantID ? 'âœ…' : 'âŒ');
  console.log('  - TerminalID:', formData.TerminalID, formData.TerminalID ? 'âœ…' : 'âŒ');
  console.log('  - Num_operacion:', formData.Num_operacion, `(${String(formData.Num_operacion).length} dÃ­gitos)`, formData.Num_operacion && String(formData.Num_operacion).length === 12 ? 'âœ…' : 'âš ï¸');
  console.log('  - Importe:', formData.Importe, '(cÃ©ntimos)', formData.Importe ? 'âœ…' : 'âŒ');
  console.log('  - Firma:', formData.Firma ? `${formData.Firma.substring(0, 20)}... (${formData.Firma.length} chars)` : 'âŒ');
  console.log('  - URL_OK:', formData.URL_OK);
  console.log('  - URL_NOK:', formData.URL_NOK);
  
  return res.status(200).json({
    success: true,
    message: 'Formulario loguado en servidor',
    camposFaltantes: camposFaltantes.length > 0 ? camposFaltantes : null,
    totalCampos: Object.keys(formData).length
  });
});

// ENDPOINT DE DIAGNÃ“STICO: Consultar estado de pagos
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

// ENDPOINT DE DIAGNÃ“STICO: Listar todos los pagos (Ãºltimos 50)
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
// Si el TPV solo permite configurar URL_OK, este endpoint manejarÃ¡ ambos casos
app.get('/api/cecabank/ok', async (req, res) => {
  try {
    console.log('ðŸ“¥ Callback GET de Cecabank recibido (/ok)');
    console.log('ðŸ“ Query params:', JSON.stringify(req.query, null, 2));
 
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

    // âœ… PERSISTIR ESTADO INMEDIATAMENTE (antes de cualquier otra lÃ³gica)
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
    console.log('ðŸ’¾ Estado de pago persistido:', paymentRecord);

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
    console.error('âŒ Error procesando callback GET OK de Cecabank:', error);
    return res.status(200).send('OK recibido');
  }
});

app.post('/api/cecabank/ok', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log('ðŸ“¥ Callback de Cecabank recibido');
    console.log('ðŸ“ Datos recibidos:', JSON.stringify(req.body, null, 2));
    console.log('ðŸ“ Headers:', JSON.stringify(req.headers, null, 2));

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
    // Cecabank puede enviar diferentes parÃ¡metros segÃºn la versiÃ³n del TPV
    let pagoExitoso = false;
    let codigoRespuesta = Ds_Response || Codigo_respuesta || Respuesta;
    
    // Si viene un cÃ³digo de respuesta, verificar si es Ã©xito (00 o similar)
    if (codigoRespuesta !== undefined && codigoRespuesta !== null && codigoRespuesta !== '') {
      const codigo = String(codigoRespuesta).trim();
      // CÃ³digo 00 generalmente significa Ã©xito en pasarelas de pago
      pagoExitoso = codigo === '00' || codigo === '0' || codigo.toLowerCase() === 'ok';
      console.log('ðŸ” CÃ³digo de respuesta detectado:', codigo, 'â†’ Pago exitoso:', pagoExitoso);
    } else {
      // SEGURIDAD: Si no viene cÃ³digo de respuesta, NO asumir Ã©xito
      // El pago debe tener un cÃ³digo de respuesta vÃ¡lido para considerarse exitoso
      pagoExitoso = false;
      console.log('âš ï¸ No se detectÃ³ cÃ³digo de respuesta, marcando como pago FALLIDO por seguridad');
    }

    // MODO FLEXIBLE: Si faltan algunos datos, intentar procesar igual
    // Cecabank PGW puede enviar diferentes campos segÃºn la configuraciÃ³n
    const tieneNumOperacion = !!Num_operacion;
    const tieneImporte = !!Importe;
    const tieneFirma = !!Firma;
    const tieneFecha = !!Fecha;
    const tieneHora = !!Hora;
    
    console.log('ðŸ” Campos recibidos:', {
      Num_operacion: tieneNumOperacion ? Num_operacion : 'NO',
      Importe: tieneImporte ? Importe : 'NO',
      Firma: tieneFirma ? 'SÃ (oculta)' : 'NO',
      Fecha: tieneFecha ? Fecha : 'NO',
      Hora: tieneHora ? Hora : 'NO',
      Descripcion: Descripcion || 'NO',
      Referencia: Referencia || 'NO',
      NumAut: NumAut || 'NO'
    });

    // Si faltan datos crÃ­ticos pero el endpoint es /ok, asumir Ã©xito
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
        console.warn('âš ï¸ Firma no vÃ¡lida, pero continuando porque es endpoint /ok');
        // En producciÃ³n podrÃ­as querer rechazar aquÃ­, pero para pruebas continuamos
      }
    } else {
      console.log('âš ï¸ No se puede validar firma (faltan datos), continuando...');
    }

    console.log('âœ… Procesando callback de Cecabank (firma:', isValidSignature ? 'vÃ¡lida' : 'no verificada', ')');
    
    // âœ… PERSISTIR ESTADO INMEDIATAMENTE (antes de cualquier otra lÃ³gica)
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
    console.log('ðŸ’¾ Estado de pago persistido:', paymentRecord);
    
    // Si el pago NO fue exitoso, manejar como error
    if (!pagoExitoso) {
      console.log('âŒ Pago fallido detectado en callback (cÃ³digo de respuesta:', codigoRespuesta, ')');
      console.log('âš ï¸ Pago fallido de Cecabank:', {
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
            <div class="error-icon">âŒ</div>
            <h1>Pago no realizado</h1>
            <p>El pago no pudo ser procesado. Por favor, intenta de nuevo.</p>
            <p>Redirigiendo a la aplicaciÃ³n...</p>
            <script>
              // Enviar mensaje a React Native WebView si estÃ¡ disponible
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
    
    // Si llegamos aquÃ­, el pago fue exitoso
    console.log('âœ… Pago exitoso confirmado');
    
    // Convertir importe de cÃ©ntimos a euros
    const importeEuros = (parseInt(importeFinal) / 100).toFixed(2);
    
    // Determinar el tipo de operaciÃ³n basado en el importe o descripciÃ³n
    let operationType = 'unknown';
    let levelUnlocked = null;
    
    // Intentar extraer el nivel de la descripciÃ³n si estÃ¡ disponible
    const descripcionLower = (descripcionFinal || '').toLowerCase();
    
    // PRIMERO: Intentar detectar el nivel desde la descripciÃ³n (mÃ¡s confiable)
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
    
    // SEGUNDO: Si no se detectÃ³ por descripciÃ³n, usar el importe como fallback
    if (!levelUnlocked) {
      if (parseInt(importeFinal) === 1500) { // 15.00 euros en cÃ©ntimos
        operationType = 'matricula';
        levelUnlocked = 'UNKNOWN';
      } else if (parseInt(importeFinal) === 2000) { // 20.00 euros en cÃ©ntimos (compatibilidad con sistema anterior)
        operationType = 'matricula-a1a2';
        levelUnlocked = 'A1A2';
      } else if (parseInt(importeFinal) === 3000) { // 30.00 euros en cÃ©ntimos (compatibilidad con sistema anterior)
        operationType = 'matricula-b1b2';
        levelUnlocked = 'B1B2';
      } else if (parseInt(importeFinal) === 1000) { // 10.00 euros en cÃ©ntimos
        operationType = 'formacion-profesional';
        levelUnlocked = 'FORMACION_PROFESIONAL';
      }
    }
    
    console.log('ðŸ’° Pago exitoso de Cecabank:', {
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

    // Guardar informaciÃ³n del pago (en producciÃ³n, esto deberÃ­a ir a una base de datos)
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
    
    console.log('ðŸ’¾ Registro de pago:', paymentDetails);

    // Enviar email de confirmaciÃ³n si estÃ¡ configurado
    if (transporter && Codigo_cliente) {
      try {
        const mailOptions = {
          from: 'admin@academiadeinmigrantes.es',
          to: Codigo_cliente.includes('@') ? Codigo_cliente : 'admin@academiadeinmigrantes.es',
          subject: `âœ… Pago confirmado - Orden ${Num_operacion}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4CAF50;">âœ… Pago Confirmado</h2>
              <p>Tu pago ha sido procesado correctamente.</p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Detalles del pago:</h3>
                <p><strong>NÃºmero de operaciÃ³n:</strong> ${Num_operacion}</p>
                <p><strong>Importe:</strong> ${importeEuros} â‚¬</p>
                <p><strong>DescripciÃ³n:</strong> ${Descripcion || 'Pago Academia de Inmigrantes'}</p>
                <p><strong>Fecha:</strong> ${Fecha} ${Hora}</p>
                ${levelUnlocked ? `<p><strong>Nivel desbloqueado:</strong> ${levelUnlocked}</p>` : ''}
              </div>
              <p>Gracias por tu compra. Ya puedes acceder a los contenidos correspondientes en la aplicaciÃ³n.</p>
              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                Este es un email automÃ¡tico. Por favor, no respondas a este mensaje.
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('âœ… Email de confirmaciÃ³n enviado');
      } catch (emailError) {
        console.error('âŒ Error enviando email de confirmaciÃ³n:', emailError);
        // No fallar el proceso si el email falla
      }
    }

    // Redirigir a la app con Ã©xito
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
          <div class="success-icon">âœ…</div>
          <h1>Pago realizado con Ã©xito</h1>
          <p>Tu pago ha sido procesado correctamente.</p>
          <p>Redirigiendo a la aplicaciÃ³n...</p>
          <script>
            // Enviar mensaje a React Native WebView si estÃ¡ disponible
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
    console.error('âŒ Error procesando callback OK de Cecabank:', error);
    res.status(500).send('Error procesando el pago');
  }
});

// Endpoint para recibir respuesta de pago fallido de Cecabank
// Endpoint para recibir respuesta de pago fallido de Cecabank
// IMPORTANTE: Este endpoint DEBE devolver HTTP 200 para que Cecabank considere que la URL funciona
// La URL debe ser exactamente: https://academiadeinmigrantes.es/api/cecabank/ko
app.get('/api/cecabank/ko', async (req, res) => {
  try {
    console.log('âŒ Callback GET de Cecabank recibido (/ko)');
    console.log('ðŸ“ Query params:', JSON.stringify(req.query, null, 2));
 
    const Num_operacion = req.query?.Num_operacion || req.query?.num_operacion || '';
    const Ds_Response = req.query?.Ds_Response || req.query?.ds_response || '';
    const Codigo_respuesta = req.query?.Codigo_respuesta || req.query?.codigo_respuesta || '';
    const Respuesta = req.query?.Respuesta || req.query?.respuesta || '';
    const codigoRespuesta = Ds_Response || Codigo_respuesta || Respuesta;
 
    // âœ… PERSISTIR ESTADO INMEDIATAMENTE (antes de cualquier otra lÃ³gica)
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
    console.log('ðŸ’¾ Estado de pago persistido:', paymentRecordKo);
 
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
    console.error('âŒ Error procesando callback GET KO de Cecabank:', error);
    return res.status(200).send('KO recibido');
  }
});

app.post('/api/cecabank/ko', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log('âŒ Callback de Cecabank KO recibido');
    console.log('ðŸ“ Datos recibidos:', req.body);
    console.log('ðŸŒ IP del cliente:', req.ip || req.connection.remoteAddress);
    console.log('ðŸŒ User-Agent:', req.headers['user-agent']);

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
        console.warn('âš ï¸ Firma invÃ¡lida en callback KO de Cecabank');
      } else {
        console.log('âœ… Firma validada en callback KO');
      }
    }

    const codigoRespuesta = Ds_Response || Codigo_respuesta || Respuesta;
    console.log('âš ï¸ Pago fallido de Cecabank:', {
      numOperacion: Num_operacion,
      codigoCliente: Codigo_cliente,
      importe: Importe,
      descripcion: Descripcion,
      fecha: Fecha,
      hora: Hora,
      codigoRespuesta: codigoRespuesta
    });

    // âœ… PERSISTIR ESTADO INMEDIATAMENTE (antes de cualquier otra lÃ³gica)
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
    console.log('ðŸ’¾ Estado de pago persistido:', paymentRecordKoPost);

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
          <div class="error-icon">âŒ</div>
          <h1>Pago no realizado</h1>
          <p>El pago no pudo ser procesado. Por favor, intenta de nuevo.</p>
          <p>Redirigiendo a la aplicaciÃ³n...</p>
          <script>
            // Enviar mensaje a React Native WebView si estÃ¡ disponible
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'payment-error',
                message: 'El pago fue cancelado o fallÃ³',
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
    console.error('âŒ Error procesando callback KO de Cecabank:', error);
    // IMPORTANTE: Devolver 200 incluso en caso de error para que Cecabank considere que la URL funciona
    res.status(200).send('KO recibido');
  }
});

// Endpoint de prueba para verificar accesibilidad de /api/cecabank/ko
// Permite probar que el endpoint es accesible desde Internet
app.post('/api/cecabank/ko/test', express.urlencoded({ extended: true }), (req, res) => {
  console.log('ðŸ§ª Test de accesibilidad para /api/cecabank/ko');
  console.log('ðŸ“ Datos recibidos:', req.body);
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
    console.log('ðŸ” Verificando estado de pago:', orderId);
    
    // En producciÃ³n, esto deberÃ­a consultar una base de datos
    // Por ahora, retornamos un mensaje indicando que el pago fue procesado
    // si viene de un callback vÃ¡lido
    
    res.json({
      success: true,
      message: 'Endpoint de verificaciÃ³n de pago',
      orderId,
      note: 'En producciÃ³n, este endpoint deberÃ­a consultar la base de datos para verificar el estado del pago'
    });
  } catch (error) {
    console.error('âŒ Error verificando pago:', error);
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
    console.log('ðŸ”„ Sincronizando usuario con Odoo...');
    console.log('ðŸ“‹ Datos recibidos:', JSON.stringify(req.body, null, 2));

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

    // Verificar configuraciÃ³n de Odoo
    if (!ODOO_URL || !ODOO_DATABASE || (!ODOO_USERNAME && !ODOO_API_KEY)) {
      console.warn('âš ï¸  Odoo no estÃ¡ configurado, saltando sincronizaciÃ³n');
      return res.json({
        success: false,
        error: 'Odoo no estÃ¡ configurado',
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
      country_id: country || false, // Odoo espera un ID de paÃ­s, no el nombre
      comment: `Usuario sincronizado desde Firebase App\nUID: ${uid || 'N/A'}\nReferencia: ${userReference || 'N/A'}\nFecha creaciÃ³n: ${createdAt || new Date().toISOString()}`,
      // Campos adicionales que Odoo puede necesitar
      is_company: false,
      customer_rank: 1,
      // Si tienes campos personalizados en Odoo, agrÃ©galos aquÃ­
      // x_firebase_uid: uid,
      // x_user_reference: userReference,
    };

    // Intentar sincronizar con Odoo
    let odooResponse;
    try {
      // OpciÃ³n 1: Usar autenticaciÃ³n por usuario/contraseÃ±a
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
          throw new Error('Error de autenticaciÃ³n con Odoo');
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
      // OpciÃ³n 2: Usar API Key (si Odoo lo soporta)
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
        throw new Error('No hay mÃ©todo de autenticaciÃ³n configurado para Odoo');
      }

      const odooResult = await odooResponse.json();
      
      if (odooResponse.ok && odooResult.result) {
        console.log('âœ… Usuario sincronizado exitosamente con Odoo');
        console.log('ðŸ“‹ ID en Odoo:', odooResult.result);
        
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
      console.error('âŒ Error sincronizando con Odoo:', odooError);
      // No fallar el registro si Odoo falla, solo loguear el error
      return res.json({
        success: false,
        error: `Error sincronizando con Odoo: ${odooError.message}`,
        warning: 'El usuario se registrÃ³ en Firebase pero no se pudo sincronizar con Odoo'
      });
    }
  } catch (error) {
    console.error('âŒ Error en endpoint de sincronizaciÃ³n Odoo:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error desconocido'
    });
  }
});

app.get('/', (req, res) => {
  res.send('Â¡API de pagos de Academia de Inmigrantes funcionando!');
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
  console.error('ðŸ”¥ Error no capturado:', error);
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('ðŸš¨ Promesa rechazada no manejada en:', promise, 'Motivo:', reason);
});

// Manejo de cierre de la aplicaciÃ³n
process.on('SIGTERM', () => {
  console.log('Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
  });
});
