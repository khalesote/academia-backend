// Script de diagnóstico simplificado para verificar Firebase
console.log('🔍 === VERIFICACIÓN FIREBASE ===');
console.log('✅ Script de diagnóstico ejecutándose');

// Simular importación de Firebase
try {
  // Verificar si el archivo config/firebase.ts existe
  const fs = require('fs');
  const path = 'c:/Academy/config/firebase.ts';
  
  if (fs.existsSync(path)) {
    console.log('✅ Archivo config/firebase.ts existe');
    
    // Verificar contenido básico
    const content = fs.readFileSync(path, 'utf8');
    if (content.includes('initializeApp')) {
      console.log('✅ Contiene función initializeApp');
    }
    if (content.includes('getFirestore')) {
      console.log('✅ Contiene función getFirestore');
    }
    if (content.includes('apiKey')) {
      console.log('✅ Contiene configuración de API');
    }
  } else {
    console.log('❌ Archivo config/firebase.ts NO existe');
  }
  
} catch (error) {
  console.error('❌ Error en diagnóstico:', error.message);
}

console.log('=== FIN DIAGNÓSTICO ===');
