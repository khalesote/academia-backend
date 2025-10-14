  // Gate oral: frases cortas a leer (B1)
  const oralGatePrompts: string[] = [
    'Me gusta estudiar español todos los días.',
    'El trabajo en equipo es muy importante.',
    'La tecnología ayuda en la vida diaria.',
    'Viajar es una experiencia enriquecedora.',
    'La salud es lo más importante en la vida.'
  ];

  const buildWebSpeechHTML = (promptText: string) => `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; }
          .btn { padding: 10px 14px; border-radius: 8px; color: #fff; border: 0; margin-right: 8px; }
          .start { background: #1976d2; }
          .stop { background: #e53935; }
          .box { background: #f5f5f5; padding: 12px; border-radius: 8px; margin-top: 12px; }
          .prompt { background: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; border-radius: 8px; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <h3>Lectura en voz alta (Reconocimiento web)</h3>
        <div class="prompt">
          <div style="font-weight:600; color:#ff9800; margin-bottom:6px;">Texto a leer</div>
          <div id="target">${(promptText || '').replace(/</g,'&lt;')}</div>
        </div>
        <button class="btn start" id="start">Hablar</button>
        <button class="btn stop" id="stop">Detener</button>
        <div class="box"><div id="status">Listo</div><div id="out" style="margin-top:8px"></div></div>
        <div style="text-align:center; margin-top:12px;"><div id="pct" style="font-size:56px; font-weight:bold; color:#4caf50;">0%</div></div>
        <script>
          (function(){
            const RN = window.ReactNativeWebView;
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            let rec = null;
            const status = document.getElementById('status');
            const out = document.getElementById('out');
            const pctEl = document.getElementById('pct');
            const norm = (s) => (s||'').toLowerCase().normalize('NFC').replace(/[^a-záéíóúüñ\s]/g,'').trim();
            const target = norm(${JSON.stringify(''+(typeof promptText==='string'?promptText:''))});
            function scoreSimilarity(user, model){
              const u = norm(user).split(/\s+/).filter(Boolean);
              const m = norm(model).split(/\s+/).filter(Boolean);
              if (m.length === 0) return 0;
              const setU = new Set(u); let hits = 0; for (const w of m) if (setU.has(w)) hits++;
              return Math.min(100, Math.round((hits / m.length) * 100));
            }
            function send(type, payload){ try { RN.postMessage(JSON.stringify({ type, payload })); } catch(e) {} }
            if (!SR) { status.textContent = 'Web Speech no disponible'; send('error','no-sr'); }
            else {
              rec = new SR(); rec.lang='es-ES'; rec.interimResults=true; rec.maxAlternatives=1;
              rec.onstart=()=>{ status.textContent='Grabando...'; send('status','start'); };
              rec.onend=()=>{ status.textContent='Detenido'; send('status','end'); };
              rec.onerror=(e)=>{ status.textContent='Error: '+(e.error||''); send('error',e.error||'error'); };
              rec.onresult=(e)=>{ let txt=''; for(let i=e.resultIndex;i<e.results.length;i++){ txt += e.results[i][0].transcript+' '; }
                out.textContent=txt.trim(); const p=scoreSimilarity(txt.trim(), target); 
                pctEl.style.color = p >= 80 ? '#4caf50' : p >= 60 ? '#ff9800' : '#f44336';
                pctEl.textContent=p+'%'; send('result',{ text: txt.trim(), percent: p }); };
            }
            document.getElementById('start').onclick=()=>{ try{ rec && rec.start(); }catch(e){} };
            document.getElementById('stop').onclick=()=>{ try{ rec && rec.stop(); }catch(e){} };
            setTimeout(()=>{ try{ rec && rec.start(); }catch(e){} }, 300);
          })();
        </script>
      </body>
    </html>
  `;

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing, Alert, AppState, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { requestMicrophonePermission } from '../../../../utils/requestMicrophonePermission';
import { completeB1Level, unlockFirstUnit, getUnitProgress, B1_UNITS } from '../../../../utils/unitProgress';

type Pregunta = {
  id: string;
  unidad: string; // nombre de la unidad o 'Gramática'
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: string;
  correctaIdx?: number;
};

// Banco inicial de preguntas (se ampliará a 2 por unidad + 8 de gramática)
const preguntasBase: Pregunta[] = [
  // Trabajo (2)
  { id: 'trabajo_1', unidad: 'Trabajo', pregunta: '¿Qué palabra se refiere al dinero que recibes por tu trabajo?', opciones: ['Jornada', 'Salario', 'Entrevista', 'Profesión'], respuestaCorrecta: 'Salario' },
  { id: 'trabajo_2', unidad: 'Trabajo', pregunta: '¿Qué es un "contrato de trabajo"?', opciones: ['Un salario', 'Un documento que establece las condiciones laborales', 'Una entrevista', 'Una profesión'], respuestaCorrecta: 'Un documento que establece las condiciones laborales' },
  // Vivienda (2)
  { id: 'vivienda_1', unidad: 'Vivienda', pregunta: '¿Qué significa "alquiler"?', opciones: ['Comprar una casa', 'Pagar por vivir en una casa que no es tuya', 'Vender una casa', 'Construir una casa'], respuestaCorrecta: 'Pagar por vivir en una casa que no es tuya' },
  { id: 'vivienda_2', unidad: 'Vivienda', pregunta: '¿Qué es un "compañero de piso"?', opciones: ['Un vecino', 'Una persona que comparte la vivienda contigo', 'Un familiar', 'Un amigo'], respuestaCorrecta: 'Una persona que comparte la vivienda contigo' },
  // Salud (2)
  { id: 'salud_1', unidad: 'Salud', pregunta: '¿Qué palabra se refiere a la temperatura alta del cuerpo?', opciones: ['Dolor', 'Fiebre', 'Tos', 'Mareo'], respuestaCorrecta: 'Fiebre' },
  { id: 'salud_2', unidad: 'Salud', pregunta: '¿Qué número de emergencias se usa en España?', opciones: ['911', '112', '999', '061'], respuestaCorrecta: '112' },
  // Tecnología (2)
  { id: 'tecnologia_1', unidad: 'Tecnología', pregunta: '¿Qué dispositivo usas para hacer llamadas?', opciones: ['Ordenador', 'Teléfono móvil', 'Tablet', 'Televisor'], respuestaCorrecta: 'Teléfono móvil' },
  { id: 'tecnologia_2', unidad: 'Tecnología', pregunta: '¿Qué significa "descargar"?', opciones: ['Borrar', 'Bajar un archivo de internet', 'Subir', 'Comprar'], respuestaCorrecta: 'Bajar un archivo de internet' },
  // Transporte (2)
  { id: 'transporte_1', unidad: 'Transporte', pregunta: '¿Qué documento necesitas para conducir un coche?', opciones: ['Pasaporte', 'Carnet de conducir', 'DNI', 'Tarjeta sanitaria'], respuestaCorrecta: 'Carnet de conducir' },
  { id: 'transporte_2', unidad: 'Transporte', pregunta: '¿Cómo se llama el lugar donde esperas el autobús?', opciones: ['Estación', 'Parada', 'Terminal', 'Andén'], respuestaCorrecta: 'Parada' },
  // Cultura (2)
  { id: 'cultura_1', unidad: 'Cultura', pregunta: '¿En qué país se celebra la fiesta de San Fermín?', opciones: ['España', 'Francia', 'Italia', 'Marruecos'], respuestaCorrecta: 'España' },
  { id: 'cultura_2', unidad: 'Cultura', pregunta: '¿Cuál es el plato típico de Valencia?', opciones: ['Paella', 'Tortilla', 'Arepa', 'Cuscús'], respuestaCorrecta: 'Paella' },
  // Estudios (2)
  { id: 'estudios_1', unidad: 'Estudios', pregunta: 'En la universidad, la persona que imparte clases es el/la...', opciones: ['alumno/a', 'profesor/a', 'conserje', 'bibliotecario/a'], respuestaCorrecta: 'profesor/a' },
  { id: 'estudios_2', unidad: 'Estudios', pregunta: 'Para inscribirte oficialmente en una asignatura debes...', opciones: ['matricularte', 'aprobar', 'suspender', 'graduarte'], respuestaCorrecta: 'matricularte' },
  // Medio Ambiente (2)
  { id: 'medioambiente_1', unidad: 'Medio Ambiente', pregunta: '¿Qué contamina más el aire en las ciudades?', opciones: ['Transporte sin control', 'Árboles', 'Parques', 'Ríos limpios'], respuestaCorrecta: 'Transporte sin control' },
  { id: 'medioambiente_2', unidad: 'Medio Ambiente', pregunta: 'Para reducir residuos, una buena práctica doméstica es...', opciones: ['reciclar y reutilizar', 'tirar todo en una bolsa', 'quemar plásticos', 'usar más envoltorios'], respuestaCorrecta: 'reciclar y reutilizar' },
  // Deportes (2)
  { id: 'deportes_1', unidad: 'Deportes', pregunta: '¿Qué beneficio principal tiene hacer ejercicio con regularidad?', opciones: ['Empeora la salud', 'Mejora la salud cardiovascular', 'Aumenta el estrés', 'Empeora el sueño'], respuestaCorrecta: 'Mejora la salud cardiovascular' },
  { id: 'deportes_2', unidad: 'Deportes', pregunta: 'En un partido de fútbol, ¿cuántos jugadores hay por equipo en el campo?', opciones: ['9', '10', '11', '12'], respuestaCorrecta: '11' },
  // Gastronomía Hispana (2)
  { id: 'gastronomia_1', unidad: 'Gastronomía Hispana', pregunta: '¿Qué son las "tapas"?', opciones: ['Postres típicos', 'Platos pequeños para compartir', 'Bebidas tradicionales', 'Sopas frías'], respuestaCorrecta: 'Platos pequeños para compartir' },
  { id: 'gastronomia_2', unidad: 'Gastronomía Hispana', pregunta: '¿Cuál es un ingrediente básico del gazpacho andaluz?', opciones: ['Tomate', 'Arroz', 'Pollo', 'Patata'], respuestaCorrecta: 'Tomate' },
  // Medios de Comunicación (2)
  { id: 'medios_1', unidad: 'Medios de Comunicación', pregunta: 'El lugar donde se imprime y distribuye la información diaria se llama...', opciones: ['Farmacia', 'Periódico', 'Mercado', 'Biblioteca'], respuestaCorrecta: 'Periódico' },
  { id: 'medios_2', unidad: 'Medios de Comunicación', pregunta: 'Una noticia debe responder a...', opciones: ['Quién, qué, cuándo, dónde, por qué', 'Sólo quién y qué', 'Sólo dónde', 'Ninguna'], respuestaCorrecta: 'Quién, qué, cuándo, dónde, por qué' },
  // Problemas Sociales (2)
  { id: 'sociales_1', unidad: 'Problemas Sociales', pregunta: 'El "desempleo" significa...', opciones: ['Tener dos trabajos', 'No tener trabajo', 'Trabajar de noche', 'Estar de vacaciones'], respuestaCorrecta: 'No tener trabajo' },
  { id: 'sociales_2', unidad: 'Problemas Sociales', pregunta: 'La "integración" de inmigrantes implica...', opciones: ['Excluir su cultura', 'Prohibir su idioma', 'Participación y convivencia', 'Evitar el contacto'], respuestaCorrecta: 'Participación y convivencia' },
  // Turismo (2)
  { id: 'turismo_1', unidad: 'Turismo', pregunta: 'Para alojarte en un hotel es habitual...', opciones: ['Reservar habitación', 'Pedir receta', 'Comprar muebles', 'Solicitar matrícula'], respuestaCorrecta: 'Reservar habitación' },
  { id: 'turismo_2', unidad: 'Turismo', pregunta: 'Un atractivo turístico famoso en Barcelona es...', opciones: ['La Alhambra', 'La Sagrada Familia', 'El Museo del Prado', 'La Mezquita de Córdoba'], respuestaCorrecta: 'La Sagrada Familia' },
  // Viajes (2)
  { id: 'viajes_1', unidad: 'Viajes', pregunta: 'Un billete de "ida y vuelta" permite...', opciones: ['Sólo ir', 'Ir y volver', 'Sólo volver', 'Cambiar de nombre'], respuestaCorrecta: 'Ir y volver' },
  { id: 'viajes_2', unidad: 'Viajes', pregunta: 'Para viajar a otro país normalmente necesitas...', opciones: ['Carnet de biblioteca', 'Pasaporte', 'Recibo de luz', 'Carta del jefe'], respuestaCorrecta: 'Pasaporte' },
  // Vida Cotidiana (2)
  { id: 'vidacotidiana_1', unidad: 'Vida Cotidiana', pregunta: 'Hacer la compra significa...', opciones: ['Hacer ejercicio', 'Comprar alimentos y productos básicos', 'Comprar coches', 'Pagar impuestos'], respuestaCorrecta: 'Comprar alimentos y productos básicos' },
  { id: 'vidacotidiana_2', unidad: 'Vida Cotidiana', pregunta: 'Si entras a trabajar a las 9:00 y sales a las 17:00, tu jornada es de...', opciones: ['6 horas', '7 horas', '8 horas', '10 horas'], respuestaCorrecta: '8 horas' },
  // Voluntariado (2)
  { id: 'voluntariado_1', unidad: 'Voluntariado', pregunta: 'El voluntariado consiste en...', opciones: ['Trabajar a cambio de salario', 'Ayudar de forma solidaria sin remuneración', 'Dirigir una empresa', 'Comprar productos solidarios'], respuestaCorrecta: 'Ayudar de forma solidaria sin remuneración' },
  { id: 'voluntariado_2', unidad: 'Voluntariado', pregunta: 'Una ONG es una...', opciones: ['Oficina Nacional de Gestión', 'Organización No Gubernamental', 'Oferta No Garantizada', 'Orden Nueva Global'], respuestaCorrecta: 'Organización No Gubernamental' },
  // Experiencias (2)
  { id: 'experiencias_1', unidad: 'Experiencias', pregunta: 'Para contar una experiencia pasada en español se usa con frecuencia...', opciones: ['Pretérito indefinido', 'Subjuntivo presente', 'Futuro perfecto', 'Condicional compuesto'], respuestaCorrecta: 'Pretérito indefinido' },
  { id: 'experiencias_2', unidad: 'Experiencias', pregunta: 'Una anécdota es...', opciones: ['Un libro largo', 'Un relato breve de una vivencia', 'Un examen', 'Un viaje'], respuestaCorrecta: 'Un relato breve de una vivencia' },
  // Fiestas y Tradiciones (2)
  { id: 'fiestas_1', unidad: 'Fiestas y Tradiciones', pregunta: 'Las Fallas son unas fiestas famosas en...', opciones: ['Madrid', 'Valencia', 'Sevilla', 'Bilbao'], respuestaCorrecta: 'Valencia' },
  { id: 'fiestas_2', unidad: 'Fiestas y Tradiciones', pregunta: 'En Semana Santa son típicas las...', opciones: ['Procesiones', 'Fallas', 'Cabalgatas de Reyes', 'Romerías del Rocío'], respuestaCorrecta: 'Procesiones' },
  // Literatura y Expresiones (2)
  { id: 'literatura_1', unidad: 'Literatura y Expresiones', pregunta: 'Un "refrán" es...', opciones: ['Una novela', 'Una obra de teatro', 'Una expresión popular con enseñanza', 'Un poema épico'], respuestaCorrecta: 'Una expresión popular con enseñanza' },
  { id: 'literatura_2', unidad: 'Literatura y Expresiones', pregunta: 'El autor de "Don Quijote de la Mancha" es...', opciones: ['Lorca', 'García Márquez', 'Cervantes', 'Unamuno'], respuestaCorrecta: 'Cervantes' },
  // Alimentación (2)
  { id: 'alimentacion_1', unidad: 'Alimentación', pregunta: 'La dieta mediterránea se caracteriza por el uso de...', opciones: ['Aceite de oliva', 'Manteca de cerdo', 'Mucha bollería', 'Refrescos'], respuestaCorrecta: 'Aceite de oliva' },
  { id: 'alimentacion_2', unidad: 'Alimentación', pregunta: 'El gazpacho es...', opciones: ['Un postre', 'Una sopa fría', 'Un segundo plato de carne', 'Un tipo de pan'], respuestaCorrecta: 'Una sopa fría' },
  // Relaciones (2)
  { id: 'relaciones_1', unidad: 'Relaciones', pregunta: 'Celebrar el "aniversario" con tu pareja significa...', opciones: ['Recordar la fecha especial de la relación', 'Dejar la relación', 'Mudarse', 'Pedir trabajo'], respuestaCorrecta: 'Recordar la fecha especial de la relación' },
  { id: 'relaciones_2', unidad: 'Relaciones', pregunta: 'Una pareja comprometida suele tener un...', opciones: ['Contrato laboral', 'Compromiso o promesa de matrimonio', 'Carnet de conducir', 'Examen'], respuestaCorrecta: 'Compromiso o promesa de matrimonio' },
  // Gramática (8)
  { id: 'gramatica_1', unidad: 'Gramática', pregunta: 'Subjuntivo: "Espero que tú ___ (venir) pronto"', opciones: ['vienes', 'vendrás', 'vengas', 'ven'], respuestaCorrecta: 'vengas' },
  { id: 'gramatica_2', unidad: 'Gramática', pregunta: 'Indefinido vs Imperfecto: Ayer ___ (ir) al cine y ___ (ver) una película.', opciones: ['iba / veía', 'fui / vi', 'voy / veo', 'iré / veré'], respuestaCorrecta: 'fui / vi' },
  { id: 'gramatica_3', unidad: 'Gramática', pregunta: 'Futuro: Mañana ___ (llover) en Madrid.', opciones: ['llueve', 'llovía', 'lloverá', 'ha llovido'], respuestaCorrecta: 'lloverá' },
  { id: 'gramatica_4', unidad: 'Gramática', pregunta: 'Condicional: Yo en tu lugar ___ (hablar) con ella.', opciones: ['hablo', 'hablaré', 'hablaría', 'he hablado'], respuestaCorrecta: 'hablaría' },
  { id: 'gramatica_5', unidad: 'Gramática', pregunta: 'Imperativo: (tú) ___ (poner) la mesa.', opciones: ['pon', 'pones', 'ponga', 'poned'], respuestaCorrecta: 'pon' },
  { id: 'gramatica_6', unidad: 'Gramática', pregunta: 'Pronombres OD/OI: "Se lo di" significa...', opciones: ['Le di a él/ella', 'Lo di sin sujeto', 'Di el objeto a alguien (OI) y el objeto directo (OD)', 'No tiene sentido'], respuestaCorrecta: 'Di el objeto a alguien (OI) y el objeto directo (OD)' },
  { id: 'gramatica_7', unidad: 'Gramática', pregunta: 'Perífrasis: Elegir obligación', opciones: ['ir a + inf', 'poder + inf', 'tener que + inf', 'estar + gerundio'], respuestaCorrecta: 'tener que + inf' },
  { id: 'gramatica_8', unidad: 'Gramática', pregunta: 'Pretérito perfecto: Este año todavía no ___ (viajar) a España.', opciones: ['viajé', 'viajaba', 'he viajado', 'viajaré'], respuestaCorrecta: 'he viajado' },
  // Gramática extra
  { id: 'gramatica_9', unidad: 'Gramática', pregunta: 'Por vs Para: Este regalo es ___ ti.', opciones: ['por', 'para', 'de', 'a'], respuestaCorrecta: 'para' },
  { id: 'gramatica_10', unidad: 'Gramática', pregunta: 'Ser vs Estar: Hoy ___ cansado.', opciones: ['soy', 'estoy', 'he estado', 'era'], respuestaCorrecta: 'estoy' },
  { id: 'gramatica_11', unidad: 'Gramática', pregunta: 'Comparativos: Ana es ___ que Luis.', opciones: ['más alta', 'la más alta', 'altísima', 'tan alta'], respuestaCorrecta: 'más alta' },
  { id: 'gramatica_12', unidad: 'Gramática', pregunta: 'Estructura con "se" impersonal: En España ___ come tarde.', opciones: ['me', 'te', 'se', 'lo'], respuestaCorrecta: 'se' },
  { id: 'gramatica_13', unidad: 'Gramática', pregunta: 'Gustar: A mí ___ el café.', opciones: ['me gusta', 'me gusto', 'me gustan', 'me gustas'], respuestaCorrecta: 'me gusta' },
  { id: 'gramatica_14', unidad: 'Gramática', pregunta: 'Colocación de pronombres: Voy a ___ mañana. (llamarte)', opciones: ['te llamar', 'llamarte', 'llamárte', 'llamar te'], respuestaCorrecta: 'llamarte' },
  { id: 'gramatica_15', unidad: 'Gramática', pregunta: 'Subjuntivo con expresión de duda: No creo que ___ (ser) verdad.', opciones: ['es', 'sea', 'será', 'ha sido'], respuestaCorrecta: 'sea' },
  { id: 'gramatica_16', unidad: 'Gramática', pregunta: 'Estilo indirecto: Ella dijo: "Estoy cansada" -> Ella dijo que ___ cansada.', opciones: ['está', 'estaba', 'estaría', 'estuvo'], respuestaCorrecta: 'estaba' },
  { id: 'gramatica_17', unidad: 'Gramática', pregunta: 'Condicional perfecto: Yo en tu lugar ___ (haber decir) la verdad.', opciones: ['había dicho', 'he dicho', 'habría dicho', 'diría'], respuestaCorrecta: 'habría dicho' },
  { id: 'gramatica_18', unidad: 'Gramática', pregunta: 'Pluscuamperfecto: Cuando llegué, ya ___ (empezar) la película.', opciones: ['empezó', 'había empezado', 'ha empezado', 'empezaba'], respuestaCorrecta: 'había empezado' },
  { id: 'gramatica_19', unidad: 'Gramática', pregunta: 'Oración condicional (tipo 2): Si tuviera tiempo, ___ (viajar) más.', opciones: ['viajaría', 'viajaré', 'viajaba', 'he viajado'], respuestaCorrecta: 'viajaría' },
  { id: 'gramatica_20', unidad: 'Gramática', pregunta: 'Pronombres relativos: La persona ___ te llamó es mi profesora.', opciones: ['que', 'quien', 'cual', 'donde'], respuestaCorrecta: 'que' },
  // Gramática +15
  { id: 'gramatica_21', unidad: 'Gramática', pregunta: 'Pretérito imperfecto: De niño yo ___ (jugar) en el parque.', opciones: ['juego', 'jugué', 'jugaba', 'he jugado'], respuestaCorrecta: 'jugaba' },
  { id: 'gramatica_22', unidad: 'Gramática', pregunta: 'Pretérito indefinido: Ayer ___ (comer) con mis amigos.', opciones: ['como', 'comía', 'comí', 'he comido'], respuestaCorrecta: 'comí' },
  { id: 'gramatica_23', unidad: 'Gramática', pregunta: 'Pretérito perfecto: Esta semana ya ___ (terminar) el proyecto.', opciones: ['terminé', 'terminaba', 'he terminado', 'terminaría'], respuestaCorrecta: 'he terminado' },
  { id: 'gramatica_24', unidad: 'Gramática', pregunta: 'Pluscuamperfecto: Cuando llegamos, ellos ya ___ (salir).', opciones: ['salieron', 'salían', 'habían salido', 'han salido'], respuestaCorrecta: 'habían salido' },
  { id: 'gramatica_25', unidad: 'Gramática', pregunta: 'Futuro compuesto: Para 2030 ya ___ (resolver) este problema.', opciones: ['habré resuelto', 'he resuelto', 'resolví', 'resolvía'], respuestaCorrecta: 'habré resuelto' },
  { id: 'gramatica_26', unidad: 'Gramática', pregunta: 'Condicional simple: Me ___ (gustar) viajar más.', opciones: ['gusta', 'gustó', 'gustaría', 'he gustado'], respuestaCorrecta: 'gustaría' },
  { id: 'gramatica_27', unidad: 'Gramática', pregunta: 'Condicional compuesto: Si me lo hubieras dicho, te ___ (ayudar).', opciones: ['ayudé', 'ayudaría', 'habría ayudado', 'he ayudado'], respuestaCorrecta: 'habría ayudado' },
  { id: 'gramatica_28', unidad: 'Gramática', pregunta: 'Subjuntivo presente: Es importante que ___ (estudiar) cada día.', opciones: ['estudias', 'estudies', 'estudiarás', 'has estudiado'], respuestaCorrecta: 'estudies' },
  { id: 'gramatica_29', unidad: 'Gramática', pregunta: 'Subjuntivo pasado (imperfecto): Si ___ (tener) tiempo, iría contigo.', opciones: ['tengo', 'tuve', 'tuviera', 'he tenido'], respuestaCorrecta: 'tuviera' },
  { id: 'gramatica_30', unidad: 'Gramática', pregunta: 'Perífrasis: Acabar de + inf significa...', opciones: ['hace poco se terminó de hacer algo', 'obligación', 'capacidad', 'proceso en curso'], respuestaCorrecta: 'hace poco se terminó de hacer algo' },
  { id: 'gramatica_31', unidad: 'Gramática', pregunta: 'Gerundio: Estoy ___ (leer) un libro.', opciones: ['leyendo', 'leído', 'leo', 'leer'], respuestaCorrecta: 'leyendo' },
  { id: 'gramatica_32', unidad: 'Gramática', pregunta: 'Participio pasado: He ___ (escribir) dos cartas.', opciones: ['escribido', 'escrito', 'escribiendo', 'escribí'], respuestaCorrecta: 'escrito' },
  { id: 'gramatica_33', unidad: 'Gramática', pregunta: 'Imperativo negativo (tú): No ___ (fumar) aquí.', opciones: ['fumes', 'fuma', 'fumabas', 'fumaste'], respuestaCorrecta: 'fumes' },
  { id: 'gramatica_34', unidad: 'Gramática', pregunta: 'Adjetivos y concordancia: Ellas son muy ___ (inteligente).', opciones: ['inteligentes', 'inteligenta', 'inteligentos', 'inteligent'], respuestaCorrecta: 'inteligentes' },
  { id: 'gramatica_35', unidad: 'Gramática', pregunta: 'Pronombres indefinidos: No vino ___ a la reunión.', opciones: ['nadie', 'alguien', 'alguno', 'todos'], respuestaCorrecta: 'nadie' },
  // Gramática adicionales (10 más)
  { id: 'gramatica_36', unidad: 'Gramática', pregunta: 'Subjuntivo con emociones: Me alegra que ___ (venir) a visitarme.', opciones: ['vienes', 'vengas', 'viniste', 'vendrás'], respuestaCorrecta: 'vengas' },
  { id: 'gramatica_37', unidad: 'Gramática', pregunta: 'Artículos: ___ agua está muy fría.', opciones: ['La', 'El', 'Un', 'Una'], respuestaCorrecta: 'El' },
  { id: 'gramatica_38', unidad: 'Gramática', pregunta: 'Preposiciones de lugar: El libro está ___ la mesa.', opciones: ['en', 'sobre', 'encima de', 'todas son correctas'], respuestaCorrecta: 'todas son correctas' },
  { id: 'gramatica_39', unidad: 'Gramática', pregunta: 'Verbos reflexivos: Yo ___ levanto a las 7.', opciones: ['me', 'te', 'se', 'nos'], respuestaCorrecta: 'me' },
  { id: 'gramatica_40', unidad: 'Gramática', pregunta: 'Diminutivos: La forma diminutiva de "casa" es...', opciones: ['casita', 'casilla', 'caseta', 'casona'], respuestaCorrecta: 'casita' },
  { id: 'gramatica_41', unidad: 'Gramática', pregunta: 'Oraciones temporales: Cuando ___ (llegar) a casa, te llamo.', opciones: ['llego', 'llegue', 'llegué', 'llegaré'], respuestaCorrecta: 'llegue' },
  { id: 'gramatica_42', unidad: 'Gramática', pregunta: 'Voz pasiva: La carta ___ escrita por María.', opciones: ['fue', 'era', 'está', 'es'], respuestaCorrecta: 'fue' },
  { id: 'gramatica_43', unidad: 'Gramática', pregunta: 'Superlativo: Esta es ___ película del año.', opciones: ['la mejor', 'la más buena', 'buenísima', 'muy buena'], respuestaCorrecta: 'la mejor' },
  { id: 'gramatica_44', unidad: 'Gramática', pregunta: 'Conectores: Estudié mucho, ___ no aprobé el examen.', opciones: ['pero', 'porque', 'aunque', 'sino'], respuestaCorrecta: 'pero' },
  { id: 'gramatica_45', unidad: 'Gramática', pregunta: 'Modo subjuntivo: Ojalá ___ (hacer) buen tiempo mañana.', opciones: ['hace', 'haga', 'hará', 'hacía'], respuestaCorrecta: 'haga' },
];

const EXAM_LIMIT = 35;
const RECENT_KEY = 'B1_recent_qids';
const RECENT_ROUNDS = 3; // número de intentos a recordar para anti-repetición
const MIN_GRAMMAR = 13; // asegurar al menos 13 de gramática por intento
const REQUIRED_CORRECT = 31; // Aprobado con 31/35

const barajar = <T,>(arr: T[]) => arr.slice().sort(() => Math.random() - 0.5);

// Normalización robusta para comparar textos: minúsculas, sin tildes, sin puntuación, espacios colapsados
const normalizeStr = (s: string) => (s || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '') // diacríticos
  .replace(/[^a-z0-9áéíóúüñ\s]/gi, ' ') // quitar puntuación/símbolos
  .replace(/\s+/g, ' ')
  .trim();

// Eliminar preguntas duplicadas por enunciado normalizado
function dedupQuestions(bank: Pregunta[]): Pregunta[] {
  const seen = new Set<string>();
  const out: Pregunta[] = [];
  for (const q of bank) {
    // Clave compuesta: enunciado + opciones normalizadas ordenadas
    const optsKey = q.opciones.map(o => normalizeStr(o)).sort().join('|');
    const key = `${normalizeStr(q.pregunta)}__${optsKey}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(q);
    }
  }
  return out;
}

function estratificadoConAntiRepeticion(bank: Pregunta[], limit: number, recentSet: Set<string>): Pregunta[] {
  // Asegurar banco sin duplicados por enunciado
  bank = dedupQuestions(bank);
  // Separar gramática y unidades
  const grammar = bank.filter(q => q.unidad === 'Gramática');
  const units = bank.filter(q => q.unidad !== 'Gramática');

  // 1) Por unidad: tomar 1 no reciente si es posible
  const porUnidad = new Map<string, Pregunta[]>();
  units.forEach((q) => {
    if (!porUnidad.has(q.unidad)) porUnidad.set(q.unidad, []);
    porUnidad.get(q.unidad)!.push(q);
  });
  const seleccion: Pregunta[] = [];
  for (const [unidad, arr] of porUnidad.entries()) {
    const candidatosNR = arr.filter(q => !recentSet.has(q.id));
    const pool = candidatosNR.length > 0 ? candidatosNR : arr;
    const pick = barajar(pool)[0];
    if (pick) seleccion.push(pick);
  }

  // 2) Asegurar mínimo de gramática
  const yaGrammar = seleccion.filter(q => q.unidad === 'Gramática').length;
  const neededGrammar = Math.max(0, MIN_GRAMMAR - yaGrammar);
  if (neededGrammar > 0) {
    const gNR = grammar.filter(q => !recentSet.has(q.id));
    const gPool = [...barajar(gNR), ...barajar(grammar.filter(q => recentSet.has(q.id)))];
    for (const q of gPool) {
      if (seleccion.length >= limit) break;
      if (seleccion.filter(x => x.unidad === 'Gramática').length >= MIN_GRAMMAR) break;
      // Evitar duplicados por id
      if (!seleccion.find(x => x.id === q.id)) seleccion.push(q);
    }
  }

  // 3) Rellenar hasta limit con resto priorizando no recientes
  if (seleccion.length < limit) {
    const usados = new Set(seleccion.map(q => q.id));
    const resto = bank.filter(q => !usados.has(q.id));
    const restoNR = resto.filter(q => !recentSet.has(q.id));
    const pool = [...barajar(restoNR), ...barajar(resto.filter(q => recentSet.has(q.id)))];
    for (const q of pool) {
      if (seleccion.length >= limit) break;
      seleccion.push(q);
    }
  }

  // 4) Garantizar unicidad por enunciado en la selección final
  const únicos: Pregunta[] = [];
  const seenQ = new Set<string>();
  for (const q of barajar(seleccion)) {
    const optsKey = q.opciones.map(o => normalizeStr(o)).sort().join('|');
    const k = `${normalizeStr(q.pregunta)}__${optsKey}`;
    if (!seenQ.has(k)) {
      únicos.push(q);
      seenQ.add(k);
    }
    if (únicos.length >= limit) break;
  }
  return únicos;
}

export default function ExamenFinal() {
  const router = useRouter();
  // Verificación de progreso sin bloquear el acceso
  useEffect(() => {
    // Opcional: Puedes mantener la lógica de verificación sin bloquear
    (async () => {
      try {
        await getUnitProgress();
      } catch (e) {
        console.log('Error al cargar el progreso:', e);
      }
    })();
  }, []);
  const [iniciado, setIniciado] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [seleccion, setSeleccion] = useState<(number | null)[]>([]);
  const [mostrarCorreccion, setMostrarCorreccion] = useState(false);
  const [tiempo, setTiempo] = useState(15);
  const progress = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // ===== Gate ORAL (B1) estilo A1/A2 =====
  const [oralGatePassed, setOralGatePassed] = useState(false);
  const [webMode, setWebMode] = useState(false);
  const [oralGateIndex, setOralGateIndex] = useState(0);
  const [oralGateScores, setOralGateScores] = useState<number[]>([0,0,0,0,0]);
  const [webPromptText, setWebPromptText] = useState('');
  const [webPercent, setWebPercent] = useState<number | null>(null);

  // Gate oral: frases cortas a leer (B1)
  const oralGatePrompts: string[] = [
    'Me gusta estudiar español todos los días.',
    'El trabajo en equipo es muy importante.',
    'La tecnología ayuda en la vida diaria.',
    'Viajar es una experiencia enriquecedora.',
    'La salud es lo más importante en la vida.'
  ];

  const buildWebSpeechHTML = (promptText: string) => `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; }
          .btn { padding: 10px 14px; border-radius: 8px; color: #fff; border: 0; margin-right: 8px; }
          .start { background: #1976d2; }
          .stop { background: #e53935; }
          .box { background: #f5f5f5; padding: 12px; border-radius: 8px; margin-top: 12px; }
          .prompt { background: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; border-radius: 8px; margin-bottom: 12px; }
        </style>
      </head>
      <body>
        <h3>Lectura en voz alta (Reconocimiento web)</h3>
        <div class="prompt">
          <div style="font-weight:600; color:#ff9800; margin-bottom:6px;">Texto a leer</div>
          <div id="target">${(promptText || '').replace(/</g,'&lt;')}</div>
        </div>
        <button class="btn start" id="start">Hablar</button>
        <button class="btn stop" id="stop">Detener</button>
        <div class="box"><div id="status">Listo</div><div id="out" style="margin-top:8px"></div></div>
        <div style="text-align:center; margin-top:12px;"><div id="pct" style="font-size:56px; font-weight:bold; color:#4caf50;">0%</div></div>
        <script>
          (function(){
            const RN = window.ReactNativeWebView;
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            let rec = null;
            const status = document.getElementById('status');
            const out = document.getElementById('out');
            const pctEl = document.getElementById('pct');
            const norm = (s) => (s||'').toLowerCase().normalize('NFC').replace(/[^a-záéíóúüñ\\s]/g,'').trim();
            const target = norm(${JSON.stringify(''+(typeof promptText==='string'?promptText:''))});
            function scoreSimilarity(user, model){
              const u = norm(user).split(/\\s+/).filter(Boolean);
              const m = norm(model).split(/\\s+/).filter(Boolean);
              if (m.length === 0) return 0;
              const setU = new Set(u); let hits = 0; for (const w of m) if (setU.has(w)) hits++;
              return Math.min(100, Math.round((hits / m.length) * 100));
            }
            function send(type, payload){ try { RN.postMessage(JSON.stringify({ type, payload })); } catch(e) {} }
            if (!SR) { status.textContent = 'Web Speech no disponible'; send('error','no-sr'); }
            else {
              rec = new SR(); rec.lang='es-ES'; rec.interimResults=true; rec.maxAlternatives=1;
              rec.onstart=()=>{ status.textContent='Grabando...'; send('status','start'); };
              rec.onend=()=>{ status.textContent='Detenido'; send('status','end'); };
              rec.onerror=(e)=>{ status.textContent='Error: '+(e.error||''); send('error',e.error||'error'); };
              rec.onresult=(e)=>{ let txt=''; for(let i=e.resultIndex;i<e.results.length;i++){ txt += e.results[i][0].transcript+' '; }
                out.textContent=txt.trim(); const p=scoreSimilarity(txt.trim(), target); 
                pctEl.style.color = p >= 80 ? '#4caf50' : p >= 60 ? '#ff9800' : '#f44336';
                pctEl.textContent=p+'%'; send('result',{ text: txt.trim(), percent: p }); };
            }
            document.getElementById('start').onclick=()=>{ try{ rec && rec.start(); }catch(e){} };
            document.getElementById('stop').onclick=()=>{ try{ rec && rec.stop(); }catch(e){} };
            setTimeout(()=>{ try{ rec && rec.start(); }catch(e){} }, 300);
          })();
        </script>
      </body>
    </html>
  `;

  const handleStartOralGate = async () => {
    try {
      const granted = await requestMicrophonePermission();
      if (!granted) { Alert.alert('Permiso requerido', 'Concede acceso al micrófono para realizar el Examen Oral.'); return; }
      await AsyncStorage.setItem('B1_oral_gate_passed', 'false');
      setOralGateIndex(0);
      setOralGateScores([0,0,0,0,0]);
      setWebPercent(null);
      setWebPromptText(oralGatePrompts[0]);
      setWebMode(true);
    } catch (e) { Alert.alert('Micrófono', 'No se pudo iniciar el reconocimiento.'); }
  };

  const handleOralGateNext = async () => {
    const score = typeof webPercent === 'number' ? Math.round(webPercent) : 0;
    setOralGateScores((prev: number[]) => { const arr=[...prev]; arr[oralGateIndex]=score; return arr; });
    const filled = oralGateScores.map((v: number, i: number)=> (i===oralGateIndex ? score : v));
    const passedPartial = filled.filter((v: number) => v === 100).length >= 3;
    if (oralGateIndex < oralGatePrompts.length - 1) {
      const next = oralGateIndex + 1; setOralGateIndex(next); setWebPromptText(oralGatePrompts[next]); setWebPercent(null);
      if (passedPartial) setOralGatePassed(true);
    } else {
      const passed = filled.filter((v: number) => v === 100).length >= 3;
      setOralGatePassed(passed);
      await AsyncStorage.setItem('B1_oral_gate_passed', passed ? 'true' : 'false');
      setWebMode(false);
      Alert.alert(passed ? 'Oral aprobado' : 'Oral no aprobado', passed ? 'Has alcanzado 3 de 5 lecturas con 100%.' : 'Necesitas 3 de 5 lecturas al 100%.');
    }
  };

  // Inicialización: selección estratificada + anti-repetición y cálculo de índice correcto
  useEffect(() => {
    (async () => {
      try {
        const recentRaw = await AsyncStorage.getItem(RECENT_KEY);
        const recentIds: string[] = recentRaw ? JSON.parse(recentRaw) : [];
        const recentSet = new Set(recentIds);
        const base = dedupQuestions(preguntasBase);
        const seleccionadas = estratificadoConAntiRepeticion(base, EXAM_LIMIT, recentSet)
          .map((p) => {
            const ops = barajar(p.opciones);
            return { ...p, opciones: ops, correctaIdx: ops.findIndex(o => normalizar(o) === normalizar(p.respuestaCorrecta)) } as Pregunta;
          });
        setPreguntas(seleccionadas);
        setSeleccion(Array(seleccionadas.length).fill(null));
      } catch (e) {
        // Fallback simple
        const mezcladas = barajar(dedupQuestions(preguntasBase)).map((p) => {
          const ops = barajar(p.opciones);
          return { ...p, opciones: ops, correctaIdx: ops.findIndex(o => normalizar(o) === normalizar(p.respuestaCorrecta)) } as Pregunta;
        });
        setPreguntas(mezcladas.slice(0, EXAM_LIMIT));
        setSeleccion(Array(Math.min(EXAM_LIMIT, mezcladas.length)).fill(null));
      }
    })();
  }, []);

  // Cargar estado gate oral B1
  useEffect(() => {
    const loadOralGateStatus = async () => {
      try {
        console.log('🔍 B1_ExamenFinal: Verificando estado del oral gate en carga inicial...');
        const g = await AsyncStorage.getItem('B1_oral_gate_passed');
        console.log('🔍 B1_ExamenFinal: Estado crudo del oral gate:', g);
        const passed = g === 'true';
        console.log('🔍 B1_ExamenFinal: oralGatePassed establecido a:', passed);
        setOralGatePassed(passed);
      } catch (error) {
        console.error('❌ B1_ExamenFinal: Error verificando oral gate:', error);
        setOralGatePassed(false);
      }
    };

    // Pequeño delay para asegurar prioridad sobre otros componentes
    const timeoutId = setTimeout(loadOralGateStatus, 50);

    return () => clearTimeout(timeoutId);
  }, []);

  // Temporizador por pregunta
  useEffect(() => {
    if (!iniciado || terminado || mostrarCorreccion) return;
    timerRef.current = setInterval(() => {
      setTiempo((t) => {
        if (t <= 1) {
          avanzar();
          return 15;
        }
        return t - 1;
      });
    }, 1000);
    Animated.timing(progress, { toValue: 1, duration: 15000, easing: Easing.linear, useNativeDriver: false }).start();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [iniciado, terminado, mostrarCorreccion, preguntaActual]);

  // Si la app se va a background/inactiva durante el examen, reiniciar
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState;
      if ((nextState === 'background' || nextState === 'inactive') && iniciado && !terminado) {
        reiniciar();
        setIniciado(false);
        Alert.alert('Examen reiniciado', 'Saliste de la app durante el examen. Debes comenzar de nuevo.');
      }
    });
    return () => {
      try { sub.remove(); } catch {}
    };
  }, [iniciado, terminado]);

  const normalizar = (s: string) => (s || '').trim().toLowerCase().normalize('NFC');

  const empezar = () => {
    if (!oralGatePassed) {
      Alert.alert(
        'Examen Bloqueado',
        'Debes aprobar primero el examen oral antes de realizar el examen escrito.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    setIniciado(true);
    setPreguntaActual(0);
    setTiempo(15);
    progress.setValue(0);
  };

  const seleccionarOpcion = (idx: number) => {
    if (mostrarCorreccion) return;
    const nuevas = [...seleccion];
    nuevas[preguntaActual] = idx;
    setSeleccion(nuevas);
    setMostrarCorreccion(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => avanzar(), 900);
  };

  const avanzar = () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
      setMostrarCorreccion(false);
      setTiempo(15);
      progress.setValue(0);
    } else {
      setTerminado(true);
    }
  };

  const correctas = preguntas.reduce((acc, p, i) => acc + (seleccion[i] === (p.correctaIdx ?? -1) ? 1 : 0), 0);
  const total = preguntas.length || 1;
  const requerido = REQUIRED_CORRECT;

  const reiniciar = () => {
    setIniciado(false);
    setTerminado(false);
    setPreguntaActual(0);
    setSeleccion(Array(preguntas.length).fill(null));
    setTiempo(15);
    setMostrarCorreccion(false);
    progress.setValue(0);
  };

  const finalizar = async () => {
    if (correctas >= requerido) {
      try {
        await AsyncStorage.setItem('B1_examen_aprobado', 'true');
        await AsyncStorage.setItem('B1_final_passed', 'true'); // bandera canónica
        // Completar nivel B1 y desbloquear B2
        await completeB1Level();
        // Asegurar desbloqueo de la primera unidad de B2 en unit_progress
        await unlockFirstUnit('b2');
        
        // Mostrar mensaje de B2 desbloqueado
        Alert.alert(
          '¡Felicidades! 🎉',
          'Has completado el nivel B1 exitosamente.\n\n¡B2 DESBLOQUEADO!\n\nYa puedes acceder al nivel B2 - Avanzado.',
          [
            { text: 'Continuar a B2', onPress: () => router.replace('/B2_Avanzado') },
            { text: 'Volver a B1', onPress: () => router.replace('/B1_Umbral'), style: 'cancel' }
          ]
        );
      } catch (error) {
        console.error('Error completing B1 level:', error);
      }
    } else {
      // Guardar IDs usados para evitar repetición en próximos intentos
      try {
        const recentRaw = await AsyncStorage.getItem(RECENT_KEY);
        const old: string[] = recentRaw ? JSON.parse(recentRaw) : [];
        const usedNow = preguntas.map(p => p.id);
        // Mantener historial de las últimas RECENT_ROUNDS sesiones
        const merged = [...usedNow, ...old].slice(0, EXAM_LIMIT * RECENT_ROUNDS);
        await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(merged));
      } catch {}
      Alert.alert('No aprobado', `Obtuviste ${correctas}/${total}. Necesitas ${requerido}.`, [
        { text: 'Reintentar', onPress: reiniciar },
        { text: 'Volver a B1', style: 'cancel', onPress: () => router.replace('/B1_Umbral') },
      ]);
    }
  };

  // PANTALLA DE BIENVENIDA
  if (!iniciado) {
    return (
      <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/B1_Umbral')}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Ionicons name="school" size={64} color="#fff" />
        </View>
        <View style={styles.centerBox}>
          <Text style={styles.title}>Examen Final B1</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Instrucciones</Text>
            <Text style={styles.cardText}>15 segundos por pregunta</Text>
            <Text style={styles.cardText}>{preguntas.length} preguntas en total</Text>
            <Text style={styles.cardText}>Necesitas {requerido}/{total} para aprobar</Text>
            <Text style={styles.cardText}>Estado del examen oral: {oralGatePassed ? 'Aprobado ✅' : 'Pendiente 🔒'}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.cta,
              { backgroundColor: oralGatePassed ? '#fff' : 'rgba(255,255,255,0.6)' }
            ]}
            onPress={empezar}
            disabled={!oralGatePassed}
          >
            <Text style={[
              styles.ctaText,
              { color: oralGatePassed ? '#1976d2' : '#666' }
            ]}>
              {oralGatePassed ? 'Comenzar Examen' : 'Examen Bloqueado (Oral Pendiente)'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cta, { backgroundColor: '#fff', marginTop: 10 }]} onPress={handleStartOralGate}>
            <Text style={[styles.ctaText, { color: '#1976d2' }]}>Examen Oral (Reconocimiento Web)</Text>
          </TouchableOpacity>
        </View>
        {webMode && (
          <Modal visible transparent animationType="fade" onRequestClose={() => setWebMode(false)}>
            <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' }}>
              <View style={{ backgroundColor:'#fff', borderRadius:12, width:'92%', maxHeight:'86%', overflow:'hidden' }}>
                <View style={{ padding:12, backgroundColor:'#1976d2' }}>
                  <Text style={{ color:'#fff', fontWeight:'bold', textAlign:'center' }}>Examen Oral B1 (3 de 5 al 100%)</Text>
                </View>
                <View style={{ height: 420 }}>
                  <WebView
                    originWhitelist={["*"]}
                    source={{ html: buildWebSpeechHTML(webPromptText) }}
                    onMessage={(event) => {
                      try {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data?.type === 'result' && typeof data?.payload?.percent === 'number') {
                          setWebPercent(Math.round(data.payload.percent));
                        }
                      } catch {}
                    }}
                    // Conceder permisos de micrófono dentro de la WebView (Android)
                    onPermissionRequest={(e: any) => {
                      try { e.grant(e.resources); } catch {}
                    }}
                  />
                </View>
                <View style={{ padding:12 }}>
                  <Text style={{ textAlign:'center', marginBottom:8 }}>Lecturas aprobadas al 100%: {oralGateScores.filter(s => s === 100).length} / 5</Text>
                  <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                    <TouchableOpacity style={[styles.cta, { backgroundColor:'#e0e0e0', paddingVertical: 12 }]} onPress={() => {
                      if (oralGateIndex > 0) {
                        const prev = oralGateIndex - 1; setOralGateIndex(prev); setWebPromptText(oralGatePrompts[prev]); setWebPercent(null);
                      }
                    }}>
                      <Text style={[styles.ctaText, { color:'#333' }]}>Anterior</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.cta, { backgroundColor:'#1976d2', paddingVertical: 12 }]} onPress={handleOralGateNext}>
                      <Text style={[styles.ctaText, { color: '#fff' }]}>{oralGateIndex < oralGatePrompts.length - 1 ? 'Siguiente' : 'Finalizar'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => setWebMode(false)} style={{ marginTop:8, alignSelf:'center' }}>
                    <Text style={{ color:'#1976d2', fontWeight:'bold' }}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </LinearGradient>
    );
  }

  // RESULTADO
  if (terminado) {
    return (
      <LinearGradient colors={correctas >= requerido ? ['#4caf50', '#66bb6a'] : ['#f44336', '#ef5350']} style={styles.container}>
        <View style={styles.centerBox}>
          <Ionicons name={correctas >= requerido ? 'checkmark-circle' : 'close-circle'} size={96} color="#fff" />
          <Text style={styles.title}>{correctas >= requerido ? '¡Aprobado!' : 'No aprobado'}</Text>
          <Text style={styles.subtitle}>{correctas}/{total}</Text>
          <View style={{ height: 12 }} />
          <TouchableOpacity style={styles.secondaryBtn} onPress={finalizar}>
            <Text style={styles.secondaryBtnText}>{correctas >= requerido ? 'Guardar y continuar' : 'Intentarlo de nuevo'}</Text>
          </TouchableOpacity>
          <View style={{ height: 8 }} />
          <TouchableOpacity style={styles.ghostBtn} onPress={() => router.replace('/B1_Umbral')}>
            <Text style={styles.ghostBtnText}>Volver a B1</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const p = preguntas[preguntaActual];
  const seleccionIdx = seleccion[preguntaActual];

  return (
    <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.container}>
      <View style={styles.examHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/B1_Umbral')}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.counter}>{preguntaActual + 1}/{total}</Text>
        <Text style={styles.counter}>Aciertos: {correctas}/{total} (mín. {requerido})</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="time" size={20} color="#fff" />
          <Text style={styles.timerText}>{tiempo}s</Text>
        </View>
      </View>

      <View style={styles.progressBarWrap}>
        <Animated.View style={[styles.progressBar, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{p.pregunta}</Text>
        <View style={{ gap: 12, width: '100%' }}>
          {p.opciones.map((op, idx) => {
            const isCorrect = idx === (p.correctaIdx ?? -1);
            const isSelected = seleccionIdx === idx;
            const show = mostrarCorreccion;
            const btnStyle = [styles.option, show && isCorrect ? styles.optionCorrect : undefined, show && isSelected && !isCorrect ? styles.optionWrong : undefined];
            const txtStyle = [styles.optionText, show && (isCorrect || (isSelected && !isCorrect)) ? { color: '#fff' } : undefined];
            return (
              <TouchableOpacity key={idx} style={btnStyle} disabled={show} onPress={() => seleccionarOpcion(idx)}>
                <Text style={txtStyle}>{op}</Text>
                {show && isCorrect && <Ionicons name="checkmark-circle" size={22} color="#fff" />}
                {show && isSelected && !isCorrect && <Ionicons name="close-circle" size={22} color="#fff" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25, padding: 10 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#e3f2fd', textAlign: 'center' },
  card: { backgroundColor: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 12, width: '90%' },
  cardTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 6, fontSize: 16 },
  cardText: { color: '#fff' },
  cta: { backgroundColor: '#fff', paddingVertical: 14, paddingHorizontal: 34, borderRadius: 24 },
  ctaText: { color: '#1976d2', fontWeight: 'bold', fontSize: 16 },
  examHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12 },
  counter: { color: '#fff', fontWeight: 'bold' },
  timerText: { color: '#fff', marginLeft: 6, fontWeight: 'bold' },
  progressBarWrap: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 20 },
  progressBar: { height: '100%', backgroundColor: '#fff' },
  scroll: { padding: 20, alignItems: 'center' },
  question: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  option: { backgroundColor: 'rgba(255,255,255,0.9)', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionText: { color: '#1976d2', fontSize: 16, fontWeight: '600' },
  optionCorrect: { backgroundColor: '#4caf50' },
  optionWrong: { backgroundColor: '#f44336' },
  secondaryBtn: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 24 },
  secondaryBtnText: { color: '#388e3c', fontWeight: 'bold' },
  ghostBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 12, paddingHorizontal: 28, borderRadius: 24, borderWidth: 2, borderColor: '#fff' },
  ghostBtnText: { color: '#fff', fontWeight: 'bold' },
});
