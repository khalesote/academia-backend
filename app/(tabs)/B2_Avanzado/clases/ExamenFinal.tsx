import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing, Alert, AppState, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { requestMicrophonePermission } from '../../../../utils/requestMicrophonePermission';

type Pregunta = {
  id: string;
  unidad: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: string;
  correctaIdx?: number;
};

// Banco de preguntas B2: 2 por unidad + 10 gramática
const preguntasBase: Pregunta[] = [
  // Trabajo (2)
  { id: 'trabajo_1', unidad: 'Trabajo', pregunta: '¿Qué significa "conciliar la vida laboral y familiar"?', opciones: ['Trabajar desde casa', 'Equilibrar tiempo de trabajo y familia', 'Cambiar de empleo', 'Trabajar en familia'], respuestaCorrecta: 'Equilibrar tiempo de trabajo y familia' },
  { id: 'trabajo_2', unidad: 'Trabajo', pregunta: '¿Qué es el "teletrabajo"?', opciones: ['Trabajar por teléfono', 'Trabajar a distancia usando tecnología', 'Trabajar en televisión', 'Trabajar de noche'], respuestaCorrecta: 'Trabajar a distancia usando tecnología' },
  // Vivienda (2)
  { id: 'vivienda_1', unidad: 'Vivienda', pregunta: '¿Qué es una "hipoteca"?', opciones: ['Un tipo de casa', 'Un préstamo para comprar vivienda', 'Un contrato de alquiler', 'Una reforma'], respuestaCorrecta: 'Un préstamo para comprar vivienda' },
  { id: 'vivienda_2', unidad: 'Vivienda', pregunta: '¿Qué significa "plusvalía" en el contexto inmobiliario?', opciones: ['Impuesto municipal', 'Aumento del valor de la propiedad', 'Gastos de comunidad', 'Seguro de hogar'], respuestaCorrecta: 'Aumento del valor de la propiedad' },
  // Salud (2)
  { id: 'salud_1', unidad: 'Salud', pregunta: '¿Qué es la "medicina preventiva"?', opciones: ['Curar enfermedades', 'Prevenir enfermedades antes de que aparezcan', 'Medicina alternativa', 'Cirugía'], respuestaCorrecta: 'Prevenir enfermedades antes de que aparezcan' },
  { id: 'salud_2', unidad: 'Salud', pregunta: '¿Qué significa "síntoma"?', opciones: ['Causa de enfermedad', 'Manifestación de una enfermedad', 'Tratamiento médico', 'Tipo de medicina'], respuestaCorrecta: 'Manifestación de una enfermedad' },
  // Tecnología (2)
  { id: 'tecnologia_1', unidad: 'Tecnología', pregunta: '¿Qué es la "inteligencia artificial"?', opciones: ['Un tipo de ordenador', 'Tecnología que simula inteligencia humana', 'Internet rápido', 'Programa antivirus'], respuestaCorrecta: 'Tecnología que simula inteligencia humana' },
  { id: 'tecnologia_2', unidad: 'Tecnología', pregunta: '¿Qué significa "ciberseguridad"?', opciones: ['Velocidad de internet', 'Protección contra amenazas digitales', 'Tipo de software', 'Red social'], respuestaCorrecta: 'Protección contra amenazas digitales' },
  // Educación (2)
  { id: 'educacion_1', unidad: 'Educación', pregunta: '¿Qué es la "educación a distancia"?', opciones: ['Estudiar en otro país', 'Aprender sin estar físicamente presente', 'Educación cara', 'Estudiar idiomas'], respuestaCorrecta: 'Aprender sin estar físicamente presente' },
  { id: 'educacion_2', unidad: 'Educación', pregunta: '¿Qué significa "formación continua"?', opciones: ['Estudiar sin parar', 'Actualizar conocimientos a lo largo de la vida', 'Educación obligatoria', 'Estudios universitarios'], respuestaCorrecta: 'Actualizar conocimientos a lo largo de la vida' },
  // Medio Ambiente (2)
  { id: 'medioambiente_1', unidad: 'Medio Ambiente', pregunta: '¿Qué es la "sostenibilidad"?', opciones: ['Usar recursos sin comprometer el futuro', 'Reciclar papel', 'Plantar árboles', 'Ahorrar dinero'], respuestaCorrecta: 'Usar recursos sin comprometer el futuro' },
  { id: 'medioambiente_2', unidad: 'Medio Ambiente', pregunta: '¿Qué significa "huella de carbono"?', opciones: ['Pisada en el suelo', 'Cantidad de CO2 que genera una actividad', 'Tipo de combustible', 'Marca de zapato'], respuestaCorrecta: 'Cantidad de CO2 que genera una actividad' },
  // Economía (2)
  { id: 'economia_1', unidad: 'Economía', pregunta: '¿Qué es la "inflación"?', opciones: ['Aumento general de precios', 'Bajada de salarios', 'Tipo de moneda', 'Crisis económica'], respuestaCorrecta: 'Aumento general de precios' },
  { id: 'economia_2', unidad: 'Economía', pregunta: '¿Qué significa "PIB"?', opciones: ['Producto Interior Bruto', 'Precio Inicial Base', 'Programa de Inversión', 'Plan de Incentivos'], respuestaCorrecta: 'Producto Interior Bruto' },
  // Política (2)
  { id: 'politica_1', unidad: 'Política', pregunta: '¿Qué es la "democracia"?', opciones: ['Gobierno del pueblo', 'Gobierno de los ricos', 'Gobierno militar', 'Gobierno religioso'], respuestaCorrecta: 'Gobierno del pueblo' },
  { id: 'politica_2', unidad: 'Política', pregunta: '¿Qué significa "sufragio universal"?', opciones: ['Voto obligatorio', 'Derecho a votar de todos los ciudadanos', 'Voto secreto', 'Elecciones cada 4 años'], respuestaCorrecta: 'Derecho a votar de todos los ciudadanos' },
  // Cultura (2)
  { id: 'cultura_1', unidad: 'Cultura', pregunta: '¿Qué es el "patrimonio cultural"?', opciones: ['Dinero de la cultura', 'Bienes culturales heredados', 'Museos modernos', 'Arte contemporáneo'], respuestaCorrecta: 'Bienes culturales heredados' },
  { id: 'cultura_2', unidad: 'Cultura', pregunta: '¿Qué significa "diversidad cultural"?', opciones: ['Muchos idiomas', 'Coexistencia de diferentes culturas', 'Turismo cultural', 'Festivales'], respuestaCorrecta: 'Coexistencia de diferentes culturas' },
  // Ciencia (2)
  { id: 'ciencia_1', unidad: 'Ciencia', pregunta: '¿Qué es la "biotecnología"?', opciones: ['Estudio de la vida', 'Tecnología aplicada a seres vivos', 'Medicina natural', 'Agricultura'], respuestaCorrecta: 'Tecnología aplicada a seres vivos' },
  { id: 'ciencia_2', unidad: 'Ciencia', pregunta: '¿Qué significa "investigación científica"?', opciones: ['Leer libros', 'Proceso sistemático para obtener conocimiento', 'Experimentos peligrosos', 'Estudiar en universidad'], respuestaCorrecta: 'Proceso sistemático para obtener conocimiento' },
  // Gramática (10)
  { id: 'gramatica_1', unidad: 'Gramática', pregunta: 'Subjuntivo en oraciones sustantivas: Es probable que ___ (llover) mañana.', opciones: ['llueve', 'llueva', 'llovió', 'lloverá'], respuestaCorrecta: 'llueva' },
  { id: 'gramatica_2', unidad: 'Gramática', pregunta: 'Subjuntivo imperfecto: Si ___ (tener) más tiempo, estudiaría más.', opciones: ['tengo', 'tuve', 'tuviera', 'tendré'], respuestaCorrecta: 'tuviera' },
  { id: 'gramatica_3', unidad: 'Gramática', pregunta: 'Condicional compuesto: Si hubieras venido, ___ (conocer) a mi familia.', opciones: ['conociste', 'conocerías', 'habrías conocido', 'conocías'], respuestaCorrecta: 'habrías conocido' },
  { id: 'gramatica_4', unidad: 'Gramática', pregunta: 'Subjuntivo pluscuamperfecto: Me alegré de que ___ (terminar) el proyecto.', opciones: ['terminó', 'hubiera terminado', 'terminara', 'había terminado'], respuestaCorrecta: 'hubiera terminado' },
  { id: 'gramatica_5', unidad: 'Gramática', pregunta: 'Estilo indirecto: Juan dijo: "Vendré mañana" → Juan dijo que ___ al día siguiente.', opciones: ['vendrá', 'vendría', 'viene', 'vino'], respuestaCorrecta: 'vendría' },
  { id: 'gramatica_6', unidad: 'Gramática', pregunta: 'Oraciones concesivas: ___ llueva, iremos al parque.', opciones: ['Aunque', 'Porque', 'Si', 'Cuando'], respuestaCorrecta: 'Aunque' },
  { id: 'gramatica_7', unidad: 'Gramática', pregunta: 'Perífrasis de probabilidad: ___ las cinco cuando llegó.', opciones: ['Eran', 'Serían', 'Fueron', 'Son'], respuestaCorrecta: 'Serían' },
  { id: 'gramatica_8', unidad: 'Gramática', pregunta: 'Oraciones finales: Estudia mucho ___ aprobar el examen.', opciones: ['para', 'por', 'de', 'con'], respuestaCorrecta: 'para' },
  { id: 'gramatica_9', unidad: 'Gramática', pregunta: 'Subjuntivo en oraciones temporales: Cuando ___ (llegar) a casa, cenamos.', opciones: ['llego', 'llegue', 'llegué', 'llegaré'], respuestaCorrecta: 'llegue' },
  { id: 'gramatica_10', unidad: 'Gramática', pregunta: 'Voz pasiva refleja: ___ venden casas en esta zona.', opciones: ['Se', 'Te', 'Me', 'Le'], respuestaCorrecta: 'Se' },
];

const EXAM_LIMIT = 30;
const RECENT_KEY = 'B2_recent_qids';
const RECENT_ROUNDS = 3;
const MIN_GRAMMAR = 10;
const REQUIRED_CORRECT = 24;

const barajar = <T,>(arr: T[]) => arr.slice().sort(() => Math.random() - 0.5);

const normalizeStr = (s: string) => (s || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9áéíóúüñ\s]/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function dedupQuestions(bank: Pregunta[]): Pregunta[] {
  const seen = new Set<string>();
  const out: Pregunta[] = [];
  for (const q of bank) {
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
  bank = dedupQuestions(bank);
  const grammar = bank.filter(q => q.unidad === 'Gramática');
  const units = bank.filter(q => q.unidad !== 'Gramática');

  const porUnidad = new Map<string, Pregunta[]>();
  units.forEach((q) => {
    if (!porUnidad.has(q.unidad)) porUnidad.set(q.unidad, []);
    porUnidad.get(q.unidad)!.push(q);
  });
  
  const seleccion: Pregunta[] = [];
  for (const [unidad, arr] of porUnidad.entries()) {
    const candidatosNR = arr.filter(q => !recentSet.has(q.id));
    const pool = candidatosNR.length > 0 ? candidatosNR : arr;
    const selected = barajar(pool).slice(0, 2);
    seleccion.push(...selected);
  }

  const yaGrammar = seleccion.filter(q => q.unidad === 'Gramática').length;
  const neededGrammar = Math.max(0, MIN_GRAMMAR - yaGrammar);
  if (neededGrammar > 0) {
    const gNR = grammar.filter(q => !recentSet.has(q.id));
    const gPool = [...barajar(gNR), ...barajar(grammar.filter(q => recentSet.has(q.id)))];
    for (const q of gPool) {
      if (seleccion.length >= limit) break;
      if (seleccion.filter(x => x.unidad === 'Gramática').length >= MIN_GRAMMAR) break;
      if (!seleccion.find(x => x.id === q.id)) seleccion.push(q);
    }
  }

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

// Gate oral B2: párrafos complejos para lectura
const oralGatePrompts: string[] = [
  'Un periodista recorrió los barrios históricos para entrevistar a los vecinos sobre los cambios urbanísticos.',
  'Los trenes de alta velocidad han conectado regiones, pero los pueblos pequeños necesitan más inversiones.',
  'Voluntarios enseñan a personas mayores a usar videollamadas para comunicarse con familiares emigrados.',
  'Una cooperativa agrícola apostó por el cultivo ecológico y la venta directa a clientes conscientes.',
  'Un club de lectura reúne mensualmente a personas de distintas edades para debatir novelas contemporáneas.'
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
      <h3>Lectura en voz alta B2 (Reconocimiento web)</h3>
      <div class="prompt">
        <div style="font-weight:600; color:#ff9800; margin-bottom:6px;">Texto a leer</div>
        <div id="target">${(promptText || '').replace(/</g,'&lt;')}</div>
      </div>
      <button class="btn start" id="start">Hablar</button>
      <button class="btn stop" id="stop">Detener</button>
      <div class="box"><div id="status">Listo</div><div id="out" style="margin-top:8px"></div></div>
      <div style="text-align:center; margin-top:12px;"><div id="pct" style="font-size:56px; font-weight:bold; color:#1976d2;">0%</div></div>
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
              pctEl.style.color = p >= 85 ? '#4caf50' : p >= 70 ? '#ff9800' : '#f44336';
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

export default function ExamenFinal() {
  const router = useRouter();
  // Examen B2 siempre accesible (sin guard de unidades completadas)
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

  // ===== ORAL EXAM (B2) - estilo A1/A2 =====
  const [oralGatePassed, setOralGatePassed] = useState(false);
  const [webMode, setWebMode] = useState(false);
  const [oralGateIndex, setOralGateIndex] = useState(0);
  const [oralGateScores, setOralGateScores] = useState<number[]>([0,0,0,0,0]);
  const [webPromptText, setWebPromptText] = useState('');
  const [webPercent, setWebPercent] = useState<number | null>(null);

  const handleStartOral = async () => {
    try {
      const granted = await requestMicrophonePermission();
      if (!granted) { Alert.alert('Permiso requerido', 'Concede acceso al micrófono para realizar el Examen Oral.'); return; }
      await AsyncStorage.setItem('B2_oral_gate_passed', 'false');
      setOralGateIndex(0);
      setOralGateScores([0,0,0,0,0]);
      setWebPercent(null);
      setWebPromptText(oralGatePrompts[0]);
      setWebMode(true);
    } catch (e) { Alert.alert('Micrófono', 'No se pudo iniciar el reconocimiento.'); }
  };

  const handleOralNext = async () => {
    const score = typeof webPercent === 'number' ? Math.round(webPercent) : 0;
    setOralGateScores((prev: number[]) => { const arr=[...prev]; arr[oralGateIndex]=score; return arr; });
    const filled = oralGateScores.map((v: number, i: number)=> (i===oralGateIndex ? score : v));
    if (oralGateIndex < oralGatePrompts.length - 1) {
      const next = oralGateIndex + 1; setOralGateIndex(next); setWebPromptText(oralGatePrompts[next]); setWebPercent(null);
    } else {
      const passed = filled.filter((v: number) => v >= 85).length >= 3;
      console.log('🔥 B2_ExamenFinal: Examen oral completado, resultado:', passed);
      console.log('🔥 B2_ExamenFinal: Puntuaciones obtenidas:', filled);
      setOralGatePassed(passed);
      await AsyncStorage.setItem('B2_oral_gate_passed', passed ? 'true' : 'false');
      console.log('🔥 B2_ExamenFinal: Estado guardado en AsyncStorage:', passed ? 'true' : 'false');
      setWebMode(false);
      Alert.alert(passed ? 'Oral aprobado' : 'Oral no aprobado', passed ? 'Has alcanzado 3 de 5 lecturas con 85%.' : 'Necesitas 3 de 5 lecturas al 85%.');
    }
  };

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
        const mezcladas = barajar(dedupQuestions(preguntasBase)).map((p) => {
          const ops = barajar(p.opciones);
          return { ...p, opciones: ops, correctaIdx: ops.findIndex(o => normalizar(o) === normalizar(p.respuestaCorrecta)) } as Pregunta;
        });
        setPreguntas(mezcladas.slice(0, EXAM_LIMIT));
        setSeleccion(Array(Math.min(EXAM_LIMIT, mezcladas.length)).fill(null));
      }
    })();
  }, []);

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

  // Cargar estado gate oral B2
  useEffect(() => {
    const loadOralGateStatus = async () => {
      try {
        console.log('🔍 B2_ExamenFinal: Verificando estado del oral gate en carga inicial...');
        const g = await AsyncStorage.getItem('B2_oral_gate_passed');
        console.log('🔍 B2_ExamenFinal: Estado crudo del oral gate:', g);
        const passed = g === 'true';
        console.log('🔍 B2_ExamenFinal: oralGatePassed establecido a:', passed);
        setOralGatePassed(passed);
      } catch (error) {
        console.error('❌ B2_ExamenFinal: Error verificando oral gate:', error);
        setOralGatePassed(false);
      }
    };

    // Pequeño delay para asegurar prioridad sobre otros componentes
    const timeoutId = setTimeout(loadOralGateStatus, 50);

    return () => clearTimeout(timeoutId);
  }, []);

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
      // Verificar si el examen oral también está completado
      const oralPassed = oralGateScores.filter(s => s >= 85).length >= 3;
      
      if (oralPassed) {
        // Ambos exámenes completados - dar diploma
        try {
          await AsyncStorage.setItem('B2_examen_aprobado', 'true');
          await AsyncStorage.setItem('aprobadoB2', 'true');
          await AsyncStorage.setItem('nivelB2', 'true');
        } catch {}
        
        Alert.alert(
          '¡Felicitaciones! 🎉', 
          `Has completado exitosamente el nivel B2.\n\nExamen Escrito: ${correctas}/${total}\nExamen Oral: ${oralGateScores.filter(s => s >= 85).length}/5 lecturas correctas\n\n¡Ya puedes obtener tu diploma B2!`, 
          [
            { text: 'Obtener Diploma B2', onPress: () => router.replace('/DiplomaScreen?nivel=B2') },
            { text: 'Menú Principal', onPress: () => router.replace('/SchoolScreen'), style: 'cancel' },
          ]
        );
      } else {
        // Solo examen escrito completado - necesita oral
        Alert.alert(
          '¡Examen Escrito Aprobado! ✅', 
          `Has aprobado el examen escrito con ${correctas}/${total} respuestas correctas.\n\nPara obtener tu diploma B2, también debes completar el examen oral (3 de 5 lecturas con 85% de precisión).`, 
          [
            { text: 'Continuar con Examen Oral', onPress: () => {
              handleStartOral();
            }},
            { text: 'Volver a B2', onPress: () => router.replace('/B2_Avanzado'), style: 'cancel' },
          ]
        );
      }
    } else {
      Alert.alert('No aprobado', `Obtuviste ${correctas}/${total}. Necesitas ${requerido} para aprobar.`, [
        { text: 'Reintentar', onPress: reiniciar },
        { text: 'Volver a B2', style: 'cancel', onPress: () => router.replace('/B2_Avanzado') },
      ]);
    }
  };

  if (!iniciado) {
    return (
      <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/B2_Avanzado')}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Ionicons name="school" size={64} color="#fff" />
        </View>
        <View style={styles.centerBox}>
          <Text style={styles.title}>Examen Final B2</Text>
          
          
          <View style={[styles.card, { paddingVertical: 16, marginBottom: 16 }]}>
            <Text style={styles.cardTitle}>📝 Examen Escrito</Text>
            <Text style={styles.cardText}>• 30 preguntas • 15 segundos c/u</Text>
            <Text style={styles.cardText}>• Necesitas 24/30 para aprobar (80%)</Text>
            <Text style={styles.cardText}>Estado del examen oral: {oralGatePassed ? 'Aprobado ✅' : 'Pendiente 🔒'}</Text>
          </View>
          <TouchableOpacity style={styles.cta} onPress={empezar}>
            <Text style={styles.ctaText}>Comenzar Examen Escrito</Text>
          </TouchableOpacity>
          
          <View style={[styles.card, { paddingVertical: 16, marginTop: 10, marginBottom: 16 }]}>
            <Text style={styles.cardTitle}>🎤 Examen Oral</Text>
            <Text style={styles.cardText}>• 5 párrafos • Reconocimiento automático</Text>
            <Text style={styles.cardText}>• Objetivo: 3 de 5 con 85%+ precisión</Text>
          </View>
          <TouchableOpacity style={[styles.cta, { backgroundColor: '#ff9800' }]} onPress={handleStartOral}>
            <Text style={[styles.ctaText, { color: '#fff' }]}>Comenzar Examen Oral</Text>
          </TouchableOpacity>
        </View>
        
        {webMode && (
          <Modal visible transparent animationType="fade" onRequestClose={() => setWebMode(false)}>
            <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' }}>
              <View style={{ backgroundColor:'#fff', borderRadius:12, width:'92%', maxHeight:'86%', overflow:'hidden' }}>
                <View style={{ padding:12, backgroundColor:'#1976d2' }}>
                  <Text style={{ color:'#fff', fontWeight:'bold', textAlign:'center' }}>Examen Oral B2 - Párrafo {oralGateIndex + 1}/5</Text>
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
                  />
                </View>
                <View style={{ padding:12 }}>
                  <Text style={{ textAlign:'center', marginBottom:8 }}>Lecturas con 85%+: {oralGateScores.filter(s => s >= 85).length} / 5</Text>
                  <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                    <TouchableOpacity style={[styles.cta, { backgroundColor:'#e0e0e0', flex:1, marginRight:6 }]} onPress={() => {
                      if (oralGateIndex > 0) {
                        const prev = oralGateIndex - 1; setOralGateIndex(prev); setWebPromptText(oralGatePrompts[prev]); setWebPercent(null);
                      }
                    }}>
                      <Text style={[styles.ctaText, { color:'#333' }]}>Anterior</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.cta, { backgroundColor:'#1976d2', flex:1, marginLeft:6 }]} onPress={handleOralNext}>
                      <Text style={styles.ctaText}>{oralGateIndex < oralGatePrompts.length - 1 ? 'Siguiente' : 'Finalizar'}</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => setWebMode(false)} style={{ marginTop:8, alignSelf:'center' }}>
                    <Text style={{ color:'#1976d2' }}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </LinearGradient>
    );
  }

  // Mostrar modal oral si está activo
  if (webMode) {
    return (
      <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setWebMode(false)}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Ionicons name="school" size={64} color="#fff" />
        </View>
        
        <Modal visible transparent animationType="fade" onRequestClose={() => setWebMode(false)}>
          <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' }}>
            <View style={{ backgroundColor:'#fff', borderRadius:12, width:'92%', maxHeight:'86%', overflow:'hidden' }}>
              <View style={{ padding:12, backgroundColor:'#1976d2' }}>
                <Text style={{ color:'#fff', fontWeight:'bold', textAlign:'center' }}>Examen Oral B2 - Párrafo {oralGateIndex + 1}/5</Text>
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
                />
              </View>
              <View style={{ padding:12 }}>
                <Text style={{ textAlign:'center', marginBottom:8 }}>Lecturas con 85%+: {oralGateScores.filter(s => s >= 85).length} / 5</Text>
                <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                  <TouchableOpacity style={[styles.cta, { backgroundColor:'#e0e0e0', flex:1, marginRight:6 }]} onPress={() => {
                    if (oralGateIndex > 0) {
                      const prev = oralGateIndex - 1; setOralGateIndex(prev); setWebPromptText(oralGatePrompts[prev]); setWebPercent(null);
                    }
                  }}>
                    <Text style={[styles.ctaText, { color:'#333' }]}>Anterior</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.cta, { backgroundColor:'#1976d2', flex:1, marginLeft:6 }]} onPress={handleOralNext}>
                    <Text style={styles.ctaText}>{oralGateIndex < oralGatePrompts.length - 1 ? 'Siguiente' : 'Finalizar'}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setWebMode(false)} style={{ marginTop:8, alignSelf:'center' }}>
                  <Text style={{ color:'#1976d2' }}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    );
  }

  if (terminado) {
    const porcentaje = Math.round((correctas / total) * 100);
    const aprobado = correctas >= requerido;
    
    return (
      <LinearGradient colors={aprobado ? ['#4caf50', '#66bb6a'] : ['#f44336', '#ef5350']} style={styles.container}>
        <View style={styles.centerBox}>
          <Ionicons name={aprobado ? "checkmark-circle" : "close-circle"} size={80} color="#fff" />
          <Text style={styles.title}>{aprobado ? '¡Aprobado!' : 'No Aprobado'}</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resultados</Text>
            <Text style={styles.cardText}>Respuestas correctas: {correctas}/{total}</Text>
            <Text style={styles.cardText}>Porcentaje: {porcentaje}%</Text>
            <Text style={styles.cardText}>Estado del examen oral: {oralGatePassed ? 'Aprobado ✅' : 'Pendiente 🔒'}</Text>
            <Text style={styles.cardText}>Requerido: {requerido}/{total} ({Math.round((requerido/total)*100)}%)</Text>
          </View>
          <TouchableOpacity style={styles.cta} onPress={finalizar}>
            <Text style={styles.ctaText}>{aprobado ? 'Continuar' : 'Ver opciones'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const pregunta = preguntas[preguntaActual];
  if (!pregunta) return null;

  return (
    <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{preguntaActual + 1}/{preguntas.length}</Text>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
          </View>
          <Text style={styles.timerText}>{tiempo}s</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.unitText}>{pregunta.unidad}</Text>
          <Text style={styles.questionText}>{pregunta.pregunta}</Text>
        </View>
        
        <View style={styles.optionsContainer}>
          {pregunta.opciones.map((opcion, idx) => {
            let bgColor = '#fff';
            let textColor = '#333';
            let borderColor = '#e0e0e0';
            
            if (mostrarCorreccion) {
              if (idx === pregunta.correctaIdx) {
                bgColor = '#4caf50';
                textColor = '#fff';
                borderColor = '#4caf50';
              } else if (idx === seleccion[preguntaActual]) {
                bgColor = '#f44336';
                textColor = '#fff';
                borderColor = '#f44336';
              }
            }
            
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.option, { backgroundColor: bgColor, borderColor }]}
                onPress={() => seleccionarOpcion(idx)}
                disabled={mostrarCorreccion}
              >
                <Text style={[styles.optionText, { color: textColor }]}>{opcion}</Text>
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
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  backButton: { position: 'absolute', left: 20, top: 50, zIndex: 1, padding: 8 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 30, width: '100%', maxWidth: 400 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16, textAlign: 'center' },
  cardText: { fontSize: 16, color: '#666', marginBottom: 8, textAlign: 'center' },
  cta: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 32, minWidth: 200 },
  ctaText: { fontSize: 18, fontWeight: 'bold', color: '#1976d2', textAlign: 'center' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressText: { fontSize: 16, fontWeight: 'bold', color: '#fff', minWidth: 50 },
  progressBar: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginHorizontal: 16 },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  timerText: { fontSize: 16, fontWeight: 'bold', color: '#fff', minWidth: 40, textAlign: 'right' },
  content: { flex: 1, paddingHorizontal: 20 },
  questionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 20 },
  unitText: { fontSize: 14, fontWeight: 'bold', color: '#1976d2', marginBottom: 8, textTransform: 'uppercase' },
  questionText: { fontSize: 18, color: '#333', lineHeight: 24 },
  optionsContainer: { paddingBottom: 40 },
  option: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 2 },
  optionText: { fontSize: 16, textAlign: 'center', lineHeight: 20 },
});
