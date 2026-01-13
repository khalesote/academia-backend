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
    
    // ✅ CRÍTICO: Usar fecha y hora del frontend si están presentes, o generar nuevas
    // IMPORTANTE: La fecha y hora usadas en la firma DEBEN ser exactamente las mismas que se envían en el formulario
    let fechaOperacion, horaOperacion;
    if (formData.FechaOperacion && formData.HoraOperacion) {
      // Usar las que vienen del frontend (ya generadas)
      fechaOperacion = String(formData.FechaOperacion).trim();
      horaOperacion = String(formData.HoraOperacion).trim();
      console.log('📅 Usando fecha/hora del frontend:', { fecha: fechaOperacion, hora: horaOperacion });
    } else {
      // Generar nuevas si no vienen
      const now = new Date();
      fechaOperacion = 
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0');
      horaOperacion = 
        now.getHours().toString().padStart(2, '0') +
        now.getMinutes().toString().padStart(2, '0') +
        now.getSeconds().toString().padStart(2, '0');
      console.log('📅 Generando nueva fecha/hora:', { fecha: fechaOperacion, hora: horaOperacion });
    }
    
    // ✅ CRÍTICO: Normalizar importe (eliminar ceros a la izquierda) antes de generar firma
    // El importe debe ser exactamente el mismo en la firma y en el formulario
    const importeNormalizado = String(formData.Importe || '').replace(/^0+/, '') || '0';
    if (importeNormalizado !== formData.Importe) {
      console.log('🔧 Importe normalizado para firma:', {
        original: formData.Importe,
        normalizado: importeNormalizado
      });
    }
    
    // ✅ CRÍTICO: Referencia debe ser exactamente el numOperacion (igual en firma y formulario)
    const referencia = String(formData.Num_operacion || '').trim();
    
    // ✅ CRÍTICO: Corregir campo Cifrado si viene como 'SHA256' o 'HMAC' (debe ser 'HMAC_SHA256')
    if (formData.Cifrado === 'SHA256' || formData.Cifrado === 'HMAC') {
      formData.Cifrado = 'HMAC_SHA256';
      console.log('🔧 Campo Cifrado corregido:', formData.Cifrado === 'SHA256' ? 'SHA256' : 'HMAC', '→ HMAC_SHA256');
    }
    
    // Recalcular firma con valores exactos que se enviarán en el formulario
    let firma;
    try {
      console.log('🔐 Generando firma con datos EXACTOS (que se enviarán en formulario):', {
        numOperacion: formData.Num_operacion,
        importe: importeNormalizado + ' (sin ceros)',
        fecha: fechaOperacion,
        hora: horaOperacion,
        referencia: referencia,
        urlOk: formData.URL_OK,
        urlKo: formData.URL_KO
      });
      
      firma = generateCecabankSignature(
        formData.Num_operacion,
        importeNormalizado, // Importe sin ceros
        fechaOperacion,     // Fecha exacta que se enviará
        horaOperacion,      // Hora exacta que se enviará
        formData.URL_OK,
        formData.URL_KO,
        referencia          // Referencia exacta que se enviará (numOperacion)
      );
      
      console.log('✅ Firma generada exitosamente');
    } catch (firmaError) {
      console.error('❌ Error al generar firma:', firmaError);
      return res.status(500).send(`Error al generar firma: ${firmaError.message}`);
    }
    
    // ✅ CRÍTICO: Asignar valores EXACTOS que se usarán en el formulario (deben coincidir con la firma)
    formData.Firma = firma;
    formData.FechaOperacion = fechaOperacion;  // Misma fecha que en la firma
    formData.HoraOperacion = horaOperacion;    // Misma hora que en la firma
    formData.Importe = importeNormalizado;     // Mismo importe que en la firma (sin ceros)
    formData.Referencia = referencia;         // Misma referencia que en la firma
    
    console.log('🔧 Valores finales en formulario (deben coincidir con la firma):', {
      Importe: formData.Importe + ' (sin ceros, igual que en firma)',
      Referencia: formData.Referencia + ' (igual que en firma)',
      Num_operacion: formData.Num_operacion,
      FirmaLength: firma.length
    });
    
    // URL de producción de Cecabank
    const urlCecabank = 'https://pgw.ceca.es/tpvweb/tpv/compra.action';
    
    // ✅ CRÍTICO: Ordenar campos según especificación de Cecabank y asegurar que todos estén presentes
    // Orden recomendado para mejor compatibilidad
    const ordenCampos = [
      'MerchantID',
      'AcquirerBIN',
      'TerminalID',
      'Num_operacion',
      'Importe',        // ✅ Sin ceros a la izquierda
      'TipoMoneda',
      'Exponente',
      'Referencia',     // ✅ Debe estar presente
      'Cifrado',
      'Firma',
      'URL_OK',
      'URL_KO',         // Se mapeará a URL_NOK
      'Idioma',
      'FechaOperacion',
      'HoraOperacion',
      'Descripcion'
    ];
    
    // Generar formulario HTML con campos en orden y valores exactos
    const formFields = ordenCampos
      .filter(campo => {
        // Incluir solo campos que existen en formData
        if (campo === 'URL_KO') {
          return formData.URL_KO !== undefined; // URL_KO se mapeará a URL_NOK
        }
        return formData[campo] !== undefined && formData[campo] !== null && formData[campo] !== '';
      })
      .map((campo) => {
        // Mapear URL_KO a URL_NOK para Cecabank
        let fieldName = campo;
        if (campo === 'URL_KO') {
          fieldName = 'URL_NOK';
        }
        
        const value = formData[campo];
        
        // ✅ CRÍTICO: Asegurar que Importe y Referencia sean exactamente como en la firma
        let finalValue = String(value || '');
        if (campo === 'Importe') {
          // Asegurar que no tenga ceros a la izquierda (debe coincidir con la firma)
          finalValue = finalValue.replace(/^0+/, '') || '0';
        }
        
        const escapedKey = String(fieldName)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        
        const escapedValue = String(finalValue)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
        
        return `            <input type="hidden" name="${escapedKey}" value="${escapedValue}" />`;
      })
      .join('\n');
    
    // Log para verificación
    console.log('📋 Campos en formulario HTML:', {
      Importe: formData.Importe,
      Referencia: formData.Referencia,
      Num_operacion: formData.Num_operacion,
      totalCampos: ordenCampos.filter(c => formData[c] !== undefined).length
    });
    
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
function generateCecabankSignature(numOperacion, importe, fecha, hora, urlOk, urlKo, referencia) {
  try {
    const merchantId = process.env.CECABANK_MERCHANT_ID || '086729753';
    const acquirerBin = process.env.CECABANK_ACQUIRER_BIN || '0000554027';
    const terminalId = process.env.CECABANK_TERMINAL_ID || '00000003';
    const clave = process.env.CECABANK_CLAVE || 'P7BB51K0ABTDOAGN0W084FK4MUHRM5GQ';
    
    // ✅ Validar que la clave esté configurada y tenga la longitud esperada
    if (!clave || clave.length === 0) {
      throw new Error('La clave de encriptación (CECABANK_CLAVE) no está configurada');
    }
    if (clave.length < 20) {
      console.warn('⚠️ ADVERTENCIA: La clave parece muy corta. Verifica que sea la clave correcta de producción.');
    }
    
    // ✅ Validar fecha y hora (Cecabank valida que la hora sea cercana a la actual)
    const ahora = new Date();
    const fechaActual = 
      ahora.getFullYear().toString() +
      (ahora.getMonth() + 1).toString().padStart(2, '0') +
      ahora.getDate().toString().padStart(2, '0');
    
    // Verificar que la fecha no sea muy antigua (más de 1 hora de diferencia)
    if (fecha !== fechaActual) {
      console.warn('⚠️ ADVERTENCIA: La fecha de operación no coincide con la fecha actual:', {
        fechaOperacion: fecha,
        fechaActual: fechaActual
      });
    }
    
    // Verificar que la hora no tenga un desfase muy grande (más de 5 minutos)
    const horaActual = 
      ahora.getHours().toString().padStart(2, '0') +
      ahora.getMinutes().toString().padStart(2, '0') +
      ahora.getSeconds().toString().padStart(2, '0');
    
    const diffMinutos = Math.abs(
      (parseInt(hora.substring(0, 2)) * 60 + parseInt(hora.substring(2, 4))) -
      (parseInt(horaActual.substring(0, 2)) * 60 + parseInt(horaActual.substring(2, 4)))
    );
    
    if (diffMinutos > 5) {
      console.warn('⚠️ ADVERTENCIA: Desfase de hora detectado (más de 5 minutos):', {
        horaOperacion: hora,
        horaActual: horaActual,
        diferenciaMinutos: diffMinutos
      });
    }
    const tipoMoneda = '978';
    const exponente = '2';
    const cifrado = 'HMAC_SHA256'; // ✅ CRÍTICO: Debe ser 'HMAC_SHA256' según especificación de Cecabank
    const idioma = '1';

    // Validar que todos los parámetros estén presentes
    if (!numOperacion || !importe || !fecha || !hora) {
      throw new Error('Faltan parámetros requeridos para generar la firma');
    }

    // ✅ CRÍTICO: Asegurar que todos los valores sean strings SIN espacios ni caracteres invisibles
    const numOpStr = String(numOperacion || '').trim();
    // ❌ IMPORTANTE: Importe SIN ceros a la izquierda (solo el número en céntimos)
    const importeStr = String(importe || '').replace(/^0+/, '').trim() || '0';
    
    // ✅ CRÍTICO: Referencia debe venir como parámetro (ya normalizada desde el endpoint)
    // Si no viene, usar numOperacion como fallback
    const referenciaStr = String(referencia || numOpStr || '0').trim();

    // ✅ CRÍTICO: Construir cadena para firma según orden EXACTO requerido por Cecabank
    // IMPORTANTE: Sin espacios, sin saltos de línea, sin separadores - concatenación directa
    // 1. MerchantID
    // 2. AcquirerBIN
    // 3. TerminalID
    // 4. Num_operacion
    // 5. Importe (SIN ceros a la izquierda)
    // 6. TipoMoneda
    // 7. Exponente
    // 8. Referencia (NO vacía)
    // 9. FirmaClave (clave de encriptación)
    const cadenaFirma = 
      String(merchantId).trim() + 
      String(acquirerBin).trim() + 
      String(terminalId).trim() + 
      numOpStr + 
      importeStr + 
      String(tipoMoneda).trim() + 
      String(exponente).trim() + 
      referenciaStr + 
      String(clave).trim();
    
    // ✅ CRÍTICO: Verificar que no haya caracteres invisibles o espacios
    const tieneEspacios = cadenaFirma.includes(' ');
    const tieneSaltosLinea = cadenaFirma.includes('\n') || cadenaFirma.includes('\r');
    const tieneTabs = cadenaFirma.includes('\t');
    
    if (tieneEspacios || tieneSaltosLinea || tieneTabs) {
      console.error('❌ ERROR CRÍTICO: La cadena de firma contiene caracteres invisibles:', {
        espacios: tieneEspacios,
        saltosLinea: tieneSaltosLinea,
        tabs: tieneTabs,
        cadenaLength: cadenaFirma.length,
        cadenaHex: Buffer.from(cadenaFirma).toString('hex')
      });
      throw new Error('La cadena de firma contiene caracteres invisibles que invalidarán la firma');
    }
    
    // ✅ Verificar que la cadena no esté vacía
    if (!cadenaFirma || cadenaFirma.length === 0) {
      throw new Error('La cadena de firma está vacía');
    }

    console.log('🔐 Generando firma con orden EXACTO de Cecabank:', {
      orden: [
        '1. MerchantID',
        '2. AcquirerBIN',
        '3. TerminalID',
        '4. Num_operacion',
        '5. Importe (SIN ceros a la izquierda)',
        '6. TipoMoneda',
        '7. Exponente',
        '8. Referencia (NO vacía)',
        '9. FirmaClave'
      ],
      valores: {
        merchantId,
        acquirerBin,
        terminalId,
        numOperacion: numOpStr,
        importe: importeStr + ' (sin padding)',
        tipoMoneda,
        exponente,
        referencia: referenciaStr,
        claveLength: clave.length,
        claveInicio: clave.substring(0, 4) + '...' // Solo mostrar inicio para seguridad
      },
      cadenaLength: cadenaFirma.length,
      tieneClave: !!clave && clave.length > 0,
      formatoFirma: 'HEX (64 caracteres)',
      cadenaHex: Buffer.from(cadenaFirma).toString('hex').substring(0, 40) + '...' // Para verificar caracteres invisibles
    });

    if (!clave || clave.length === 0) {
      throw new Error('La clave de encriptación (CECABANK_CLAVE) no está configurada');
    }

    // ✅ CRÍTICO: Cecabank requiere SHA-256 en HEX (64 caracteres), NO Base64 (44 caracteres)
    // Usar createHash (no createHmac) según especificación de Cecabank
    const firma = crypto
      .createHash('sha256')
      .update(cadenaFirma, 'utf8')
      .digest('hex'); // ✅ HEX (64 chars), NO Base64 (44 chars)
    
    if (firma.length !== 64) {
      throw new Error(`Firma generada con longitud incorrecta: ${firma.length} (debe ser 64 caracteres HEX)`);
    }
    
    console.log('✅ Firma Cecabank generada correctamente:', {
      longitud: firma.length,
      formato: 'HEX',
      primerosCaracteres: firma.substring(0, 10) + '...'
    });
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
