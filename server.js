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
    smtp2goConfigured: !!(process.env.SMTP2GO_USERNAME && process.env.SMTP2GO_PASSWORD)
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
// ENDPOINTS DE CECABANK
// ============================================

// Endpoint para recibir respuesta de pago exitoso de Cecabank
app.post('/api/cecabank/ok', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log('✅ Callback de Cecabank OK recibido');
    console.log('📝 Datos recibidos:', req.body);

    const { 
      Num_operacion, 
      Codigo_cliente, 
      Importe, 
      Firma,
      Descripcion,
      Fecha,
      Hora
    } = req.body;

    // Validar que vengan los datos necesarios
    if (!Num_operacion || !Importe || !Firma) {
      console.error('❌ Faltan datos en el callback de Cecabank');
      return res.status(400).send('Faltan datos requeridos');
    }

    // Aquí deberías validar la firma con tu clave de encriptación
    // Por ahora solo registramos el pago exitoso
    
    console.log('💰 Pago exitoso de Cecabank:', {
      numOperacion: Num_operacion,
      codigoCliente: Codigo_cliente,
      importe: Importe,
      descripcion: Descripcion,
      fecha: Fecha,
      hora: Hora
    });

    // TODO: Aquí deberías:
    // 1. Validar la firma
    // 2. Actualizar la base de datos
    // 3. Enviar email de confirmación
    // 4. Desbloquear el curso correspondiente

    // Redirigir a la app con éxito
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Pago Exitoso</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>✅ Pago realizado con éxito</h1>
          <p>Tu pago ha sido procesado correctamente.</p>
          <p>Puedes cerrar esta ventana y volver a la aplicación.</p>
          <script>
            // Intentar redirigir a la app
            setTimeout(() => {
              window.location.href = 'academiadeinmigrantes://payment-success?orderId=${Num_operacion}';
            }, 2000);
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
app.post('/api/cecabank/ko', express.urlencoded({ extended: true }), async (req, res) => {
  try {
    console.log('❌ Callback de Cecabank KO recibido');
    console.log('📝 Datos recibidos:', req.body);

    const { 
      Num_operacion, 
      Codigo_cliente, 
      Importe,
      Descripcion,
      Fecha,
      Hora
    } = req.body;

    console.log('⚠️ Pago fallido de Cecabank:', {
      numOperacion: Num_operacion,
      codigoCliente: Codigo_cliente,
      importe: Importe,
      descripcion: Descripcion,
      fecha: Fecha,
      hora: Hora
    });

    // Redirigir a la app con error
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Pago Fallido</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>❌ Pago no realizado</h1>
          <p>El pago no pudo ser procesado. Por favor, intenta de nuevo.</p>
          <p>Puedes cerrar esta ventana y volver a la aplicación.</p>
          <script>
            // Intentar redirigir a la app
            setTimeout(() => {
              window.location.href = 'academiadeinmigrantes://payment-error?orderId=${Num_operacion || ''}';
            }, 2000);
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Error procesando callback KO de Cecabank:', error);
    res.status(500).send('Error procesando el pago');
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
