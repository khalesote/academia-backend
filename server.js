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
    
    // Aceptar datos de form-urlencoded
    let formData = req.body;
    
    if (!formData || Object.keys(formData).length === 0) {
      return res.status(400).send('No se recibieron datos del formulario');
    }
    
    // Verificar que las URLs estén presentes y correctamente formateadas
    if (!formData.URL_OK || !formData.URL_KO) {
      console.error('❌ URLs faltantes:', { URL_OK: formData.URL_OK, URL_KO: formData.URL_KO });
      return res.status(400).send('URLs de retorno (URL_OK o URL_KO) faltantes');
    }
    
    // Validar formato de URLs
    try {
      new URL(formData.URL_OK);
      new URL(formData.URL_KO);
      console.log('✅ URLs validadas:', {
        URL_OK: formData.URL_OK,
        URL_KO: formData.URL_KO
      });
    } catch (urlError) {
      console.error('❌ URLs inválidas:', urlError);
      return res.status(400).send('URLs de retorno inválidas');
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
    
    // Recalcular la firma con la nueva fecha/hora del servidor
    const firma = generateCecabankSignature(
      formData.Num_operacion,
      formData.Importe,
      fechaOperacion,
      horaOperacion
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
    
    // Asegurar que las URLs estén en el formato correcto (sin espacios, sin caracteres especiales problemáticos)
    if (formData.URL_OK) {
      formData.URL_OK = String(formData.URL_OK).trim();
    }
    if (formData.URL_KO) {
      formData.URL_KO = String(formData.URL_KO).trim();
    }
    
    // Ordenar campos según el orden recomendado por Cecabank
    // IMPORTANTE: La Firma debe ir al final, después de todos los datos
    // Orden estándar: MerchantID, AcquirerBIN, TerminalID, Num_operacion, Importe, TipoMoneda, Exponente, Cifrado, URL_OK, URL_KO, Idioma, Descripcion, FechaOperacion, HoraOperacion, Firma, Email, Nombre
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
    
    // Añadir cualquier campo adicional que no esté en la lista
    Object.keys(formData).forEach(campo => {
      if (!ordenCampos.includes(campo) && formData[campo] !== undefined) {
        formDataOrdenado[campo] = formData[campo];
      }
    });
    
    console.log('📋 Campos ordenados:', Object.keys(formDataOrdenado));
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
        console.log('📋 Estado del documento:', document.readyState);
        console.log('📋 URL actual:', window.location.href);
        
        var formSubmitted = false;
        
        function submitForm() {
          if (formSubmitted) {
            console.log('⚠️ Formulario ya enviado, no intentar de nuevo');
            return false;
          }
          
          try {
            console.log('🔍 Buscando formulario cecabankForm...');
            const form = document.getElementById('cecabankForm');
            if (!form) {
              console.error('❌ Formulario no encontrado en el DOM');
              console.error('📋 Contenido del body:', document.body.innerHTML.substring(0, 500));
              return false;
            }
            
            console.log('✅ Formulario encontrado');
            console.log('🔗 URL de acción:', form.action);
            
            // Verificar que el formulario tenga campos
            const fields = Array.from(form.elements);
            console.log('📋 Campos encontrados en el formulario:', fields.length);
            
            if (fields.length === 0) {
              console.error('❌ El formulario no tiene campos!');
              console.error('📋 HTML del formulario:', form.outerHTML);
              return false;
            }
            
            // Mostrar los primeros campos para verificación
            const primerosCampos = fields.slice(0, 3).map(f => f.name + '=' + (f.value ? f.value.substring(0, 20) : 'vacío'));
            console.log('📋 Primeros campos:', primerosCampos);
            
            // Asegurar atributos correctos
            form.method = 'POST';
            form.action = '${urlCecabank}';
            form.enctype = 'application/x-www-form-urlencoded';
            form.target = '_self';
            
            // Marcar como enviado ANTES de enviar
            formSubmitted = true;
            
            // Enviar inmediatamente
            console.log('📤 Enviando formulario POST a:', form.action);
            console.log('📤 Método:', form.method);
            console.log('📤 Enctype:', form.enctype);
            form.submit();
            console.log('✅ form.submit() llamado - navegando a Cecabank');
            return true;
          } catch (error) {
            console.error('❌ Error:', error);
            console.error('📋 Stack:', error.stack);
            formSubmitted = false; // Permitir reintento si hay error
            return false;
          }
        }
        
        // Intentar enviar cuando el DOM esté listo
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          console.log('📄 DOM listo, enviando inmediatamente...');
          submitForm();
        } else {
          console.log('📄 Esperando DOMContentLoaded...');
          document.addEventListener('DOMContentLoaded', function() {
            console.log('📄 DOMContentLoaded, enviando...');
            submitForm();
          });
        }
        
        // Respaldo con múltiples intentos
        setTimeout(function() {
          if (!formSubmitted) {
            console.log('⏰ Timeout 50ms, intentando envío...');
            submitForm();
          }
        }, 50);
        
        setTimeout(function() {
          if (!formSubmitted) {
            console.log('⏰ Timeout 100ms, intentando envío...');
            submitForm();
          }
        }, 100);
        
        setTimeout(function() {
          if (!formSubmitted) {
            console.log('⏰ Timeout 200ms, intentando envío...');
            submitForm();
          }
        }, 200);
        
        setTimeout(function() {
          if (!formSubmitted) {
            console.log('⏰ Timeout 500ms, intentando envío...');
            submitForm();
          }
        }, 500);
        
        setTimeout(function() {
          if (!formSubmitted) {
            console.error('❌ Timeout 1000ms - El formulario NO se pudo enviar después de múltiples intentos');
            console.error('📋 Estado del documento:', document.readyState);
            console.error('📋 Formulario existe?', !!document.getElementById('cecabankForm'));
          }
        }, 1000);
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
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('❌ Error en endpoint de redirección:', error);
    res.status(500).send('Error al redirigir a Cecabank');
  }
});

// ============================================
// FUNCIONES DE VALIDACIÓN CECABANK
// ============================================

/**
 * Genera la firma esperada por Cecabank para validar los callbacks
 */
function generateCecabankSignature(numOperacion, importe, fecha, hora) {
  const merchantId = process.env.CECABANK_MERCHANT_ID || '';
  const acquirerBin = process.env.CECABANK_ACQUIRER_BIN || '';
  const terminalId = process.env.CECABANK_TERMINAL_ID || '';
  const clave = process.env.CECABANK_CLAVE || '';
  const tipoMoneda = '978'; // EUR
  const exponente = '2';
  const cifrado = 'SHA256';

  // Construir la cadena para la firma
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

  // Generar el hash SHA256
  const firma = crypto.createHash('sha256').update(cadenaFirma).digest('hex').toUpperCase();
  
  return firma;
}

/**
 * Valida la firma recibida de Cecabank
 */
function validateCecabankSignature(datos) {
  try {
    const firmaCalculada = generateCecabankSignature(
      datos.Num_operacion,
      datos.Importe,
      datos.Fecha,
      datos.Hora
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
    if (!Num_operacion || !Importe || !Firma || !Fecha || !Hora) {
      console.error('❌ Faltan datos en el callback de Cecabank');
      return res.status(400).send('Faltan datos requeridos');
    }

    // Validar la firma
    const isValidSignature = validateCecabankSignature({
      Num_operacion,
      Importe,
      Fecha,
      Hora,
      Firma
    });

    if (!isValidSignature) {
      console.error('❌ Firma inválida en callback de Cecabank');
      return res.status(400).send('Firma inválida');
    }

    console.log('✅ Firma validada correctamente');
    
    // Convertir importe de céntimos a euros
    const importeEuros = (parseInt(Importe) / 100).toFixed(2);
    
    // Determinar el tipo de operación basado en el importe o descripción
    let operationType = 'unknown';
    let levelUnlocked = null;
    
    if (parseInt(Importe) === 2000) { // 20.00 euros en céntimos
      operationType = 'matricula-a1a2';
      levelUnlocked = 'A1A2';
    } else if (parseInt(Importe) === 3000) { // 30.00 euros en céntimos
      operationType = 'matricula-b1b2';
      levelUnlocked = 'B1B2';
    } else if (parseInt(Importe) === 1000) { // 10.00 euros en céntimos
      operationType = 'formacion-profesional';
      levelUnlocked = 'FORMACION_PROFESIONAL';
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
    const paymentRecord = {
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
    
    console.log('💾 Registro de pago:', paymentRecord);

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
      Hora,
      Firma
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
                orderId: '${Num_operacion || ''}'
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
    res.status(500).send('Error procesando el pago');
  }
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
