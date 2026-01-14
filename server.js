const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Environment configuration
const ENTORNO = process.env.CECABANK_ENTORNO || 'PRODUCCION';

// Normalize entorno to handle both 'production' and 'PRODUCCION'
const normalizedEntorno = ENTORNO.toUpperCase() === 'PRODUCTION' ? 'PRODUCCION' : ENTORNO;

// Cecabank Configuration
const CECABANK_CONFIG = {
  merchantId: process.env.CECABANK_MERCHANT_ID || '086729753',
  acquirerBin: process.env.CECABANK_ACQUIRER_BIN || '0000554027',
  terminalId: process.env.CECABANK_TERMINAL_ID || '00000003',
  clave: process.env.CECABANK_CLAVE || 'P7BB51K0ABTDOAGN0W084FK4MUHRM5GQ',
  tipoMoneda: '978', // EUR
  exponente: '2',
  cifrado: 'HMAC_SHA256',
  idioma: '1',
  urlProduccion: 'https://pgw.ceca.es/tpvweb/tpv/compra.action',
  urlTest: 'https://tpv.ceca.es/tpvweb/tpv/compra.action',
  urlOk: 'https://academia-backend-s9np.onrender.com/api/cecabank/ok', // Temporarily hardcoded for testing
  urlKo: 'https://academia-backend-s9np.onrender.com/api/cecabank/ko'  // Temporarily hardcoded for testing
};

// Prices for courses
const PRICES = {
  'matricula-a1': 25.00,
  'matricula-a2': 35.00,
  'matricula-b1': 45.00,
  'matricula-b2': 55.00,
  'matricula-a1a2': 50.00,
  'matricula-b1b2': 90.00
};

/**
 * Generate HMAC SHA256 signature for Cecabank
 */
function generateCecabankSignature(data) {
  const { merchantId, acquirerBin, terminalId, numOperacion, importe, fecha, hora, referencia } = data;

  // Build signature string (10 fields only, no clave)
  const signatureString = [
    merchantId,
    acquirerBin,
    terminalId,
    numOperacion,
    importe, // without padding
    CECABANK_CONFIG.tipoMoneda,
    CECABANK_CONFIG.exponente,
    CECABANK_CONFIG.urlOk,
    CECABANK_CONFIG.urlKo,
    referencia
  ].join('');

  console.log('🔐 Signature string:', signatureString);

  // Generate HMAC SHA256
  const signature = crypto
    .createHmac('sha256', CECABANK_CONFIG.clave)
    .update(signatureString, 'utf8')
    .digest('hex');

  console.log('✅ Signature generated:', signature.substring(0, 16) + '...');
  return signature;
}

/**
 * Generate unique order number
 */
function generateOrderId() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return (timestamp + random).slice(-12);
}

/**
 * Get current date and time in Cecabank format
 */
function getCecabankDateTime() {
  const now = new Date();
  const fecha = now.getFullYear().toString() +
               (now.getMonth() + 1).toString().padStart(2, '0') +
               now.getDate().toString().padStart(2, '0');
  const hora = now.getHours().toString().padStart(2, '0') +
              now.getMinutes().toString().padStart(2, '0') +
              now.getSeconds().toString().padStart(2, '0');
  return { fecha, hora };
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Academia Backend - Cecabank Payments',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cecabank: {
      configured: !!CECABANK_CONFIG.clave,
      merchantId: CECABANK_CONFIG.merchantId
    }
  });
});

// Cecabank redirect endpoint
app.post('/api/cecabank/redirect', (req, res) => {
  try {
    console.log('🚀 Cecabank redirect request received');
    console.log('📦 Full body:', req.body);
    console.log('🔍 operationType received:', req.body.operationType);

    const { operationType, customerEmail, customerName } = req.body;

    console.log('✅ Extracted operationType:', operationType);
    console.log('✅ Available PRICES keys:', Object.keys(PRICES));

    // Validate operation type
    if (!operationType || !PRICES[operationType]) {
      console.error('❌ Validation failed:', {
        operationType,
        operationTypeExists: !!operationType,
        operationTypeInPrices: !!PRICES[operationType],
        allPricesKeys: Object.keys(PRICES)
      });
      return res.status(400).send('Tipo de operación inválido');
    }

    // Get price
    const amount = PRICES[operationType];
    const importe = Math.round(amount * 100).toString().padStart(12, '0'); // 12 digits with padding
    const importeSinPadding = Math.round(amount * 100).toString(); // for signature

    // Generate order data
    const numOperacion = generateOrderId();
    const { fecha, hora } = getCecabankDateTime();

    // Generate signature
    const signatureData = {
      merchantId: CECABANK_CONFIG.merchantId,
      acquirerBin: CECABANK_CONFIG.acquirerBin,
      terminalId: CECABANK_CONFIG.terminalId,
      numOperacion,
      importe: importeSinPadding,
      fecha,
      hora,
      referencia: numOperacion
    };

    const firma = generateCecabankSignature(signatureData);

    // Build form data
    const formData = {
      MerchantID: CECABANK_CONFIG.merchantId,
      AcquirerBIN: CECABANK_CONFIG.acquirerBin,
      TerminalID: CECABANK_CONFIG.terminalId,
      Num_operacion: numOperacion,
      Importe: importe,
      TipoMoneda: CECABANK_CONFIG.tipoMoneda,
      Exponente: CECABANK_CONFIG.exponente,
      Cifrado: CECABANK_CONFIG.cifrado,
      Firma: firma,
      URL_OK: CECABANK_CONFIG.urlOk,     // ✅ Revert to URL_OK
      URL_KO: CECABANK_CONFIG.urlKo,     // ✅ Revert to URL_KO
      Idioma: CECABANK_CONFIG.idioma,
      FechaOperacion: fecha,
      HoraOperacion: hora,
      Referencia: numOperacion,
      Descripcion: `Matrícula ${operationType.toUpperCase()}`
    };

    if (customerEmail) formData.Email = customerEmail;
    if (customerName) formData.Nombre = customerName;

    console.log('📋 Form data prepared:', Object.keys(formData));
    console.log('🔗 URL_OK value:', formData.URL_OK);
    console.log('🔗 URL_KO value:', formData.URL_KO);
    console.log('⚙️ CECABANK_CONFIG.urlOk:', CECABANK_CONFIG.urlOk);
    console.log('⚙️ CECABANK_CONFIG.urlKo:', CECABANK_CONFIG.urlKo);
    console.log('🌍 Environment CECABANK_SUCCESS_URL:', process.env.CECABANK_SUCCESS_URL);
    console.log('🌍 Environment CECABANK_ERROR_URL:', process.env.CECABANK_ERROR_URL);
    
    // Log all form data values
    console.log('📝 Complete form data being sent to Cecabank:');
    Object.entries(formData).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    // Generate HTML form
    const formFields = Object.entries(formData)
      .map(([key, value]) => {
        const escapedValue = String(value).replace(/[<>&"]/g, (c) => {
          return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
        });
        return `        <input type="hidden" name="${key}" value="${escapedValue}" />`;
      })
      .join('\n');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Procesando pago...</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
    .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #4CAF50; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .loading-text { color: #666; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Procesando pago seguro</h2>
    <p class="loading-text">Redirigiendo a Cecabank...</p>
  </div>

  <form id="cecabankForm" method="POST" action="${normalizedEntorno === 'PRODUCCION' ? CECABANK_CONFIG.urlProduccion : CECABANK_CONFIG.urlTest}" style="display: none;">
${formFields}
  </form>

  <script>
    setTimeout(() => {
      document.getElementById('cecabankForm').submit();
    }, 1000);
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);

  } catch (error) {
    console.error('❌ Error in redirect:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Success callback
app.get('/api/cecabank/ok', (req, res) => {
  console.log('✅ Payment success callback received');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Pago Exitoso</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #e8f5e9; }
        .success { color: #4CAF50; font-size: 64px; margin-bottom: 20px; }
        .message { font-size: 18px; color: #333; margin-bottom: 30px; }
        .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="success">✅</div>
      <h1>¡Pago procesado correctamente!</h1>
      <p class="message">Tu matrícula ha sido confirmada. Puedes cerrar esta ventana.</p>
    </body>
    </html>
  `);
});

// Error callback
app.get('/api/cecabank/ko', (req, res) => {
  console.log('❌ Payment error callback received');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Pago No Procesado</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #ffebee; }
        .error { color: #f44336; font-size: 64px; margin-bottom: 20px; }
        .message { font-size: 18px; color: #333; margin-bottom: 30px; }
        .button { display: inline-block; padding: 12px 24px; background: #f44336; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="error">❌</div>
      <h1>Pago no procesado</h1>
      <p class="message">Ha ocurrido un error al procesar tu pago. Puedes cerrar esta ventana e intentarlo nuevamente.</p>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Academia Backend Server Started');
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`💳 Cecabank: ${CECABANK_CONFIG.clave ? '✅ Configured' : '❌ Not configured'}`);
});
