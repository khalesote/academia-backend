const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
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
// SMTP2GO (Examen presencial)
// ─────────────────────────────
let transporter;
if (process.env.SMTP2GO_USERNAME && process.env.SMTP2GO_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 2525,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP2GO_USERNAME,
      pass: process.env.SMTP2GO_PASSWORD,
    },
  });
  console.log('✅ SMTP2GO configurado');
} else {
  console.log('⚠️ SMTP2GO no configurado (faltan credenciales)');
}

// ─────────────────────────────
// Cecabank config
// ─────────────────────────────
const CECABANK_ENV = (process.env.CECABANK_ENTORNO || 'PRODUCCION').toUpperCase();
const CECABANK_IS_TEST = ['TEST', 'PRUEBAS', 'TESTING', 'SANDBOX'].includes(CECABANK_ENV);

const CECABANK_CONFIG = {
  merchantId: process.env.CECABANK_MERCHANT_ID,
  acquirerBin: process.env.CECABANK_ACQUIRER_BIN,
  terminalId: process.env.CECABANK_TERMINAL_ID,
  clave: process.env.CECABANK_CLAVE,
  tipoMoneda: '978',
  exponente: '2',
  cifrado: 'HMAC_SHA256',
  idioma: '1',

  // Entorno
  paymentUrl: CECABANK_IS_TEST
    ? 'https://tpv.ceca.es/tpvweb/tpv/compra.action'
    : 'https://pgw.ceca.es/tpvweb/tpv/compra.action',

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
  // En modo HMAC: la clave se usa como key del HMAC, no se concatena.
  const signatureString = [
    CECABANK_CONFIG.merchantId,
    CECABANK_CONFIG.acquirerBin,
    CECABANK_CONFIG.terminalId,
    numOperacion,
    importe,
    CECABANK_CONFIG.tipoMoneda,
    CECABANK_CONFIG.exponente,
    CECABANK_CONFIG.cifrado,
    CECABANK_CONFIG.urlOk,
    CECABANK_CONFIG.urlKo
  ].join('');

  console.log('🔐 Signature string:', signatureString);

  return crypto
    .createHmac('sha256', CECABANK_CONFIG.clave)
    .update(signatureString, 'utf8')
    .digest('base64');
}

// ─────────────────────────────
// Health
// ─────────────────────────────
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', cecabankEnv: CECABANK_ENV, paymentUrl: CECABANK_CONFIG.paymentUrl });
});

app.get('/api/version', (_, res) => {
  res.json({
    commit: process.env.RENDER_GIT_COMMIT || process.env.COMMIT_SHA || 'unknown'
  });
});

// ─────────────────────────────
// EXAMEN PRESENCIAL (EMAIL SMTP2GO)
// ─────────────────────────────
app.post('/api/solicitar-examen-presencial', async (req, res) => {
  try {
    const { nombre, email, telefono, nivel, mensaje } = req.body;

    if (!nombre || !email || !nivel) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios',
        required: ['nombre', 'email', 'nivel']
      });
    }

    if (!transporter) {
      return res.status(500).json({
        error: 'Servicio de email no configurado',
        details: 'Credenciales de SMTP2GO no configuradas'
      });
    }

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
          <p><strong>Nivel:</strong> ${nivel}</p>
          <p><strong>Fecha de solicitud:</strong> ${new Date().toLocaleString('es-ES')}</p>
        </div>
        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
          <h3 style="color: #2e7d32; margin-top: 0;">Mensaje del Estudiante:</h3>
          <p style="font-size: 16px; font-weight: bold; color: #1b5e20;">${mensaje || 'ME APUNTO EN EXAMEN PRESENCIAL'}</p>
        </div>
        <p style="color: #666;">Este email fue enviado desde la app Academia de Inmigrantes.</p>
      `,
    };

    const result = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Solicitud de examen presencial enviada correctamente',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('❌ Error enviando solicitud de examen presencial:', error);
    res.status(500).json({ error: 'Error al enviar la solicitud' });
  }
});

// ─────────────────────────────
// DEBUG FORM (TEMP)
// ─────────────────────────────
app.get('/api/cecabank/debug-form', (req, res) => {
  try {
    const amount = parseFloat(String(req.query.amount || ''));
    const operationType = String(req.query.operationType || 'debug');

    if (!amount || isNaN(amount)) {
      return res.status(400).send('Importe inválido');
    }

    if (!CECABANK_CONFIG.urlOk || !CECABANK_CONFIG.urlKo) {
      return res.status(500).send('URL OK/KO no configuradas');
    }

    const numOperacion = generateOrderId();
    const { fecha, hora } = getDateTime();
    const importe = Math.round(amount * 100);
    const importePadded = importe.toString().padStart(12, '0');

    const firma = generateSignature({
      numOperacion,
      importe: importePadded
    });

    const formData = {
      MerchantID: CECABANK_CONFIG.merchantId,
      AcquirerBIN: CECABANK_CONFIG.acquirerBin,
      TerminalID: CECABANK_CONFIG.terminalId,
      Num_operacion: numOperacion,
      Importe: importePadded,
      TipoMoneda: CECABANK_CONFIG.tipoMoneda,
      Exponente: CECABANK_CONFIG.exponente,
      Cifrado: CECABANK_CONFIG.cifrado,
      Pago_soportado: 'SSL',
      Firma: firma,
      URL_OK: CECABANK_CONFIG.urlOk,
      URL_NOK: CECABANK_CONFIG.urlKo,
      Idioma: CECABANK_CONFIG.idioma,
      FechaOperacion: fecha,
      HoraOperacion: hora,
      Referencia: numOperacion,
      Descripcion: `Matrícula ${operationType}`
    };

    const inputs = Object.entries(formData)
      .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
      .join('\n');

    const html = `
<!DOCTYPE html>
<html>
<body>
  <h2>Debug Cecabank Form</h2>
  <p>Entorno: ${CECABANK_ENV}</p>
  <p>Payment URL: ${CECABANK_CONFIG.paymentUrl}</p>
  <table border="1" cellpadding="6">${inputs}</table>
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
// DEBUG REDIRECT PAGE (TEMP)
// ─────────────────────────────
app.get('/api/cecabank/redirect-test', (req, res) => {
  try {
    const amount = parseFloat(String(req.query.amount || ''));
    const operationType = String(req.query.operationType || 'debug');

    if (!amount || isNaN(amount)) {
      return res.status(400).send('Importe inválido');
    }

    if (!CECABANK_CONFIG.urlOk || !CECABANK_CONFIG.urlKo) {
      return res.status(500).send('URL OK/KO no configuradas');
    }

    const numOperacion = generateOrderId();
    const { fecha, hora } = getDateTime();
    const importe = Math.round(amount * 100);
    const importePadded = importe.toString().padStart(12, '0');

    const firma = generateSignature({
      numOperacion,
      importe: importePadded
    });

    const formData = {
      MerchantID: CECABANK_CONFIG.merchantId,
      AcquirerBIN: CECABANK_CONFIG.acquirerBin,
      TerminalID: CECABANK_CONFIG.terminalId,
      Num_operacion: numOperacion,
      Importe: importePadded,
      TipoMoneda: CECABANK_CONFIG.tipoMoneda,
      Exponente: CECABANK_CONFIG.exponente,
      Cifrado: CECABANK_CONFIG.cifrado,
      Pago_soportado: 'SSL',
      Firma: firma,
      URL_OK: CECABANK_CONFIG.urlOk,
      URL_NOK: CECABANK_CONFIG.urlKo,
      Idioma: CECABANK_CONFIG.idioma,
      FechaOperacion: fecha,
      HoraOperacion: hora,
      Referencia: numOperacion,
      Descripcion: `Matrícula ${operationType}`
    };

    const inputs = Object.entries(formData)
      .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}"/>`)
      .join('\n');

    const html = `
<!DOCTYPE html>
<html>
<body>
  <h2>Redirect Test Cecabank</h2>
  <p>Entorno: ${CECABANK_ENV}</p>
  <p>Payment URL: ${CECABANK_CONFIG.paymentUrl}</p>
  <form method="POST" action="${CECABANK_CONFIG.paymentUrl}">
    ${inputs}
    <button type="submit">Enviar a Cecabank</button>
  </form>
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
      importe: importePadded
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
      Pago_soportado: 'SSL',
      Firma: firma,

      // 🔥 CAMPOS CORRECTOS (Cecabank espera URL_OK y URL_NOK)
      URL_OK: CECABANK_CONFIG.urlOk,
      URL_NOK: CECABANK_CONFIG.urlKo,
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
