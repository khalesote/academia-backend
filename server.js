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
      cecabankRedirect: '/api/cecabank/redirect',
      cecabankTest: '/api/cecabank/test'
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
      smtp2go: !!transporter,
      cecabank: !!(process.env.CECABANK_MERCHANT_ID && process.env.CECABANK_CLAVE)
    }
  });
});

// Endpoint de test para Cecabank
app.post('/api/cecabank/test', express.urlencoded({ extended: true }), (req, res) => {
  console.log('🧪 ============================================');
  console.log('🧪 TEST ENDPOINT LLAMADO');
  console.log('🧪 Body:', req.body);
  console.log('🧪 ============================================');
  res.json({
    status: 'ok',
    message: 'Endpoint de test funcionando',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Endpoint de test simple GET
app.get('/api/cecabank/test', (req, res) => {
  console.log('🧪 GET Test endpoint llamado');
  res.json({
    status: 'ok',
    message: 'GET test funcionando',
    timestamp: new Date().toISOString()
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

// Endpoint para enviar email
app.post('/api/enviar-solicitud-asesoria', async (req, res) => {
  try {
    const { nombre, email, telefono, mensaje, tipoConsulta } = req.body;
    
    if (!transporter) {
      return res.status(500).json({ error: 'Servicio de email no configurado' });
    }
    
    const mailOptions = {
      from: process.env.SMTP2GO_USERNAME,
      to: 'academiadeinmigrantes@gmail.com',
      subject: `Nueva solicitud de ${tipoConsulta}`,
      html: `
        <h2>Nueva solicitud de asesoría</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono}</p>
        <p><strong>Tipo de consulta:</strong> ${tipoConsulta}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
      `,
    };
    
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Solicitud enviada correctamente' });
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ENDPOINTS DE CECABANK - PRODUCCIÓN (SOLO PARA MATRICULA SCREEN)
// ============================================

// Endpoint OK - Pago exitoso
app.post('/api/cecabank/ok', express.urlencoded({ extended: true }), (req, res) => {
  try {
    console.log('✅ Pago exitoso recibido de Cecabank');
    console.log('📝 Datos recibidos:', req.body);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pago Exitoso</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .success { color: #4CAF50; font-size: 48px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="success">✅</div>
        <h1>Pago Procesado Correctamente</h1>
        <p>Tu matrícula ha sido confirmada.</p>
        <p>Puedes cerrar esta ventana y volver a la aplicación.</p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Error en endpoint OK:', error);
    res.status(500).send('Error procesando pago exitoso');
  }
});

// Endpoint KO - Pago fallido
app.post('/api/cecabank/ko', express.urlencoded({ extended: true }), (req, res) => {
  try {
    console.log('❌ Pago fallido recibido de Cecabank');
    console.log('📝 Datos recibidos:', req.body);
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pago Fallido</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #f44336; font-size: 48px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="error">❌</div>
        <h1>Pago No Procesado</h1>
        <p>No se pudo completar el pago.</p>
        <p>Puedes cerrar esta ventana y volver a la aplicación.</p>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Error en endpoint KO:', error);
    res.status(500).send('Error procesando pago fallido');
  }
});

// Endpoint de redirección a Cecabank
app.post('/api/cecabank/redirect', express.urlencoded({ extended: true }), async (req, res) => {
  console.log('🚨 ============================================');
  console.log('🚨 ENDPOINT /api/cecabank/redirect LLAMADO');
  console.log('🚨 Timestamp:', new Date().toISOString());
  console.log('🚨 ============================================');
  try {
    console.log('🔄 Endpoint de redirección a Cecabank recibido');
    console.log('📝 Headers recibidos:', req.headers);
    console.log('📝 Body recibido:', req.body);
    console.log('📝 Content-Type:', req.get('Content-Type'));
    
    const formData = req.body;
    
    // Validar campos obligatorios
    const camposObligatorios = [
      'MerchantID', 'AcquirerBIN', 'TerminalID', 'Num_operacion',
      'Importe', 'TipoMoneda', 'Exponente', 'Cifrado',
      'URL_OK', 'URL_KO', 'Idioma', 'FechaOperacion',
      'HoraOperacion', 'Firma'
    ];
    
    const camposFaltantes = camposObligatorios.filter(campo => !formData[campo]);
    if (camposFaltantes.length > 0) {
      console.error('❌ Campos obligatorios faltantes:', camposFaltantes);
      return res.status(400).send(`Campos obligatorios faltantes: ${camposFaltantes.join(', ')}`);
    }
    
    // Generar fecha y hora del servidor
    const now = new Date();
    const fechaOperacion = 
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    const horaOperacion = 
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
    
    // Recalcular firma
    let firma;
    try {
      console.log('🔐 Generando firma con datos:', {
        numOperacion: formData.Num_operacion,
        importe: formData.Importe,
        fecha: fechaOperacion,
        hora: horaOperacion,
        urlOk: formData.URL_OK,
        urlKo: formData.URL_KO
      });
      
      firma = generateCecabankSignature(
        formData.Num_operacion,
        formData.Importe,
        fechaOperacion,
        horaOperacion,
        formData.URL_OK,
        formData.URL_KO
      );
      
      console.log('✅ Firma generada exitosamente');
    } catch (firmaError) {
      console.error('❌ Error al generar firma:', firmaError);
      return res.status(500).send(`Error al generar firma: ${firmaError.message}`);
    }
    
    formData.Firma = firma;
    formData.FechaOperacion = fechaOperacion;
    formData.HoraOperacion = horaOperacion;
    
    // URL de producción de Cecabank
    const urlCecabank = 'https://pgw.ceca.es/tpvweb/tpv/compra.action';
    
    // Generar formulario HTML
    const formFields = Object.entries(formData)
      .map(([key, value]) => {
        // Mapear URL_KO a URL_NOK para Cecabank
        let fieldName = key;
        if (key === 'URL_KO') {
          fieldName = 'URL_NOK';
        }
        
        const escapedKey = String(fieldName)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        
        const escapedValue = String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        
        return `            <input type="hidden" name="${escapedKey}" value="${escapedValue}" />`;
      })
      .join('\n');
    
    // HTML con formulario auto-envío
    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Redirigiendo a Cecabank...</title>
    <style>
      body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f5f5f5; }
      .container { text-align: center; padding: 20px; }
      .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #4CAF50; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Redirigiendo al TPV de Cecabank...</h2>
      <div class="spinner"></div>
      <p>Por favor, espera mientras se procesa tu pago.</p>
    </div>
    <form id="cecabankForm" method="POST" action="${urlCecabank}" enctype="application/x-www-form-urlencoded" style="display: none;">
${formFields}
    </form>
    <script>
      (function() {
        function submitForm() {
          try {
            const form = document.getElementById('cecabankForm');
            if (form) {
              form.submit();
              return true;
            }
          } catch (error) {
            console.error('❌ Error:', error);
          }
          return false;
        }
        
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          submitForm();
        } else {
          document.addEventListener('DOMContentLoaded', submitForm);
        }
        setTimeout(submitForm, 100);
      })();
    </script>
  </body>
</html>`;
    
    console.log('✅ HTML generado, enviando al cliente');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
    
  } catch (error) {
    console.error('❌ ============================================');
    console.error('❌ ERROR en endpoint de redirección:', error);
    console.error('❌ Stack:', error.stack);
    console.error('❌ ============================================');
    res.status(500).send('Error al redirigir a Cecabank');
  }
});

// ============================================
// FUNCIONES DE CECABANK
// ============================================

/**
 * Genera la firma HMAC SHA256 para Cecabank
 */
function generateCecabankSignature(numOperacion, importe, fecha, hora, urlOk, urlKo) {
  try {
    const merchantId = process.env.CECABANK_MERCHANT_ID || '086729753';
    const acquirerBin = process.env.CECABANK_ACQUIRER_BIN || '0000554027';
    const terminalId = process.env.CECABANK_TERMINAL_ID || '00000003';
    const clave = process.env.CECABANK_CLAVE || 'P7BB51K0ABTDOAGN0W084FK4MUHRM5GQ';
    const tipoMoneda = '978';
    const exponente = '2';
    const cifrado = 'SHA256';
    const idioma = '1';

    // Validar que todos los parámetros estén presentes
    if (!numOperacion || !importe || !fecha || !hora) {
      throw new Error('Faltan parámetros requeridos para generar la firma');
    }

    // Asegurar que todos los valores sean strings
    const numOpStr = String(numOperacion || '');
    const importeStr = String(importe || '').padStart(12, '0');
    const fechaStr = String(fecha || '');
    const horaStr = String(hora || '');
    const urlOkStr = String(urlOk || '');
    const urlKoStr = String(urlKo || '');

    // Construir cadena para firma según orden EXACTO requerido por Cecabank:
    // 1. MerchantID
    // 2. AcquirerBIN
    // 3. TerminalID
    // 4. Num_operacion
    // 5. Importe
    // 6. TipoMoneda
    // 7. Exponente
    // 8. Referencia (opcional, usar vacío si no existe)
    // 9. FirmaClave (clave de encriptación)
    const referencia = ''; // Campo opcional, dejar vacío si no se usa
    const cadenaFirma = 
      merchantId + 
      acquirerBin + 
      terminalId + 
      numOpStr + 
      importeStr + 
      tipoMoneda + 
      exponente + 
      referencia + 
      clave;

    console.log('🔐 Generando firma con orden EXACTO de Cecabank:', {
      orden: [
        '1. MerchantID',
        '2. AcquirerBIN',
        '3. TerminalID',
        '4. Num_operacion',
        '5. Importe',
        '6. TipoMoneda',
        '7. Exponente',
        '8. Referencia',
        '9. FirmaClave'
      ],
      valores: {
        merchantId,
        acquirerBin,
        terminalId,
        numOperacion: numOpStr,
        importe: importeStr,
        tipoMoneda,
        exponente,
        referencia: referencia || '(vacío)',
        claveLength: clave.length
      },
      cadenaLength: cadenaFirma.length,
      tieneClave: !!clave && clave.length > 0
    });

    if (!clave || clave.length === 0) {
      throw new Error('La clave de encriptación (CECABANK_CLAVE) no está configurada');
    }

    // Generar HMAC SHA256 en Base64
    const hmac = crypto.createHmac('sha256', clave);
    hmac.update(cadenaFirma);
    const firma = hmac.digest('base64');
    
    console.log('✅ Firma Cecabank generada correctamente, longitud:', firma.length);
    return firma;
  } catch (error) {
    console.error('❌ Error generando firma Cecabank:', error);
    console.error('❌ Stack:', error.stack);
    throw new Error(`Error al generar firma: ${error.message}`);
  }
}

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('🚀 Servidor iniciado en puerto', PORT);
  console.log('🌍 Entorno:', NODE_ENV);
  console.log('🔗 URL: http://localhost:' + PORT);
  console.log('✅ Endpoints de Cecabank cargados para MatriculaScreen');
  console.log('💳 Stripe configurado:', !!process.env.STRIPE_SECRET_KEY);
  console.log('📧 Email configurado:', !!transporter);
});
