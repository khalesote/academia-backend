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
  console.log('🚀 === CECABANK REDIRECT START ===');
  console.log('🚀 Timestamp:', new Date().toISOString());
  try {
    console.log('🚀 Cecabank redirect request received');
    console.log('📦 Full body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 operationType received:', req.body.operationType);

    const { operationType, customerEmail, customerName } = req.body;

    console.log('✅ Extracted data:', { operationType, customerEmail, customerName });
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

    console.log('✅ Operation type validated successfully');

    // Get price
    const amount = PRICES[operationType];
    const importe = Math.round(amount * 100).toString().padStart(12, '0'); // 12 digits with padding
    const importeSinPadding = Math.round(amount * 100).toString(); // for signature

    console.log('💰 Price calculation:', { operationType, amount, importe, importeSinPadding });

    // Generate order data
    const numOperacion = generateOrderId();
    const { fecha, hora } = getCecabankDateTime();

    console.log('📋 Order data generated:', { numOperacion, fecha, hora });

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

    console.log('🔐 Generating signature with data:', signatureData);

    const firma = generateCecabankSignature(signatureData);

    console.log('✅ Signature generated successfully');

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
      URL_OK: CECABANK_CONFIG.urlOk,     // ✅ Cecabank expects URL_OK
      URL_KO: CECABANK_CONFIG.urlKo,     // ✅ Cecabank expects URL_KO
      Idioma: CECABANK_CONFIG.idioma,
      FechaOperacion: fecha,
      HoraOperacion: hora,
      Referencia: numOperacion,
      Descripcion: `Matrícula ${operationType.toUpperCase()}`
    };

    console.log('📋 Form data built successfully');
    console.log('🔗 URL_OK value:', formData.URL_OK);
    console.log('🔗 URL_KO value:', formData.URL_KO);
    console.log('⚙️ CECABANK_CONFIG.urlOk:', CECABANK_CONFIG.urlOk);
    console.log('⚙️ CECABANK_CONFIG.urlKo:', CECABANK_CONFIG.urlKo);

    if (customerEmail) {
      formData.Email = customerEmail;
      console.log('📧 Added customer email:', customerEmail);
    }
    if (customerName) {
      formData.Nombre = customerName;
      console.log('👤 Added customer name:', customerName);
    }

    console.log('📝 Complete form data:');
    Object.entries(formData).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });

    // Generate HTML form
    console.log('🎨 Generating HTML form...');

    const formFields = Object.entries(formData)
      .map(([key, value]) => {
        const escapedValue = String(value).replace(/[<>&"]/g, (c) => {
          return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c];
        });
        return `        <input type="hidden" name="${key}" value="${escapedValue}" />`;
      })
      .join('\n');

    console.log('✅ HTML form fields generated, length:', formFields.length);

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
      console.log('🚀 Submitting Cecabank form...');
      document.getElementById('cecabankForm').submit();
    }, 1000);
  </script>
</body>
</html>`;

    console.log('✅ HTML generated successfully, length:', html.length);
    console.log('🎯 Form action URL:', normalizedEntorno === 'PRODUCCION' ? CECABANK_CONFIG.urlProduccion : CECABANK_CONFIG.urlTest);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    console.log('📤 Sending HTML response...');
    res.send(html);
    console.log('✅ HTML response sent successfully');

  } catch (error) {
    console.error('❌ === CECABANK REDIRECT ERROR ===');
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ === END ERROR ===');
    res.status(500).send('Error interno del servidor');
  }
});

// Success callback - GET
app.get('/api/cecabank/ok', (req, res) => {
  console.log('✅ Payment success callback received (GET)');
  console.log('📦 Query params:', req.query);
  res.status(200).send('OK');
});

// Error callback - GET  
app.get('/api/cecabank/ko', (req, res) => {
  console.log('❌ Payment error callback received (GET)');
  console.log('📦 Query params:', req.query);
  res.status(200).send('OK');
});

// Success callback - POST
app.post('/api/cecabank/ok', (req, res) => {
  console.log('✅ Payment success callback received (POST)');
  console.log('📦 Callback data:', req.body);
  res.status(200).send('OK');
});

// Error callback - POST
app.post('/api/cecabank/ko', (req, res) => {
  console.log('❌ Payment error callback received (POST)');
  console.log('📦 Callback data:', req.body);
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Academia Backend Server Started');
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`💳 Cecabank: ${CECABANK_CONFIG.clave ? '✅ Configured' : '❌ Not configured'}`);
});
