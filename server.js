const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// ─────────────────────────────
// Middleware
// ─────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────
// Cecabank config
// ─────────────────────────────
const CECABANK_CONFIG = {
  merchantId: process.env.CECABANK_MERCHANT_ID,
  acquirerBin: process.env.CECABANK_ACQUIRER_BIN,
  terminalId: process.env.CECABANK_TERMINAL_ID,
  clave: process.env.CECABANK_CLAVE,
  tipoMoneda: '978',
  exponente: '2',
  cifrado: 'HMAC_SHA256',
  idioma: '1',

  // PRODUCCIÓN
  paymentUrl: 'https://pgw.ceca.es/tpvweb/tpv/compra.action',

  // CALLBACKS (BACKEND ONLY)
  urlOk: process.env.CECABANK_SUCCESS_URL,
  urlKo: process.env.CECABANK_ERROR_URL
};

// ─────────────────────────────
// Utils
// ─────────────────────────────
function generateOrderId() {
  return Date.now().toString().slice(-12);
}

function getDateTime() {
  const d = new Date();
  return {
    fecha: d.toISOString().slice(0, 10).replace(/-/g, ''),
    hora: d.toTimeString().slice(0, 8).replace(/:/g, '')
  };
}

function generateSignature({ numOperacion, importe }) {
  const signatureString = [
    CECABANK_CONFIG.merchantId,
    CECABANK_CONFIG.acquirerBin,
    CECABANK_CONFIG.terminalId,
    numOperacion,
    importe,
    CECABANK_CONFIG.tipoMoneda,
    CECABANK_CONFIG.exponente,
    CECABANK_CONFIG.urlOk,
    CECABANK_CONFIG.urlKo,
    numOperacion
  ].join('');

  console.log('🔐 Signature string:', signatureString);

  return crypto
    .createHmac('sha256', CECABANK_CONFIG.clave)
    .update(signatureString, 'utf8')
    .digest('hex');
}

// ─────────────────────────────
// Health
// ─────────────────────────────
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

// ─────────────────────────────
// CREATE PAYMENT
// ─────────────────────────────
app.post('/api/cecabank/redirect', (req, res) => {
  try {
    const { amount, operationType } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).send('Importe inválido');
    }

    const numOperacion = generateOrderId();
    const { fecha, hora } = getDateTime();
    const importe = Math.round(amount * 100);
    const importePadded = importe.toString().padStart(12, '0');

    const firma = generateSignature({
      numOperacion,
      importe: importe.toString()
    });

    if (!CECABANK_CONFIG.urlOk || !CECABANK_CONFIG.urlKo) {
      console.error('❌ URLs de callback no configuradas:', {
        urlOk: CECABANK_CONFIG.urlOk,
        urlKo: CECABANK_CONFIG.urlKo
      });
      return res.status(500).send('URL OK/KO no configuradas');
    }

    const formData = {
      MerchantID: CECABANK_CONFIG.merchantId,
      AcquirerBIN: CECABANK_CONFIG.acquirerBin,
      TerminalID: CECABANK_CONFIG.terminalId,
      Num_operacion: numOperacion,
      Importe: importePadded,
      TipoMoneda: CECABANK_CONFIG.tipoMoneda,
      Exponente: CECABANK_CONFIG.exponente,
      Cifrado: CECABANK_CONFIG.cifrado,
      Firma: firma,

      // 🔥 CAMPOS CORRECTOS (Cecabank espera UrlOK y UrlNOK)
      UrlOK: CECABANK_CONFIG.urlOk,
      UrlNOK: CECABANK_CONFIG.urlKo,
      Idioma: CECABANK_CONFIG.idioma,
      FechaOperacion: fecha,
      HoraOperacion: hora,
      Referencia: numOperacion,
      Descripcion: `Matrícula ${operationType}`
    };

    console.log('📝 FORM DATA:', formData);

    const inputs = Object.entries(formData)
      .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}"/>`)
      .join('\n');

    const html = `
<!DOCTYPE html>
<html>
<body>
<form id="pay" method="POST" action="${CECABANK_CONFIG.paymentUrl}">
${inputs}
</form>
<script>document.getElementById('pay').submit();</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error interno');
  }
});

// ─────────────────────────────
// CALLBACKS
// ─────────────────────────────
app.post('/api/cecabank/ok', (req, res) => {
  console.log('✅ PAGO OK', req.body);
  res.redirect('academiadeinmigrantes://payment-success');
});

app.post('/api/cecabank/ko', (req, res) => {
  console.log('❌ PAGO KO', req.body);
  res.redirect('academiadeinmigrantes://payment-error');
});

// ─────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
