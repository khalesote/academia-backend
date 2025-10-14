import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert, ScrollView, Modal, Linking, AppState, AppStateStatus } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Voice from '@react-native-voice/voice';
import { WebView } from 'react-native-webview';
import { requestMicrophonePermission } from '../../../../utils/requestMicrophonePermission';
import { Platform } from 'react-native';

type PreguntaBase = {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: string;
};

type Pregunta = PreguntaBase & {
  correctaIdx?: number;
};

// Preguntas originales de A1 - preservadas completamente intactas
const preguntasOriginales: PreguntaBase[] = [
  // Unidad 1: Presentaciones
  {
    pregunta: '¿Cómo te llamas?',
    opciones: ['Me llamo María', 'Tengo 25 años', 'Vivo en Madrid', 'Soy estudiante'],
    respuestaCorrecta: 'Me llamo María',
  },
  {
    pregunta: '¿De dónde eres?',
    opciones: ['Soy de España', 'Tengo hambre', 'Me gusta el café', 'Estudio español'],
    respuestaCorrecta: 'Soy de España',
  },
  {
    pregunta: '¿Cuántos años tienes?',
    opciones: ['Tengo 30 años', 'Soy médico', 'Vivo aquí', 'Me llamo Ana'],
    respuestaCorrecta: 'Tengo 30 años',
  },
  // Unidad 2: La Familia
  {
    pregunta: '¿Cómo se dice "padre" en árabe?',
    opciones: ['أب', 'أم', 'أخ', 'أخت'],
    respuestaCorrecta: 'أب',
  },
  {
    pregunta: '¿Cuál es el plural de "hermano"?',
    opciones: ['hermanos', 'hermanas', 'hermano', 'hermana'],
    respuestaCorrecta: 'hermanos',
  },
  {
    pregunta: '¿Cómo presentas a tu familia?',
    opciones: ['Esta es mi familia', 'Me gusta cocinar', 'Voy al trabajo', 'Tengo sed'],
    respuestaCorrecta: 'Esta es mi familia',
  },
  // Unidad 3: La Casa
  {
    pregunta: '¿Dónde cocinas?',
    opciones: ['En la cocina', 'En el baño', 'En el dormitorio', 'En el jardín'],
    respuestaCorrecta: 'En la cocina',
  },
  {
    pregunta: '¿Cómo se dice "sala" en árabe?',
    opciones: ['غرفة جلوس', 'مطبخ', 'حمام', 'غرفة نوم'],
    respuestaCorrecta: 'غرفة جلوس',
  },
  {
    pregunta: '¿Dónde duermes?',
    opciones: ['En el dormitorio', 'En la cocina', 'En el baño', 'En la sala'],
    respuestaCorrecta: 'En el dormitorio',
  },
  // Unidad 4: Tiempo Libre y Comidas
  {
    pregunta: '¿Te gusta la paella?',
    opciones: ['Sí, me gusta mucho', 'No tengo hambre', 'Voy al médico', 'Estoy cansado'],
    respuestaCorrecta: 'Sí, me gusta mucho',
  },
  {
    pregunta: '¿Qué haces en tu tiempo libre?',
    opciones: ['Leo libros', 'Tengo 25 años', 'Soy de Madrid', 'Me llamo Juan'],
    respuestaCorrecta: 'Leo libros',
  },
  {
    pregunta: '¿Cuándo desayunas?',
    opciones: ['Por la mañana', 'Por la noche', 'Mañana', 'Ayer'],
    respuestaCorrecta: 'Por la mañana',
  },
  // Unidad 5: Direcciones
  {
    pregunta: '¿Dónde está el supermercado?',
    opciones: ['Está al lado del banco', 'Son las tres', 'Hace buen tiempo', 'Tengo hermanos'],
    respuestaCorrecta: 'Está al lado del banco',
  },
  {
    pregunta: '¿Cómo llego a la estación?',
    opciones: ['Siga recto y gire a la derecha', 'Tengo hambre', 'Me gusta el fútbol', 'Vivo aquí'],
    respuestaCorrecta: 'Siga recto y gire a la derecha',
  },
  {
    pregunta: '¿Cuál es lo contrario de "cerca"?',
    opciones: ['Lejos', 'Recto', 'Derecha', 'Izquierda'],
    respuestaCorrecta: 'Lejos',
  },
  // Unidad 6: Emociones y Salud
  {
    pregunta: '¿Cómo te sientes hoy?',
    opciones: ['Estoy contento', 'Tengo 25 años', 'Voy al médico', 'Me gusta el café'],
    respuestaCorrecta: 'Estoy contento',
  },
  {
    pregunta: 'Si alguien dice "Me duele la cabeza", ¿qué le pasa?',
    opciones: ['Tiene dolor de cabeza', 'Está contento', 'Tiene hambre', 'Quiere dormir'],
    respuestaCorrecta: 'Tiene dolor de cabeza',
  },
  {
    pregunta: '¿Qué haces cuando estás enfermo?',
    opciones: ['Voy al médico', 'Voy a la playa', 'Hago deporte', 'Voy de compras'],
    respuestaCorrecta: 'Voy al médico',
  },
  // Unidad 7: El Clima y las Estaciones
  {
    pregunta: '¿Cómo se dice "clima" en árabe?',
    opciones: ['طقس', 'مطر', 'شمس', 'ريح'],
    respuestaCorrecta: 'طقس',
  },
  {
    pregunta: '¿Cuál es la estación más calurosa del año?',
    opciones: ['Verano', 'Primavera', 'Otoño', 'Invierno'],
    respuestaCorrecta: 'Verano',
  },
];

// Enunciados orales (A1)
const oralPrompts = [
  'Hola, me llamo Ana.',
  'Vivo en Madrid.',
  'Tengo 25 años.',
  'Soy estudiante.',
  'Me gusta el café.'
];

// Gate de oral usará el mismo set de 5 frases
const oralGatePrompts = oralPrompts;

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
    <h3>Reconocimiento Web (beta)</h3>
    <div style="color:#555; font-size:14px; margin-bottom:8px;">El reconocimiento se inicia automáticamente. Si no empieza, pulsa "Hablar".</div>
    <div class="prompt">
      <div style="font-weight:600; color:#ff9800; margin-bottom:6px;">Texto a leer</div>
      <div id="target">${(promptText || '').replace(/</g,'&lt;')}</div>
    </div>
    <button class="btn start" id="start">Hablar / <span dir="rtl">تحدث</span></button>
    <button class="btn stop" id="stop">Detener / <span dir="rtl">إيقاف</span></button>
    <div class="box">
      <div id="status">Listo</div>
      <div id="out" style="margin-top:8px"></div>
    </div>
    <div style="text-align:center; margin-top:12px;">
      <div id="msg" style="font-size:18px; font-weight:600; color:#c62828"></div>
      <div id="emoji" style="font-size:48px; margin-top:6px;">😐</div>
      <div id="pct" style="font-size:56px; font-weight:bold; color:#c62828;">0%</div>
    </div>
    <script>
      (function(){
        const RN = window.ReactNativeWebView;
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        let rec = null;
        const status = document.getElementById('status');
        const out = document.getElementById('out');
        const pctEl = document.getElementById('pct');
        const msgEl = document.getElementById('msg');
        const norm = (s) => (s||'').toLowerCase().normalize('NFC').replace(/[^a-záéíóúüñ\s]/g,'').trim();
        const target = norm(${JSON.stringify(''+(typeof promptText==='string'?promptText:''))});
        function scoreSimilarity(user, model){
          const u = norm(user).split(/\s+/).filter(Boolean);
          const m = norm(model).split(/\s+/).filter(Boolean);
          if (m.length === 0) return 0;
          const setU = new Set(u);
          let hits = 0; for (const w of m) if (setU.has(w)) hits++;
          return Math.min(100, Math.round((hits / m.length) * 100));
        }
        function renderScore(p){
          pctEl.textContent = p + '%';
          const ok = p === 100;
          pctEl.style.color = ok ? '#2e7d32' : '#c62828';
          msgEl.textContent = ok ? '¡Enhorabuena!' : 'Sigue intentando';
          msgEl.style.color = ok ? '#2e7d32' : '#c62828';
        }
        function send(type, payload){ try { RN.postMessage(JSON.stringify({ type, payload })); } catch(e) {} }
        if (!SR) { status.textContent = 'Web Speech no disponible'; send('error','no-sr'); }
        else {
          rec = new SR(); rec.lang='es-ES'; rec.interimResults=true; rec.maxAlternatives=1;
          rec.onstart=()=>{ status.textContent='Grabando...'; send('status','start'); };
          rec.onend=()=>{ status.textContent='Detenido'; send('status','end'); };
          rec.onerror=(e)=>{ status.textContent='Error: '+(e.error||''); send('error',e.error||'error'); };
          rec.onresult=(e)=>{ let txt=''; for(let i=e.resultIndex;i<e.results.length;i++){ txt += e.results[i][0].transcript+' '; }
            out.textContent=txt.trim(); const p=scoreSimilarity(txt.trim(), target); renderScore(p); send('result',{ text: txt.trim(), percent: p }); };
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

  // Estados del examen escrito
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<string[]>([]);
  const [respuestasIdx, setRespuestasIdx] = useState<number[]>([]);
  const [correctas, setCorrectas] = useState<boolean[]>([]);
  const [tiempoRestante, setTiempoRestante] = useState(15);
  const [examenTerminado, setExamenTerminado] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [examenIniciado, setExamenIniciado] = useState(false);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  // Estados del examen oral
  const [oralMode, setOralMode] = useState(false);
  const [oralIdx, setOralIdx] = useState(0);
  const [oralTranscripts, setOralTranscripts] = useState<Record<number, string>>({});
  const [oralListening, setOralListening] = useState(false);
  const [oralFinished, setOralFinished] = useState(false);
  const [oralScore, setOralScore] = useState(0);
  const [oralScores, setOralScores] = useState<number[]>([0,0,0,0,0]);
  const [oralGatePassed, setOralGatePassed] = useState(false);

  // WebView oral gate
  const [webMode, setWebMode] = useState(false);
  const [oralGateIndex, setOralGateIndex] = useState(0);
  const [webPromptText, setWebPromptText] = useState('');
  const [webPercent, setWebPercent] = useState<number | null>(null);

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [examAttempt, setExamAttempt] = useState<number>(0);

  // Función para barajar array con semilla
  const seededShuffle = <T,>(array: T[], seed: number): T[] => {
    const rng = (a: number) => {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng(seed || 1) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Preparar preguntas al iniciar
  useEffect(() => {
    (async () => {
      try {
        const attStr = await AsyncStorage.getItem('A1_exam_attempt');
        const att = parseInt(attStr || '0') || 0;
        setExamAttempt(att);

        // Barajar opciones con semilla y seleccionar ventana distinta por intento
        const base: Pregunta[] = preguntasOriginales
          .map((pregunta, idx) => {
            const opcionesMezcladas = seededShuffle(pregunta.opciones, 100 + att * 997 + idx * 1013);
            const correctaIdx = opcionesMezcladas.findIndex(
              (o) => (o || '').trim().toLowerCase().normalize('NFC') === (pregunta.respuestaCorrecta || '').trim().toLowerCase().normalize('NFC')
            );
            return { ...pregunta, opciones: opcionesMezcladas, respuestaCorrecta: pregunta.respuestaCorrecta, correctaIdx };
          });

        const barajadas = seededShuffle(base, 1000 + att * 12345);
        const seleccion: Pregunta[] = [];
        for (let i = 0; i < Math.min(20, barajadas.length); i++) {
          seleccion.push(barajadas[i]);
        }

        setPreguntas(seleccion);
        setRespuestas(Array(seleccion.length).fill(''));
        setRespuestasIdx(Array(seleccion.length).fill(-1));
        setCorrectas(Array(seleccion.length).fill(false));
      } catch {
        // En caso de error, usar preguntas originales
        const preguntasDefault = preguntasOriginales.slice(0, 20) as Pregunta[];
        setPreguntas(preguntasDefault);
        setRespuestas(Array(preguntasDefault.length).fill(''));
        setRespuestasIdx(Array(preguntasDefault.length).fill(-1));
        setCorrectas(Array(preguntasDefault.length).fill(false));
      }
    })();
  }, []);

  // Cargar estado del gate oral
  useEffect(() => {
    const loadOralGateStatus = async () => {
      try {
        // Forzar una limpieza de estado local primero
        setOralGatePassed(false);
        
        // Verificar si existe la clave en AsyncStorage
        const hasKey = await AsyncStorage.getItem('A1_oral_gate_passed');
        
        if (hasKey === null) {
          // Si la clave no existe, crearla como false
          await AsyncStorage.setItem('A1_oral_gate_passed', 'false');
          setOralGatePassed(false);
        } else {
          // Si existe, cargar su valor
          const gate = await AsyncStorage.getItem('A1_oral_gate_passed');
          console.log('Estado del examen oral cargado:', gate);
          setOralGatePassed(gate === 'true');
        }
      } catch (error) {
        console.error('Error cargando estado del examen oral:', error);
        // Por defecto, asumir que no está aprobado
        setOralGatePassed(false);
      }
    };

    loadOralGateStatus();
    
    // Suscribirse a eventos de actualización
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log('Estado de la aplicación cambiado a:', nextAppState);
      if (nextAppState === 'active') {
        console.log('Aplicación activa, recargando estado del examen oral...');
        loadOralGateStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Timer para cada pregunta
  useEffect(() => {
    if (examenIniciado && !examenTerminado && !mostrarResultado) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      timerRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            siguientePregunta();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);

      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [preguntaActual, examenIniciado, examenTerminado, mostrarResultado]);

  const iniciarExamen = () => {
    if (!oralGatePassed && !oralMode) {
      Alert.alert(
        'Examen Bloqueado',
        'Debes aprobar primero el examen oral antes de realizar el examen escrito.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    setExamenIniciado(true);
    setTiempoRestante(15);
    setMostrarResultado(false);
    setRespuestaSeleccionada(null);
  };

  const handleTabChange = (tab: 'escrito' | 'oral') => {
    if (tab === 'escrito' && !oralGatePassed) {
      Alert.alert(
        'Examen Bloqueado',
        'Debes aprobar primero el examen oral antes de realizar el examen escrito.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    setOralMode(tab === 'oral');
  };

  const resetExamen = () => {
    setExamenIniciado(false);
    setPreguntaActual(0);
    setRespuestas([]);
    setRespuestasIdx([]);
    setCorrectas([]);
    setPuntuacion(0);
    setTiempoRestante(15);
    setRespuestaSeleccionada(null);
    setMostrarResultado(false);
    progressAnimation.setValue(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const totalPreguntas = preguntas.length;
  const minimoAprobar = Math.ceil(totalPreguntas * 0.75);

  const seleccionarRespuesta = (respuesta: string) => {
    if (respuestaSeleccionada) return;

    const preguntaActualObj = preguntas[preguntaActual];

    // Normalizar tanto la respuesta del usuario como las opciones para comparación
    const normalizarTexto = (texto: string) =>
      (texto || '').toString().trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');

    const respuestaNormalizada = normalizarTexto(respuesta);

    // Buscar la opción que coincida con la respuesta
    const idxSeleccionado = preguntaActualObj.opciones.findIndex((opcion: string) =>
      normalizarTexto(opcion) === respuestaNormalizada
    );

    // Verificar si la respuesta es correcta comparando con respuestaCorrecta
    const esCorrecta = normalizarTexto(respuesta) === normalizarTexto(preguntaActualObj.respuestaCorrecta);

    console.log('Respuesta seleccionada:', {
      pregunta: preguntaActualObj.pregunta,
      respuestaSeleccionada: respuesta,
      respuestaCorrecta: preguntaActualObj.respuestaCorrecta,
      esCorrecta,
      idxSeleccionado,
      opciones: preguntaActualObj.opciones
    });

    // Actualizar el estado de respuestas primero
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = respuesta;

    // Luego actualizar el estado de índices y correctas
    const nuevasRespuestasIdx = [...respuestasIdx];
    nuevasRespuestasIdx[preguntaActual] = idxSeleccionado;

    const nuevasCorrectas = [...correctas];
    nuevasCorrectas[preguntaActual] = esCorrecta;

    // Actualizar todos los estados juntos para evitar problemas de sincronización
    setRespuestas(nuevasRespuestas);
    setRespuestasIdx(nuevasRespuestasIdx);
    setCorrectas(nuevasCorrectas);
    setRespuestaSeleccionada(respuesta);
    setMostrarResultado(true);

    // Detener el temporizador
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Pasar a la siguiente pregunta después de un breve retraso
    setTimeout(() => {
      // Usar las respuestas actualizadas directamente
      if (preguntaActual < preguntas.length - 1) {
        const nuevaPregunta = preguntaActual + 1;
        setPreguntaActual(nuevaPregunta);
        setTiempoRestante(15);
        setRespuestaSeleccionada(nuevasRespuestas[nuevaPregunta] || null);
        setMostrarResultado(false);
        progressAnimation.setValue(0);
      } else {
        // Si es la última pregunta, finalizar el examen
        finalizarExamen(nuevasRespuestas);
      }
    }, 1000);
  };

  const siguientePregunta = () => {
    console.warn('siguientePregunta no debería ser llamado directamente');
  };

  const finalizarExamen = async (respuestasFinales: string[]) => {
    setExamenTerminado(true);

    // Función de normalización consistente
    const normalizarTexto = (texto: string) =>
      (texto || '').toString().trim().toLowerCase().normalize('NFC').replace(/\s+/g, ' ');

    // Calcular puntuación
    let puntos = 0;

    // Asegurarse de que tenemos un array con la longitud correcta
    const respuestasParaRevisar = [...respuestasFinales];
    while (respuestasParaRevisar.length < preguntas.length) {
      respuestasParaRevisar.push('');
    }

    console.log('=== REVISIÓN DE RESPUESTAS ===');
    // Contar respuestas correctas
    for (let i = 0; i < preguntas.length; i++) {
      const respuestaUsuario = respuestasParaRevisar[i] || '';
      const respuestaCorrecta = preguntas[i].respuestaCorrecta || '';

      const esCorrecta = normalizarTexto(respuestaUsuario) === normalizarTexto(respuestaCorrecta);

      // Actualizar el estado de respuestas correctas
      setCorrectas(prev => {
        const nuevasCorrectas = [...prev];
        nuevasCorrectas[i] = esCorrecta;
        return nuevasCorrectas;
      });

      console.log(`Pregunta ${i + 1}:`, {
        pregunta: preguntas[i].pregunta,
        respuestaUsuario,
        respuestaCorrecta,
        esCorrecta,
        normalizadaUsuario: normalizarTexto(respuestaUsuario),
        normalizadaCorrecta: normalizarTexto(respuestaCorrecta)
      });

      if (esCorrecta) {
        puntos++;
      }
    }

    console.log('=== RESUMEN DE RESPUESTAS ===');
    console.log('Respuestas guardadas:', respuestas);
    console.log('Respuestas finales pasadas:', respuestasFinales);
    console.log(`=== PUNTUACIÓN FINAL: ${puntos}/${preguntas.length} ===`);

    setPuntuacion(puntos);

    // Verificar si el examen está aprobado
    if (puntos >= minimoAprobar) {
      // Actualizar AsyncStorage con los estados del examen
      await Promise.all([
        AsyncStorage.setItem('A1_examen_aprobado', 'true'),
        AsyncStorage.setItem('A1_final_passed', 'true'),
        AsyncStorage.setItem('A2_desbloqueado', 'true'),
        AsyncStorage.setItem('nivelA2', 'true'),
        AsyncStorage.setItem('aprobadoA1', 'true'),
        AsyncStorage.setItem('A1_exam_attempt', '0'),
        AsyncStorage.setItem('A1_oral_gate_passed', 'true'),
        AsyncStorage.setItem('A1_oral_completed', 'true')
      ]);

      Alert.alert(
        '¡Felicidades! 🎉',
        `Has aprobado el examen con ${puntos}/${preguntas.length} puntos.\n¡Nivel A2 desbloqueado!`,
        [
          {
            text: 'Continuar a A2',
            onPress: () => {
              AsyncStorage.setItem('shouldRefresh', 'true');
              router.replace('/A2_Plataforma');
            },
          },
          {
            text: 'Volver al menú',
            onPress: () => {
              AsyncStorage.setItem('shouldRefresh', 'true');
              router.replace('/SchoolScreen');
            },
            style: 'cancel',
          },
        ]
      );
    } else {
      // Si no aprueba, mostrar mensaje de reintento
      const nextAttempt = ((examAttempt || 0) + 1) % 3;
      setExamAttempt(nextAttempt);
      await AsyncStorage.setItem('A1_exam_attempt', String(nextAttempt));

      Alert.alert(
        'Examen no aprobado 😔',
        `Has obtenido ${puntos}/${preguntas.length} puntos (necesitas ${minimoAprobar}).\n¡Sigue estudiando y vuelve a intentarlo!`,
        [
          {
            text: 'Reintentar',
            onPress: () => {
              resetExamen();
            },
          },
          {
            text: 'Volver al menú',
            onPress: () => {
              router.replace('/A1_Acceso');
            },
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleStartOralGate = async () => {
    try {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        Alert.alert('Permiso requerido', 'Concede acceso al micrófono para realizar el Examen Oral.');
        return;
      }
      try { await AsyncStorage.setItem('A1_oral_gate_passed', 'false'); } catch {}
      setOralGateIndex(0);
      setOralScores([0,0,0,0,0]);
      setWebPercent(null);
      setWebPromptText(oralGatePrompts[0]);
      setWebMode(true);
      Alert.alert('Examen Oral', 'Se abrió el Examen Oral. Si no ves el modal, recarga la pantalla.');
    } catch (e) {
      Alert.alert('Micrófono', 'No se pudo iniciar el reconocimiento.');
    }
  };

  // Utilidades para comparar frase objetivo vs transcripción (lectura completa)
  const normalizar = (s: string) => (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\dáéíóúüñ\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const compararFrase = (objetivo: string, transcripcion: string) => {
    const obj = normalizar(objetivo);
    const tra = normalizar(transcripcion);
    if (!obj) return 0;
    const objTokens = obj.split(' ').filter(Boolean);
    const traTokens = new Set(tra.split(' ').filter(Boolean));
    if (objTokens.length === 0) return 0;
    let aciertos = 0;
    objTokens.forEach(tok => { if (traTokens.has(tok)) aciertos++; });
    return aciertos / objTokens.length; // 0..1
  };

  const startOralListen = async () => {
    try {
      // Verificar si el módulo Voice está disponible
      if (!Voice) {
        console.error('Voice module is not available');
        throw new Error('El módulo de reconocimiento de voz no está disponible');
      }

      // Verificar permisos del micrófono
      console.log('Requesting microphone permission...');
      const granted = await requestMicrophonePermission();

      if (!granted) {
        console.log('Microphone permission denied');
        Alert.alert(
          'Permiso requerido',
          'La aplicación necesita acceso al micrófono para evaluar tu pronunciación. Por favor, activa los permisos en la configuración del dispositivo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Ir a Configuración', onPress: () => {
              if (Platform.OS === 'ios') {
                Linking.openURL('app-settings:');
              } else {
                Linking.openSettings();
              }
            }}
          ]
        );
        setOralListening(false);
        return;
      }

      console.log('Microphone permission granted, preparing voice recognition...');

      // Limpiar cualquier sesión previa
      try {
        console.log('Cleaning up previous voice recognition session...');
        if (Voice && typeof Voice.stop === 'function') await Voice.stop().catch(e => console.warn('Error stopping previous session:', e));
        if (Voice && typeof Voice.destroy === 'function') await Voice.destroy().catch(e => console.warn('Error destroying previous session:', e));
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn('Error during cleanup (non-fatal):', error);
      }

      // Iniciar reconocimiento de voz
      try {
        console.log('Starting voice recognition...');
        setOralListening(true);

        if (Voice && typeof Voice.start === 'function') {
          console.log('Calling Voice.start("es-ES")...');
          await Voice.start('es-ES');
          console.log('Voice recognition started successfully');
        } else {
          throw new Error('El reconocimiento de voz no está disponible en este dispositivo');
        }
      } catch (startError) {
        console.error('Error starting voice recognition:', startError);
        setOralListening(false);

        let errorMessage = 'No se pudo iniciar el reconocimiento de voz. Por favor, inténtalo de nuevo.';

        if (startError instanceof Error) {
          const errorMsg = startError.message.toLowerCase();
          if (errorMsg.includes('permission') || errorMsg.includes('permiso')) {
            errorMessage = 'Permiso de micrófono denegado. Por favor, activa los permisos en la configuración del dispositivo.';
          } else if (errorMsg.includes('language') || errorMsg.includes('idioma')) {
            errorMessage = 'El paquete de idioma español no está instalado. Por favor, instálalo desde la configuración de idiomas de tu dispositivo.';
          } else if (errorMsg.includes('not available') || errorMsg.includes('no disponible')) {
            errorMessage = 'El reconocimiento de voz no está disponible en este dispositivo.';
          }
        }

        Alert.alert('Error', errorMessage, [{
          text: 'Entendido',
          onPress: () => console.log('User acknowledged voice recognition error')
        }]);
      }
    } catch (e) {
      console.error('Unexpected error in startOralListen:', e);
      setOralListening(false);

      Alert.alert(
        'Error inesperado',
        'Ocurrió un error inesperado al intentar iniciar el reconocimiento de voz. Por favor, inténtalo de nuevo más tarde.',
        [
          {
            text: 'Entendido',
            onPress: () => console.log('User acknowledged unexpected error')
          }
        ]
      );
    }
  };

  const stopOralListen = async () => {
    try {
      await Voice.stop();
    } catch {}
    setOralListening(false);
    const trans = oralTranscripts[oralIdx] || '';
    const pct = Math.round(compararFrase(oralPrompts[oralIdx], trans) * 100);
    setOralScores(prev => {
      const arr = [...prev];
      arr[oralIdx] = pct;
      return arr;
    });
  };

  const handleOralGateNext = async () => {
    const score = typeof webPercent === 'number' ? Math.round(webPercent) : 0;
    setOralScores(prev => { const arr=[...prev]; arr[oralGateIndex]=score; return arr; });
    const filled = oralScores.map((v,i)=> (i===oralGateIndex ? score : v));
    const passedPartial = filled.filter(v => v === 100).length >= 3;
    if (passedPartial) setOralGatePassed(true);
    if (oralGateIndex < oralGatePrompts.length - 1) {
      const next = oralGateIndex + 1; setOralGateIndex(next); setWebPromptText(oralGatePrompts[next]); setWebPercent(null);
    } else {
      const passed = filled.filter(v => v === 100).length >= 3;
      setOralGatePassed(passed);
      try { await AsyncStorage.setItem('A1_oral_gate_passed', passed ? 'true' : 'false'); } catch {}
      setWebMode(false);
      if (passed) Alert.alert('Oral aprobado', 'Has alcanzado 3 de 5 lecturas con 100%. Ya puedes continuar.'); else Alert.alert('Oral no aprobado', 'Necesitas 3 de 5 lecturas al 100%. Puedes intentarlo de nuevo.');
    }
  };

  // Pantalla inicial (estilo A2)
  if (!examenIniciado && !oralMode) {
    return (
      <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.background}>
        <View style={styles.container}>
          <View style={{ position: 'absolute', left: 10, top: 16 }}>
            <TouchableOpacity style={{ backgroundColor: '#fff', borderRadius: 20, padding: 3 }} onPress={() => router.replace('/A1_Acceso')}>
              <Ionicons name="arrow-back" size={28} color="#1976d2" />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: 'center', gap: 16 }}>
            <Ionicons name="school" size={80} color="#fff" />
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>Examen Final A1</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 12, width: '100%' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 6 }}>Instrucciones</Text>
              <Text style={{ color: '#fff' }}>15 segundos por pregunta</Text>
              <Text style={{ color: '#fff' }}>{totalPreguntas} preguntas totales</Text>
              <Text style={{ color: '#fff', marginTop: 6 }}>Para superar: pasar el examen oral (3 de 5 lecturas al 100%) y mínimo 75% en el test.</Text>
              <Text style={{ color: '#fff', marginTop: 6 }}>Estado del examen oral: {oralGatePassed ? 'Aprobado ✅' : 'Pendiente 🔒'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.siguienteBtn, { backgroundColor: oralGatePassed ? '#fff' : 'rgba(255,255,255,0.6)' }]}
              onPress={() => {
                if (!oralGatePassed) {
                  Alert.alert('Examen oral pendiente', 'Primero completa el examen oral (3 de 5 lecturas al 100%).');
                  return;
                }
                setExamenIniciado(true);
              }}
              disabled={!oralGatePassed}
            >
              <Text style={{ color: '#1976d2', fontSize: 18, fontWeight: 'bold' }}>Comenzar Examen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.siguienteBtn, { backgroundColor: '#fff' }]}
              onPress={handleStartOralGate}
            >
              <Text style={{ color: '#1976d2', fontSize: 18, fontWeight: 'bold' }}>Examen Oral (Reconocimiento Web)</Text>
            </TouchableOpacity>
            {webMode && (
              <Modal visible transparent animationType="fade" onRequestClose={() => setWebMode(false)}>
                <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center' }}>
                  <View style={{ backgroundColor:'#fff', borderRadius:12, width:'92%', maxHeight:'86%', overflow:'hidden' }}>
                    <View style={{ padding:12, backgroundColor:'#1976d2' }}>
                      <Text style={{ color:'#fff', fontWeight:'bold', textAlign:'center' }}>Examen Oral A1 (3 de 5 al 100%)</Text>
                    </View>
                    <View style={{ height: 380 }}>
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
                      <Text style={{ textAlign:'center', marginBottom:8 }}>Lecturas aprobadas: {oralScores.filter(s => s === 100).length} / 5</Text>
                      <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                        <TouchableOpacity style={[styles.siguienteBtn, { backgroundColor:'#e0e0e0', flex:1, marginRight:6 }]} onPress={() => {
                          if (oralGateIndex > 0) {
                            const prev = oralGateIndex - 1; setOralGateIndex(prev); setWebPromptText(oralGatePrompts[prev]); setWebPercent(null);
                          }
                        }}>
                          <Text style={{ color:'#333', fontWeight:'bold' }}>Anterior</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.siguienteBtn, { backgroundColor:'#1976d2', flex:1, marginLeft:6 }]} onPress={handleOralGateNext}>
                          <Text style={{ color:'#fff', fontWeight:'bold' }}>{oralGateIndex < oralGatePrompts.length - 1 ? 'Siguiente' : 'Finalizar'}</Text>
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
          </View>
        </View>
      </LinearGradient>
    );
  }

  // UI Modo Oral (estilo A2)
  if (oralMode) {
    const trans = oralTranscripts[oralIdx] || '';
    const parcial = Math.round(compararFrase(oralPrompts[oralIdx], trans) * 100);
    return (
      <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.background}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
          <TouchableOpacity onPress={() => handleTabChange('escrito')}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Oral {oralIdx + 1}/{oralPrompts.length}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={oralListening ? 'mic' : 'mic-off'} size={20} color="#fff" />
            <Text style={{ color: '#fff' }}>{oralListening ? 'Grabando' : 'Listo'}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>{oralPrompts[oralIdx]}</Text>
          {!oralListening ? (
            <TouchableOpacity style={[styles.siguienteBtn, { backgroundColor: '#fff' }]} onPress={startOralListen}>
              <Text style={{ color: '#1976d2', fontWeight: 'bold' }}>Hablar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.siguienteBtn, { backgroundColor: '#fff' }]} onPress={stopOralListen}>
              <Text style={{ color: '#f44336', fontWeight: 'bold' }}>Detener</Text>
            </TouchableOpacity>
          )}
          <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, padding: 12, marginTop: 12 }}>
            <Text style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: 6 }}>Transcripción</Text>
            <Text style={{ color: '#333' }}>{trans || '—'}</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, marginTop: 12 }}>
            <Text style={{ color: '#fff' }}>Coincidencia con la frase: {parcial}%</Text>
            <Text style={{ color: '#fff', marginTop: 4 }}>Lecturas aprobadas al 100%: {oralScores.filter(s => s === 100).length} / 5</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            {oralIdx < oralPrompts.length - 1 ? (
              <TouchableOpacity style={[styles.siguienteBtn, { backgroundColor: '#fff' }]} onPress={() => setOralIdx(oralIdx + 1)}>
                <Text style={{ color: '#1976d2', fontWeight: 'bold' }}>Siguiente</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.siguienteBtn, { backgroundColor: '#fff' }]} onPress={() => {
                // Aprobar si al menos 3 de 5 están al 100%
                const scores = oralScores.map((v, i) => (i === oralIdx ? Math.round(compararFrase(oralPrompts[i], oralTranscripts[i] || '') * 100) : v));
                const aprobadas = scores.filter(v => v === 100).length >= 3;
                setOralScore(aprobadas ? 100 : 0);
                setOralFinished(true);
                setOralScores(scores);
              }}>
                <Text style={{ color: '#1976d2', fontWeight: 'bold' }}>Finalizar</Text>
              </TouchableOpacity>
            )}
          </View>
          {oralFinished && (
            <View style={{ alignItems: 'center', marginTop: 10 }}>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{oralScore === 100 ? 'Oral aprobado' : 'Oral no aprobado'}</Text>
              <Text style={{ color: '#fff', marginTop: 6 }}>{oralScore === 100 ? 'Has completado 3 de 5 lecturas al 100%.' : 'Necesitas 3 de 5 lecturas al 100%.'}</Text>
              {oralScore === 100 ? (
                <TouchableOpacity
                  style={[styles.siguienteBtn, { backgroundColor: '#fff', marginTop: 12 }]}
                  onPress={async () => {
                    try {
                      setOralGatePassed(true);
                      await AsyncStorage.setItem('A1_oral_gate_passed', 'true');
                      Alert.alert('Oral aprobado', 'Ya puedes realizar el test del examen.');
                      setOralMode(false);
                    } catch {}
                  }}
                >
                  <Text style={{ color: '#1976d2', fontWeight: 'bold' }}>Continuar</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.siguienteBtn, { backgroundColor: '#fff', marginTop: 12 }]}
                  onPress={() => {
                    setOralIdx(0);
                    setOralTranscripts({});
                    setOralScores([0,0,0,0,0]);
                    setOralFinished(false);
                  }}
                >
                  <Text style={{ color: '#1976d2', fontWeight: 'bold' }}>Reintentar oral</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    );
  }

  if (examenTerminado) {
    return (
      <LinearGradient
        colors={puntuacion >= minimoAprobar ? ['#4caf50', '#66bb6a'] : ['#f44336', '#ef5350']}
        style={styles.background}
      >
        <View style={styles.resultadoContainer}>
          <Ionicons
            name={puntuacion >= minimoAprobar ? "checkmark-circle" : "close-circle"}
            size={100}
            color="#fff"
          />

          <Text style={styles.resultadoTexto}>
            {puntuacion >= minimoAprobar ? '¡Aprobado!' : 'No aprobado'}
          </Text>

          <Text style={styles.scoreText}>{puntuacion}/{totalPreguntas}</Text>

          <View style={styles.resultButtons}>
            {puntuacion >= minimoAprobar ? (
              <>
                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={() => router.replace('/A2_Plataforma')}
                >
                  <Text style={styles.continueButtonText}>Continuar a A2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => router.replace('/SchoolScreen')}
                >
                  <Text style={styles.menuButtonText}>Menú Principal</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={resetExamen}
                >
                  <Text style={styles.retryButtonText}>Reintentar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => router.replace('/A1_Acceso')}
                >
                  <Text style={styles.menuButtonText}>Volver a A1</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </LinearGradient>
    );
  }

  const pregunta = preguntas[preguntaActual] as Pregunta;
  const idxSeleccionadoActual = pregunta?.opciones?.findIndex((o: string) =>
    (o || '').trim().toLowerCase().normalize('NFC') === (respuestaSeleccionada || '').trim().toLowerCase().normalize('NFC')
  );
  const esRespuestaCorrecta = idxSeleccionadoActual !== undefined && idxSeleccionadoActual === pregunta?.correctaIdx;

  return (
    <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.examHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={resetExamen}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.questionCounter}>
            {preguntaActual + 1}/{totalPreguntas}
          </Text>

          <Text style={styles.questionCounter}>
            Aciertos: {correctas.filter(Boolean).length}/{totalPreguntas}
          </Text>

          <View style={styles.timerContainer}>
            <Ionicons name="time" size={20} color="#fff" />
            <Text style={styles.timerText}>{tiempoRestante}s</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.questionText}>{pregunta.pregunta}</Text>

          <View style={styles.optionsContainer}>
            {pregunta.opciones.map((opcion: string, index: number) => {
              let buttonStyle = styles.optionButton;
              let textStyle = styles.optionText;

              if (mostrarResultado && respuestaSeleccionada) {
                if (index === pregunta.correctaIdx) {
                  buttonStyle = {
                    ...styles.optionButton,
                    ...styles.correctOption,
                  };
                  textStyle = {
                    ...styles.optionText,
                    ...styles.correctOptionText,
                  };
                } else if (index === idxSeleccionadoActual && !esRespuestaCorrecta) {
                  buttonStyle = {
                    ...styles.optionButton,
                    ...styles.incorrectOption,
                  };
                  textStyle = {
                    ...styles.optionText,
                    ...styles.incorrectOptionText,
                  };
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={buttonStyle}
                  onPress={() => seleccionarRespuesta(opcion)}
                  disabled={mostrarResultado}
                >
                  <Text style={textStyle}>{opcion}</Text>
                  {mostrarResultado && index === pregunta.correctaIdx && (
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  )}
                  {mostrarResultado && index === idxSeleccionadoActual && !esRespuestaCorrecta && (
                    <Ionicons name="close-circle" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
  },
  questionCounter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 5,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
  },
  questionContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 15,
  },
  optionButton: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
  correctOption: {
    backgroundColor: 'rgba(0, 200, 0, 0.7)',
  },
  incorrectOption: {
    backgroundColor: 'rgba(200, 0, 0, 0.7)',
  },
  correctOptionText: {
    color: '#fff',
  },
  incorrectOptionText: {
    color: '#fff',
  },
  resultadoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultadoTexto: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  resultButtons: {
    width: '100%',
    gap: 15,
  },
  continueButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
    textAlign: 'center',
  },
  menuButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  siguienteBtn: {
    paddingVertical: 14,
    paddingHorizontal: 38,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});

export { ExamenFinal };
