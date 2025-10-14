import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Alert, Share, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
const data = require('../../../assets/unidades_y_examenes.json');
import Voice from '@react-native-voice/voice';
import { WebView } from 'react-native-webview';
import { requestMicrophonePermission } from '../../../../utils/requestMicrophonePermission';

// Las preguntas para A2 se construirán dinámicamente desde assets/unidades_y_examenes.json (2 por unidad)

function shuffle<T>(array: T[]): T[] {
  let arr = [...array];
  let currentIndex = arr.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }
  return arr;
}

const TIEMPO_POR_PREGUNTA = 20;

interface Question {
  type: 'choice';
  question: string;
  options?: string[];
  answer?: number;
  color?: string[];
  icon?: string;
}

const ExamenScreen = () => {
  const router = useRouter();
  // Examen siempre accesible (sin guard de unidades completadas)
  const [sourceQuestions, setSourceQuestions] = useState<Question[]>([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(15);
  const [started, setStarted] = useState<boolean>(false);
  // ORAL
  const [oralMode, setOralMode] = useState(false);
  const [oralIdx, setOralIdx] = useState(0);
  const [oralTranscripts, setOralTranscripts] = useState<Record<number, string>>({});
  const [oralListening, setOralListening] = useState(false);
  const [oralFinished, setOralFinished] = useState(false);
  const [oralScore, setOralScore] = useState(0);
  const [oralScores, setOralScores] = useState<number[]>([0,0,0,0,0]);
  const [oralGatePassed, setOralGatePassed] = useState(false);
  // WebView oral gate (como A1)
  const [webMode, setWebMode] = useState(false);
  const [oralGateIndex, setOralGateIndex] = useState(0);
  const [webPromptText, setWebPromptText] = useState('');
  const [webPercent, setWebPercent] = useState<number | null>(null);
  const oralIdxRef = useRef(oralIdx);
  useEffect(() => { oralIdxRef.current = oralIdx; }, [oralIdx]);
  const rotation = useRef(new Animated.Value(0)).current;
  const [testPassed, setTestPassed] = useState(false);
  const [oralApproved, setOralApproved] = useState(false);

  // Animación del reloj
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, [rotation]);

  const correct = shuffledQuestions.filter((q, idx) => q.type === 'choice' && answers[idx] === q.answer).length;

  // Efecto para manejar el temporizador y la lógica de aprobación
  useEffect(() => {
    if (!started || showResult) return;
    
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          next();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    // Verificar si se aprobó el examen
    const checkExamPassed = async () => {
      if (showResult && correct >= 16 && oralGatePassed) {
        try {
          await AsyncStorage.setItem('aprobadoA2', 'true');
          await AsyncStorage.setItem('nivelA2', 'true');
          
          // Navegar automáticamente al diploma
          router.replace({
            pathname: '/DiplomaGeneradoScreen',
            params: { nivel: 'A2' }
          });
        } catch (error) {
          console.error('Error al guardar datos del examen:', error);
          Alert.alert('Error', 'No se pudo guardar el progreso del examen. Por favor, inténtalo de nuevo.');
        }
      }
    };

    checkExamPassed();
    
    return () => clearInterval(interval);
  }, [showResult, correct, oralGatePassed, router]);

  useEffect(() => {
    // Construir banco de preguntas: 2 por unidad disponibles
    try {
      const unidades = (data?.A2?.unidades || []) as any[];
      const recopiladas: Question[] = [];
      const seen = new Set<string>();
      const norm = (s: string) => (s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const cleanQuestion = (s: string) => {
        if (!s) return '';
        let t = String(s);
        // Eliminar caracteres árabes
        t = t.replace(/[\u0600-\u06FF]+/g, '');
        // Eliminar paréntesis vacíos resultantes
        t = t.replace(/\(\s*\)/g, '');
        // Colapsar espacios y limpiar espacios antes de puntuación
        t = t.replace(/\s{2,}/g, ' ').replace(/\s+([\?\.!:,;])/g, '$1').trim();
        return t;
      };
      unidades.forEach((u: any) => {
        const ejercicios = (u?.ejercicios || []).filter((e: any) => e?.tipo === 'opcion_multiple');
        ejercicios.slice(0, 2).forEach((e: any) => {
          const opciones = Array.isArray(e?.opciones) ? e.opciones : [];
          const idx = opciones.findIndex((o: string) => (o || '').trim().toLowerCase().normalize('NFC') === (e?.respuesta_correcta || '').trim().toLowerCase().normalize('NFC'));
          const rawQuestion = e?.pregunta || e?.enunciado || 'Pregunta';
          const questionText = cleanQuestion(rawQuestion);
          const key = norm(questionText || rawQuestion);
          if (key && !seen.has(key)) {
            seen.add(key);
            recopiladas.push({
              type: 'choice',
              question: questionText,
              options: opciones,
              answer: idx >= 0 ? idx : 0,
              color: ['#1976d2', '#64b5f6'],
              icon: 'help-circle'
            });
          }
        });
      });
      const base = recopiladas.length > 0 ? recopiladas : [];
      setSourceQuestions(base);
      const barajadas = base.map((q) => {
        if (q.type === 'choice' && Array.isArray(q.options) && typeof q.answer === 'number') {
          const optionsBarajadas = shuffle(q.options);
          const idxCorrecta = optionsBarajadas.indexOf(q.options[q.answer]);
          return { ...q, options: optionsBarajadas, answer: idxCorrecta };
        }
        return { ...q };
      });
      setShuffledQuestions(shuffle(barajadas));
      setAnswers(Array(base.length).fill(null));
      setCurrent(0);
      setShowResult(false);
    } catch (err) {
      console.error('Error cargando preguntas A2:', err);
      setSourceQuestions([]);
      setShuffledQuestions([]);
      setAnswers([]);
    }
  }, []);

  // Cargar estado del gate oral
  useEffect(() => {
    (async () => {
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('🔍 TODAS las claves en AsyncStorage:', allKeys);

        const gate = await AsyncStorage.getItem('A2_oral_gate_passed');
        const aprobadoA2 = await AsyncStorage.getItem('aprobadoA2');
        const nivelA2 = await AsyncStorage.getItem('nivelA2');

        console.log('🔍 Estado del examen oral cargado:', {
          oralGate: gate,
          aprobadoA2: aprobadoA2,
          nivelA2: nivelA2,
          oralGatePassed: gate === 'true'
        });

        setOralGatePassed(gate === 'true');

        // Si hay datos residuales que indican examen completado, mostrar warning
        if (aprobadoA2 === 'true' || nivelA2 === 'true') {
          console.warn('⚠️  DATOS RESIDUALES DETECTADOS - Examen aparece como completado');
          Alert.alert(
            'Datos Residuales Detectados',
            'Se encontraron datos antiguos del examen. Usa el botón "Limpiar Datos Residuales" para comenzar desde cero.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error cargando estado del examen oral:', error);
      }
    })();
  }, []);

  // ORAL: listeners de voz (registrar una sola vez)
  useEffect(() => {
    let isMounted = true;
    
    // Verificar si el módulo Voice está disponible
    if (!Voice) {
      console.error('Voice module is not available');
      return () => {}; // Retornar función de limpieza vacía
    }

    // Función segura para verificar disponibilidad
    const checkVoiceAvailability = async () => {
      try {
        // Verificar si el módulo Voice tiene el método isAvailable
        if (Voice && typeof Voice.isAvailable === 'function') {
          try {
            return await Voice.isAvailable();
          } catch (error) {
            console.warn('Error checking Voice.isAvailable():', error);
            return false;
          }
        }
        return false;
      } catch (error) {
        console.error('Error in checkVoiceAvailability:', error);
        return false;
      }
    };

    // Inicializar el módulo Voice
    const initVoice = async () => {
      if (!isMounted || !Voice) return;
      
      try {
        console.log('Initializing voice recognition...');
        
        // Configurar manejadores de eventos primero
        Voice.onSpeechStart = () => console.log('onSpeechStart');
        Voice.onSpeechEnd = () => console.log('onSpeechEnd');
        Voice.onSpeechError = (e: any) => {
          console.warn('onSpeechError:', e);
          if (isMounted) setOralListening(false);
        };
        
        Voice.onSpeechResults = (e: any) => {
          if (!isMounted) return;
          const text = Array.isArray(e.value) ? e.value.join(' ') : String(e.value || '');
          const idx = oralIdxRef.current;
          console.log('Speech result:', text);
          setOralTranscripts(prev => ({ ...prev, [idx]: text }));
        };

        // Verificar disponibilidad
        const isAvailable = await checkVoiceAvailability();
        console.log('Voice recognition available:', isAvailable);
        
        if (!isAvailable) {
          console.warn('Voice recognition is not available on this device');
          return;
        }

        console.log('Voice recognition initialized successfully');
      } catch (error) {
        console.error('Error initializing voice recognition:', error);
      }
    };

    // Inicializar con un pequeño retraso para asegurar que el componente esté montado
    const initTimer = setTimeout(() => {
      initVoice().catch(error => {
        console.error('Error in initVoice:', error);
      });
    }, 300);

    // Limpieza al desmontar
    return () => {
      isMounted = false;
      clearTimeout(initTimer);
      
      const cleanup = async () => {
        if (!Voice) return;
        
        try {
          try { 
            await Voice.stop(); 
            console.log('Voice recognition stopped');
          } catch (e) { 
            console.warn('Error stopping voice recognition:', e); 
          }
          
          try { 
            await Voice.destroy(); 
            console.log('Voice recognition destroyed');
          } catch (e) { 
            console.warn('Error destroying voice recognition:', e); 
          }
          
          try { 
            Voice.removeAllListeners(); 
            console.log('Voice recognition listeners removed');
          } catch (e) { 
            console.warn('Error removing voice recognition listeners:', e); 
          }
        } catch (error) {
          console.warn('Error in Voice cleanup:', error);
        }
      };
      
      cleanup().catch(error => {
        console.error('Error during cleanup:', error);
      });
    };
  }, []);

  const handleSelect = (idx: number) => {
    const nuevas = [...answers];
    nuevas[current] = idx;
    setAnswers(nuevas);
  };

  // Eliminado soporte de respuestas de texto; solo opción múltiple

  const next = () => {
    if (current < shuffledQuestions.length - 1) {
      setCurrent(current + 1);
    } else if (!showResult) {
      setShowResult(true);
    }
  };
  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const resetExam = () => {
    const barajadas = sourceQuestions.map((q) => {
      if (q.type === 'choice' && Array.isArray(q.options) && typeof q.answer === 'number') {
        const optionsBarajadas = shuffle(q.options || []);
        const idxCorrecta = optionsBarajadas.indexOf((q.options || [])[q.answer]);
        return { ...q, options: optionsBarajadas, answer: idxCorrecta };
      }
      return { ...q };
    });
    setShuffledQuestions(shuffle(barajadas));
    setAnswers(Array(sourceQuestions.length).fill(null));
    setCurrent(0);
    setShowResult(false);
    setStarted(false);
  };

  const resetCompleteExam = async () => {
    try {
      // Limpiar TODOS los estados relacionados con el examen - MÁS AGRESIVO
      const allKeys = await AsyncStorage.getAllKeys();
      const examKeys = allKeys.filter(key =>
        key.includes('A2') ||
        key.includes('aprobado') ||
        key.includes('nivel') ||
        key.includes('oral') ||
        key.includes('examen') ||
        key.includes('gate') ||
        key.includes('passed') ||
        key.includes('finished') ||
        key.includes('nombreParticipante') ||
        key.includes('apellidoParticipante') ||
        key.includes('documentoParticipante')
      );

      if (examKeys.length > 0) {
        await AsyncStorage.multiRemove(examKeys);
        console.log('Datos de examen eliminados:', examKeys);
      }

      // Resetear todos los estados locales
      setOralGatePassed(false);
      setStarted(false);
      setShowResult(false);
      setOralMode(false);
      setOralFinished(false);
      setOralScore(0);
      setOralScores([0,0,0,0,0]);
      setOralTranscripts({});
      setOralIdx(0);
      setCurrent(0);
      setAnswers([]);
      setTestPassed(false);
      setOralApproved(false);

      Alert.alert(
        'Examen Reiniciado Completamente',
        'Todos los datos del examen han sido eliminados. Puedes comenzar de nuevo desde cero.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error reiniciando examen:', error);
      Alert.alert('Error', 'No se pudo reiniciar el examen completamente.');
    }
  };

  const compartirResultado = async () => {
    try {
      await Share.share({
        message: `¡He aprobado el examen de nivel A2 con ${correct} de ${shuffledQuestions.length} respuestas correctas!`,
        title: 'Resultado del Examen A2',
      });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  // Enunciados orales (A2)
  const oralPrompts = [
    'Hola, me llamo Ana y vivo en Madrid.',
    'Para llegar al centro de salud, siga todo recto y gire a la derecha.',
    'Ayer compré pan y leche en el supermercado.',
    'Trabajo de lunes a viernes en una oficina cerca de mi casa.',
    'El fin de semana me gusta pasear por el parque con mi familia.'
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

  const handleStartOralGate = async () => {
    try {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        Alert.alert('Permiso requerido', 'Concede acceso al micrófono para realizar el Examen Oral.');
        return;
      }
      try { await AsyncStorage.setItem('A2_oral_gate_passed', 'false'); } catch {}
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
      try { await AsyncStorage.setItem('A2_oral_gate_passed', passed ? 'true' : 'false'); } catch {}
      setWebMode(false);
      if (passed) Alert.alert('Oral aprobado', 'Has alcanzado 3 de 5 lecturas con 100%. Ya puedes continuar.'); else Alert.alert('Oral no aprobado', 'Necesitas 3 de 5 lecturas al 100%. Puedes intentarlo de nuevo.');
    }
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
              // Abrir configuración de la app
              if (Platform.OS === 'ios') {
                // @ts-ignore
                Linking.openURL('app-settings:');
              } else {
                // @ts-ignore
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
        await new Promise(resolve => setTimeout(resolve, 500)); // Pausa más larga para asegurar limpieza
      } catch (error) {
        console.warn('Error during cleanup (non-fatal):', error);
      }

      // Iniciar reconocimiento de voz
      try {
        console.log('Starting voice recognition...');
        setOralListening(true);
        
        // Verificar si el método start existe
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
        
        // Determinar el mensaje de error apropiado
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
    // Al detener, calcular porcentaje y almacenarlo (0..100)
    const trans = oralTranscripts[oralIdx] || '';
    const pct = Math.round(compararFrase(oralPrompts[oralIdx], trans) * 100);
    setOralScores(prev => {
      const arr = [...prev];
      arr[oralIdx] = pct;
      return arr;
    });
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

  // Bienvenida estilo A1
  if (!started && !oralMode) {
    return (
      <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.background}>
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={64}>
          <View style={{ position: 'absolute', left: 10, top: 16 }}>
            <TouchableOpacity style={{ backgroundColor: '#fff', borderRadius: 20, padding: 3 }} onPress={() => router.replace('/A2_Plataforma')}>
              <Ionicons name="arrow-back" size={28} color="#1976d2" />
            </TouchableOpacity>
          </View>
          <View style={{ alignItems: 'center', gap: 16 }}>
            <Ionicons name="school" size={80} color="#fff" />
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#fff' }}>Examen Final A2</Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 16, borderRadius: 12, width: '100%' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 6 }}>Instrucciones</Text>
              <Text style={{ color: '#fff' }}>15 segundos por pregunta</Text>
              <Text style={{ color: '#fff' }}>{sourceQuestions.length} preguntas totales (2 por unidad)</Text>
              <Text style={{ color: '#fff', marginTop: 6 }}>Para superar: pasar el examen oral (3 de 5 lecturas al 100%) y mínimo 16/20 en el test.</Text>
              <Text style={{ color: '#fff', marginTop: 6 }}>Estado del examen oral: {oralGatePassed ? 'Aprobado ✅' : 'Pendiente 🔒'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.siguienteBtn, { backgroundColor: oralGatePassed ? '#fff' : 'rgba(255,255,255,0.6)' }]}
              onPress={() => {
                if (!oralGatePassed) {
                  Alert.alert('Examen oral pendiente', 'Primero completa el examen oral (3 de 5 lecturas al 100%).');
                  return;
                }
                setStarted(true);
              }}
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
                      <Text style={{ color:'#fff', fontWeight:'bold', textAlign:'center' }}>Examen Oral A2 (3 de 5 al 100%)</Text>
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
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }

  // UI Modo Oral (estilo A1)
  if (oralMode) {
    const trans = oralTranscripts[oralIdx] || '';
    const parcial = Math.round(compararFrase(oralPrompts[oralIdx], trans) * 100);
    return (
      <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.background}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
          <TouchableOpacity onPress={() => setOralMode(false)}>
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
                      setOralApproved(true);
                      setOralGatePassed(true);
                      await AsyncStorage.setItem('A2_oral_gate_passed', 'true');
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

  return (
    <LinearGradient colors={['#1976d2', '#42a5f5']} style={styles.background}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={64}
      >
        {!showResult && started && shuffledQuestions[current] ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Animated.View style={{ transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }], marginRight: 8 }}>
                <Ionicons name="time-outline" size={28} color="#fff" />
              </Animated.View>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff' }}>{timer}s</Text>
            </View>
            <Text style={styles.indicadorPregunta}>Pregunta {current + 1} de {shuffledQuestions.length}</Text>
            <Text style={styles.pregunta}>{shuffledQuestions[current].question}</Text>
            {Array.isArray(shuffledQuestions[current]?.options) && shuffledQuestions[current].options.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.opcion,
                  answers[current] === idx &&
                    (idx === shuffledQuestions[current].answer
                      ? styles.correcta
                      : styles.incorrecta),
                ]}
                onPress={() => handleSelect(idx)}
                disabled={answers[current] != null}
              >
                <Text style={styles.opcionTexto}>{option}</Text>
              </TouchableOpacity>
            ))}
            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <TouchableOpacity
                style={[
                  styles.siguienteBtn,
                  { backgroundColor: answers[current] == null ? '#bdbdbd' : '#212121' }
                ]}
                onPress={next}
                disabled={answers[current] == null}
              >
                <Text style={{ color: answers[current] == null ? '#757575' : '#fff', fontSize: 18, fontWeight: 'bold' }}>Siguiente</Text>
              </TouchableOpacity>
            </View>
        </>
      ) : (
        <View style={styles.resultadoContainer}>
          <Ionicons
            name={correct >= 16 ? 'trophy' : 'checkmark-circle'}
            size={80}
            color={correct >= 16 ? 'gold' : 'green'}
            style={{ marginBottom: 20 }}
          />
          <Text style={styles.resultadoTexto}>
            Has respondido correctamente {correct} de {shuffledQuestions.length} preguntas.
          </Text>
          {(correct >= 16 && oralGatePassed) && (
            <View style={{ alignItems: 'center', width: '100%' }}>
              <TouchableOpacity
                style={[styles.compartirBtn, { backgroundColor: '#1976D2', marginBottom: 15 }]}
                onPress={async () => {
                  try {
                    await AsyncStorage.setItem('aprobadoA2', 'true');
                    await AsyncStorage.setItem('nivelA2', 'true');
                    Alert.alert(
                      '¡Enhorabuena!', 
                      'Has superado el examen A2.',
                      [
                        { 
                          text: 'Ver Diploma', 
                          onPress: async () => {
                            try {
                              // Obtener datos del usuario
                              const nombre = await AsyncStorage.getItem('nombreParticipante') || '';
                              const apellido1 = await AsyncStorage.getItem('apellido1Participante') || '';
                              const apellido2 = await AsyncStorage.getItem('apellido2Participante') || '';
                              const apellidoLegacy = await AsyncStorage.getItem('apellidoParticipante') || '';
                              const documento = await AsyncStorage.getItem('documentoParticipante') || '';

                              const nombreCompleto = `${nombre} ${apellido1 || apellidoLegacy} ${apellido2}`.trim();

                              // Guardar datos del examen + usuario
                              await AsyncStorage.multiSet([
                                ['aprobadoA2', 'true'],
                                ['nivelA2', 'true'],
                                ['nombreParticipante', nombre],
                                ['apellido1Participante', apellido1 || apellidoLegacy],
                                ['apellido2Participante', apellido2],
                                ['documentoParticipante', documento],
                              ]);

                              console.log('=== NAVEGACIÓN DIPLOMA DEBUG ===');
                              console.log('Datos del usuario desde AsyncStorage:', {
                                nombre,
                                apellido1: apellido1 || apellidoLegacy,
                                apellido2,
                                documento
                              });

                              // ✅ SOLUCIÓN CORRECTA: Solo pasar el nivel, datos ya están en AsyncStorage
                              router.replace(`/DiplomaScreen?nivel=A2`);
                              console.log('=== FIN NAVEGACIÓN DIPLOMA DEBUG ===');
                            } catch (error) {
                              console.error('Error al preparar diploma:', error);

                              // Navegación de respaldo: también solo nivel
                              router.replace(`/DiplomaScreen?nivel=A2`);
                            }
                          }
                        }
                      ]
                    );
                  } catch (error) {
                    console.error('Error al guardar datos del examen:', error);
                  }
                }}
              >
                <Ionicons name="school" size={22} color="#fff" style={{ marginRight: 10 }} />
                <Text style={[styles.compartirBtnTexto, { fontSize: 16 }]}>Obtener diploma A2</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={styles.botonReiniciar} onPress={resetExam}>
            <Text style={styles.botonReiniciarTexto}>Reintentar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botonReiniciar, { backgroundColor: '#f44336', marginTop: 10 }]}
            onPress={resetCompleteExam}
          >
            <Text style={[styles.botonReiniciarTexto, { color: '#fff' }]}>Reiniciar Todo</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  </LinearGradient>
);
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  pregunta: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  opcion: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  opcionTexto: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
  correcta: {
    backgroundColor: 'rgba(0, 200, 0, 0.7)',
  },
  incorrecta: {
    backgroundColor: 'rgba(200, 0, 0, 0.7)',
  },
  textInput: {
    backgroundColor: '#fffde7',
    borderRadius: 10,
    padding: 12,
    fontSize: 17,
    marginBottom: 16,
    color: '#333',
    borderColor: '#ffe082',
    borderWidth: 2,
    textAlign: 'center',
  },
  resultadoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultadoTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 20,
    textAlign: 'center',
  },
  botonReiniciar: {
    backgroundColor: '#fffde7',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 18,
  },
  botonReiniciarTexto: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  indicadorPregunta: {
    fontSize: 18,
    color: '#757575',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  diplomaBtn: {
    backgroundColor: '#212121',
    paddingVertical: 16,
    paddingHorizontal: 38,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  diplomaBtnTexto: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
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
  compartirBtn: {
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compartirBtnTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default ExamenScreen;

