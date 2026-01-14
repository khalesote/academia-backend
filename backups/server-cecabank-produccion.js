// ENDPOINTS DE CECABANK - VERSIÓN PRODUCCIÓN LIMPIA
// Solo para MatriculaScreen (Escuela Virtual)

const express = require('express');
const crypto = require('crypto');

// ============================================
// ENDPOINTS DE CECABANK - PRODUCCIÓN
// ============================================

// Endpoint OK - Pago exitoso
app.post('/api/cecabank/ok', express.urlencoded({ extended: true }), (req, res) => {
  try {
    console.log('✅ Pago exitoso recibido de Cecabank');
    console.log('📝 Datos recibidos:', req.body);
    
    // Responder con página de éxito
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pago Exitoso</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .success { color: #4CAF50; font-size: 48px; margin-bottom: 20px; }
          h1 { color: #333; }
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
    
    // Responder con página de error
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pago Fallido</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #f44336; font-size: 48px; margin-bottom: 20px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <div class="error">❌</div>
        <h1>Pago No Procesado</h1>
        <p>No se pudo completar el pago.</p>
        <p>Puedes intentarlo nuevamente o contactar soporte.</p>
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
  try {
    console.log('🔄 Endpoint de redirección a Cecabank recibido');
    console.log('📝 Datos recibidos:', req.body);
    
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
    const firma = generateCecabankSignature(
      formData.Num_operacion,
      formData.Importe,
      fechaOperacion,
      horaOperacion,
      formData.URL_OK,
      formData.URL_KO
    );
    
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
    <form id="cecabankForm" method="POST" action="${urlCecabank}" enctype="application/x-www-form-urlencoded" style="display: none;">
${formFields}
    </form>
    <script>
      (function() {
        console.log('🚀 Iniciando redirección a Cecabank');
        
        function submitForm() {
          try {
            const form = document.getElementById('cecabankForm');
            if (!form) {
              console.error('❌ Formulario no encontrado');
              return false;
            }
            
            console.log('✅ Enviando formulario a:', form.action);
            form.submit();
            return true;
          } catch (error) {
            console.error('❌ Error:', error);
            return false;
          }
        }
        
        // Auto-enviar formulario
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
          submitForm();
        } else {
          document.addEventListener('DOMContentLoaded', submitForm);
        }
        
        // Respaldo
        setTimeout(submitForm, 100);
      })();
    </script>
  </body>
</html>`;
    
    console.log('✅ HTML generado, enviando al cliente');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
    
  } catch (error) {
    console.error('❌ Error en endpoint de redirección:', error);
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
  const merchantId = process.env.CECABANK_MERCHANT_ID || '';
  const acquirerBin = process.env.CECABANK_ACQUIRER_BIN || '';
  const terminalId = process.env.CECABANK_TERMINAL_ID || '';
  const clave = process.env.CECABANK_CLAVE || '';
  const tipoMoneda = '978';
  const exponente = '2';
  const cifrado = 'SHA256';
  const idioma = '1';

  // Construir cadena para firma
  const cadenaFirma = 
    merchantId +
    acquirerBin +
    terminalId +
    numOperacion +
    importe +
    tipoMoneda +
    exponente +
    cifrado +
    (urlOk || '') +
    (urlKo || '') +
    idioma +
    fecha +
    hora +
    clave;

  console.log('🔐 Generando firma Cecabank:', {
    merchantId,
    numOperacion,
    importe,
    fecha,
    hora,
    urlOk,
    urlKo
  });

  // Generar HMAC SHA256 en Base64
  const hmac = crypto.createHmac('sha256', clave);
  hmac.update(cadenaFirma);
  const firma = hmac.digest('base64');
  
  console.log('✅ Firma generada:', firma.substring(0, 20) + '...');
  return firma;
}

console.log('✅ Endpoints de Cecabank cargados para producción');
