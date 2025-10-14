import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

// Definir los tipos para los ejercicios
type EjercicioRelacionar = {
  tipo: 'relacionar_ingredientes';
  titulo: string;
  instruccion: string;
  pares: Array<{
    id: number;
    ingrediente: string;
    descripcion: string;
  }>;
};

type EjercicioReceta = {
  tipo: 'completar_receta';
  titulo: string;
  instruccion: string;
  receta: {
    titulo: string;
    pasos: Array<{
      paso: number;
      texto: string;
      soluciones: string[];
    }>;
  };
};

type Ejercicio = EjercicioRelacionar | EjercicioReceta;

// Definir el tipo para los países y sus platos
type Plato = {
  nombre: string;
  descripcion: string;
  ingredientes: string[];
  imagen: string;
};

type Pais = {
  id: string;
  nombre: string;
  descripcion: string;
  color: string; // Agregado
  platos: Plato[];
};

const paises: Pais[] = [
  {
    id: 'es',
    nombre: 'España',
    descripcion: 'Cocina mediterránea con influencias de diversas regiones',
    color: '#FF6B35',
    platos: [
      {
        nombre: 'Paella Valenciana',
        descripcion: 'Arroz con mariscos, pollo, conejo y verduras. Se cocina en paellera y se sazona con azafrán.',
        ingredientes: ['arroz', 'azafrán', 'mariscos', 'pollo', 'conejo', 'judías verdes', 'garrofón'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Tortilla Española',
        descripcion: 'Tortilla de huevos con patatas y cebolla. Es uno de los platos más populares de España.',
        ingredientes: ['huevos', 'patatas', 'cebolla', 'aceite de oliva', 'sal'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Gazpacho Andaluz',
        descripcion: 'Sopa fría de tomate, pepino, pimiento y ajo. Perfecta para el verano.',
        ingredientes: ['tomate', 'pepino', 'pimiento', 'ajo', 'aceite de oliva', 'vinagre', 'pan'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Jamón Ibérico',
        descripcion: 'Jamón curado de cerdo ibérico. Se considera uno de los mejores jamones del mundo.',
        ingredientes: ['cerdo ibérico', 'sal', 'tiempo de curación'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Pulpo a la Gallega',
        descripcion: 'Pulpo cocido con patatas, aceite de oliva y pimentón. Típico de Galicia.',
        ingredientes: ['pulpo', 'patatas', 'aceite de oliva', 'pimentón', 'sal'],
        imagen: 'https://via.placeholder.com/150'
      }
    ]
  },
  {
    id: 'mx',
    nombre: 'México',
    descripcion: 'Cocina rica en sabores picantes y especias',
    color: '#00A86B',
    platos: [
      {
        nombre: 'Tacos al Pastor',
        descripcion: 'Tacos de carne de cerdo adobada con piña, cebolla y cilantro.',
        ingredientes: ['carne de cerdo', 'achiote', 'piña', 'cebolla', 'cilantro', 'tortillas'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Mole Poblano',
        descripcion: 'Salsa compleja con chocolate y chiles. Típica de Puebla.',
        ingredientes: ['chocolate', 'chiles', 'especias', 'pollo', 'almendras'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Guacamole',
        descripcion: 'Salsa de aguacate con tomate, cebolla y limón.',
        ingredientes: ['aguacate', 'tomate', 'cebolla', 'limón', 'cilantro', 'sal'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Chiles en Nogada',
        descripcion: 'Chiles rellenos con salsa de nueces. Plato festivo.',
        ingredientes: ['chiles poblanos', 'nueces', 'granada', 'carne picada'],
        imagen: 'https://via.placeholder.com/150'
      }
    ]
  },
  {
    id: 'ar',
    nombre: 'Argentina',
    descripcion: 'Famosa por sus carnes a la parrilla y vinos',
    color: '#87CEEB',
    platos: [
      {
        nombre: 'Asado',
        descripcion: 'Parrillada de diferentes cortes de carne. Evento social importante.',
        ingredientes: ['carne de res', 'sal gruesa', 'carbón o leña', 'chorizo', 'morcilla'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Empanadas',
        descripcion: 'Pasteles rellenos de carne, pollo o verduras.',
        ingredientes: ['masa', 'carne picada', 'cebolla', 'huevo duro', 'aceitunas'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Dulce de Leche',
        descripcion: 'Caramelo de leche condensada. Muy popular en postres.',
        ingredientes: ['leche', 'azúcar', 'bicarbonato', 'vainilla'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Mate',
        descripcion: 'Infusión tradicional de yerba mate. Bebida social.',
        ingredientes: ['yerba mate', 'agua caliente', 'azúcar (opcional)'],
        imagen: 'https://via.placeholder.com/150'
      }
    ]
  },
  {
    id: 'pe',
    nombre: 'Perú',
    descripcion: 'Cocina fusión con influencias indígenas, españolas y asiáticas',
    color: '#FFD700',
    platos: [
      {
        nombre: 'Ceviche',
        descripcion: 'Pescado crudo marinado en limón y ají. Plato nacional.',
        ingredientes: ['pescado blanco', 'limón', 'ají', 'cebolla', 'cilantro'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Lomo Saltado',
        descripcion: 'Carne salteada con cebolla, tomate y papas fritas.',
        ingredientes: ['carne de res', 'cebolla', 'tomate', 'papas', 'ají amarillo'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Pisco Sour',
        descripcion: 'Cóctel nacional con pisco, limón, clara de huevo y amargo de angostura.',
        ingredientes: ['pisco', 'limón', 'clara de huevo', 'azúcar', 'amargo de angostura'],
        imagen: 'https://via.placeholder.com/150'
      }
    ]
  },
  {
    id: 'co',
    nombre: 'Colombia',
    descripcion: 'Cocina diversa con influencias caribeñas y andinas',
    color: '#FF6B6B',
    platos: [
      {
        nombre: 'Bandeja Paisa',
        descripcion: 'Plato completo con arroz, frijoles, carne, plátano y aguacate.',
        ingredientes: ['arroz', 'frijoles', 'carne', 'plátano', 'aguacate', 'huevo'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Arepas',
        descripcion: 'Tortillas de maíz rellenas. Base de la alimentación.',
        ingredientes: ['harina de maíz', 'agua', 'sal', 'queso', 'mantequilla'],
        imagen: 'https://via.placeholder.com/150'
      },
      {
        nombre: 'Ajiaco',
        descripcion: 'Sopa de pollo con tres tipos de papa. Típico de Bogotá.',
        ingredientes: ['pollo', 'papas', 'maíz', 'guascas', 'crema de leche'],
        imagen: 'https://via.placeholder.com/150'
      }
    ]
  }
];

// Crear platosPorPais basado en el array paises
const platosPorPais = paises.reduce((acc, pais) => {
  acc[pais.id] = pais.platos;
  return acc;
}, {} as Record<string, Plato[]>);

// Definir los ejercicios
const ejerciciosIniciales: Ejercicio[] = [
  {
    tipo: 'relacionar_ingredientes',
    titulo: 'Relaciona los ingredientes con sus descripciones',
    instruccion: 'Relaciona cada ingrediente con su descripción correspondiente',
    pares: [
      {
        id: 1,
        ingrediente: 'Aceitunas',
        descripcion: 'Fruto del olivo, muy típico en la dieta mediterránea'
      },
      {
        id: 2,
        ingrediente: 'Pimentón',
        descripcion: 'Condimento hecho de pimientos rojos secos y molidos'
      },
      {
        id: 3,
        ingrediente: 'Azafrán',
        descripcion: 'Especia muy valorada por su color y sabor'
      },
      {
        id: 4,
        ingrediente: 'Chorizo',
        descripcion: 'Embutido curado con pimentón'
      },
      {
        id: 5,
        ingrediente: 'Achiote',
        descripcion: 'Condimento de color rojo usado en la cocina mexicana'
      },
      {
        id: 6,
        ingrediente: 'Yerba Mate',
        descripcion: 'Planta usada para hacer la infusión tradicional argentina'
      }
    ]
  },
  {
    tipo: 'completar_receta',
    titulo: 'Completa la receta de la paella',
    instruccion: 'Completa los espacios en blanco con las palabras correctas',
    receta: {
      titulo: 'Paella Valenciana',
      pasos: [
        {
          paso: 1,
          texto: 'En una paellera, calentar _______ y dorar el pollo y el conejo.',
          soluciones: ['aceite']
        },
        {
          paso: 2,
          texto: 'Añadir las _______ y sofreír hasta que estén tiernas.',
          soluciones: ['verduras']
        },
        {
          paso: 3,
          texto: 'Incorporar el _______ y mezclar bien con los ingredientes.',
          soluciones: ['arroz']
        },
        {
          paso: 4,
          texto: 'Añadir el _______ caliente y cocinar a fuego medio.',
          soluciones: ['caldo']
        },
        {
          paso: 5,
          texto: 'Añadir _______ para dar color y sabor.',
          soluciones: ['azafrán']
        },
        {
          paso: 6,
          texto: 'Dejar reposar _______ minutos antes de servir.',
          soluciones: ['cinco']
        }
      ]
    }
  },
  {
    tipo: 'completar_receta',
    titulo: 'Completa la receta del ceviche',
    instruccion: 'Completa los espacios en blanco con las palabras correctas',
    receta: {
      titulo: 'Ceviche Peruano',
      pasos: [
        {
          paso: 1,
          texto: 'Cortar el _______ en trozos pequeños.',
          soluciones: ['pescado']
        },
        {
          paso: 2,
          texto: 'Marinar con _______ y sal.',
          soluciones: ['limón']
        },
        {
          paso: 3,
          texto: 'Añadir _______ picada y cilantro.',
          soluciones: ['cebolla']
        },
        {
          paso: 4,
          texto: 'Agregar _______ para dar picante.',
          soluciones: ['ají']
        },
        {
          paso: 5,
          texto: 'Servir con _______ y maíz.',
          soluciones: ['camote']
        }
      ]
    }
  }
];

export default function GastronomiaHispana() {
  const router = useRouter();
  const [paisSeleccionado, setPaisSeleccionado] = useState<string>('es');
  const [ejercicioActual, setEjercicioActual] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<Record<number, any>>({});
  const [feedback, setFeedback] = useState<{mensaje: string; esCorrecto: boolean} | null>(null);

  // Obtener el país seleccionado actualmente
  const paisActual = paises.find(p => p.id === paisSeleccionado) || paises[0];

  const handleInput = (idx: number, value: string) => {
    setRespuestas(prev => ({
      ...prev,
      [idx]: value
    }));
  };

  // Function to verify user answers
  const verificarRespuesta = (): void => {
    const ejercicio = ejerciciosIniciales[ejercicioActual];
    if (!ejercicio) return;

    if (ejercicio.tipo === 'relacionar_ingredientes') {
      // Verificar si todas las relaciones son correctas
      const todasCorrectas = ejercicio.pares.every(par => 
        respuestas[par.id] === par.descripcion
      );
      
      setFeedback({
        mensaje: todasCorrectas ? 
          '¡Correcto! Has relacionado bien todos los ingredientes.' : 
          'Algunas relaciones no son correctas. Inténtalo de nuevo.',
        esCorrecto: todasCorrectas
      });
    } else if (ejercicio.tipo === 'completar_receta') {
      const todosCorrectos = ejercicio.receta.pasos.every((paso, i) => {
        const respuesta = respuestas[i] || '';
        return paso.soluciones.some(sol => 
          respuesta.toLowerCase().trim() === sol.toLowerCase()
        );
      });

      setFeedback({
        mensaje: todosCorrectos ? 
          '¡Excelente! Has completado la receta correctamente.' : 
          'Algunas respuestas no son correctas. Revisa los pasos de la receta.',
        esCorrecto: todosCorrectos
      });
    }
  };

  const renderEjercicio = () => {
    if (ejercicioActual >= ejerciciosIniciales.length) return null;

    const ejercicio = ejerciciosIniciales[ejercicioActual];
    if (!ejercicio) return null;

    switch (ejercicio.tipo) {
      case 'relacionar_ingredientes':
        return (
          <View style={styles.ejercicioContainer}>
            <Text style={styles.tituloEjercicio}>{ejercicio.titulo}</Text>
            <Text style={styles.instruccion}>{ejercicio.instruccion}</Text>
            
            <View style={styles.contenedorRelacionar}>
              <View style={styles.columna}>
                <Text style={styles.subtituloColumna}>Ingredientes</Text>
                {ejercicio.pares.map((par) => (
                  <View key={par.id} style={styles.itemRelacionar}>
                    <Text style={styles.textoItem}>{par.ingrediente}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.columna}>
                <Text style={styles.subtituloColumna}>Descripciones</Text>
                {ejercicio.pares.map((par) => (
                  <TouchableOpacity
                    key={par.id}
                    style={[
                      styles.itemRelacionar,
                      respuestas[par.id] === par.descripcion && styles.itemSeleccionado
                    ]}
                    onPress={() => handleInput(par.id, par.descripcion)}
                  >
                    <Text style={styles.textoItem}>{par.descripcion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.botonVerificar}
              onPress={verificarRespuesta}
            >
              <Text style={styles.textoBotonVerificar}>Verificar</Text>
            </TouchableOpacity>
            
            {feedback && (
              <View style={[
                styles.feedback,
                feedback.esCorrecto ? styles.feedbackCorrecto : styles.feedbackIncorrecto
              ]}>
                <Text style={styles.textoFeedback}>{feedback.mensaje}</Text>
              </View>
            )}
          </View>
        );

      case 'completar_receta':
        return (
          <View style={styles.ejercicioContainer}>
            <Text style={styles.tituloReceta}>{ejercicio.receta.titulo}</Text>
            <Text style={styles.instruccion}>{ejercicio.instruccion}</Text>
            
            {ejercicio.receta.pasos.map((paso, index) => {
              const respuesta = respuestas[index] || '';
              const esCorrecto = paso.soluciones.some(sol => 
                respuesta.toLowerCase().trim() === sol.toLowerCase()
              );
              
              return (
                <View key={paso.paso} style={styles.pasoReceta}>
                  <View style={styles.numeroPaso}>
                    <Text style={styles.textoNumeroPaso}>{paso.paso}</Text>
                  </View>
                  <View style={styles.contenidoPaso}>
                    <Text style={styles.textoPaso}>
                      {paso.texto.split('_______').map((parte, i) => 
                        i === 0 ? (
                          <Text key={i}>{parte}</Text>
                        ) : (
                          <Text key={i}>
                            <TextInput
                              style={[
                                styles.inputReceta,
                                respuesta && !esCorrecto && styles.inputIncorrecto
                              ]}
                              value={respuesta}
                              onChangeText={(text) => handleInput(index, text)}
                              placeholder="______"
                            />
                            {parte}
                          </Text>
                        )
                      )}
                    </Text>
                  </View>
                </View>
              );
            })}
            
            <TouchableOpacity
              style={styles.botonVerificar}
              onPress={verificarRespuesta}
            >
              <Text style={styles.textoBotonVerificar}>Verificar</Text>
            </TouchableOpacity>
            
            {feedback && (
              <View style={[
                styles.feedback,
                feedback.esCorrecto ? styles.feedbackCorrecto : styles.feedbackIncorrecto
              ]}>
                <Text style={styles.textoFeedback}>{feedback.mensaje}</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Gastronomía Hispana</Text>
        <Text style={styles.subtitulo}>Nivel B1 - Cultura y Alimentación</Text>
      </View>

      <View style={styles.contenido}>
        <Text style={styles.descripcion}>
          Explora la rica diversidad culinaria del mundo hispanohablante, desde las tapas españolas 
          hasta los sabores picantes de México, pasando por los asados argentinos.
        </Text>

        <View style={styles.seccionPaises}>
          <Text style={styles.tituloSeccion}>Platos por país</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorPaises}
          >
            {paises.map((pais) => (
              <TouchableOpacity
                key={pais.id}
                style={[
                  styles.botonPais,
                  paisSeleccionado === pais.id && {
                    backgroundColor: pais.color,
                    borderColor: pais.color,
                  }
                ]}
                onPress={() => setPaisSeleccionado(pais.id)}
              >
                <Text style={[
                  styles.textoBotonPais,
                  paisSeleccionado === pais.id && styles.textoBotonPaisSeleccionado
                ]}>
                  {pais.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {paisSeleccionado && (
            <View style={styles.listaPlatos}>
              {platosPorPais[paisSeleccionado]?.map((plato, i) => (
                <View key={i} style={styles.platoContainer}>
                  <Text style={styles.nombrePlato}>{plato.nombre}</Text>
                  <Text style={styles.ingredientes}>
                    <Text style={styles.etiqueta}>Ingredientes: </Text>
                    {plato.ingredientes.join(', ')}.
                  </Text>
                  <Text style={styles.descripcionPlato}>{plato.descripcion}</Text>
                  {plato.imagen && (
                    <Image 
                      source={{ uri: plato.imagen }} 
                      style={styles.imagenPlato}
                      resizeMode="cover"
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sección de ejercicios */}
        <View style={styles.seccionEjercicios}>
          <Text style={styles.tituloSeccion}>Ejercicios</Text>
          {renderEjercicio()}
          
          <View style={styles.navegacionEjercicios}>
            <TouchableOpacity
              style={[styles.botonNavegacion, ejercicioActual === 0 && styles.botonDeshabilitado]}
              onPress={() => {
                if (ejercicioActual > 0) {
                  setEjercicioActual(ejercicioActual - 1);
                  setFeedback(null);
                  setRespuestas({});
                }
              }}
              disabled={ejercicioActual === 0}
            >
              <Text style={styles.textoBotonNavegacion}>Anterior</Text>
            </TouchableOpacity>
            
            <Text style={styles.indicadorEjercicio}>
              {ejercicioActual + 1} / {ejerciciosIniciales.length}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.botonNavegacion, 
                ejercicioActual === ejerciciosIniciales.length - 1 && styles.botonDeshabilitado
              ]}
              onPress={() => {
                if (ejercicioActual < ejerciciosIniciales.length - 1) {
                  setEjercicioActual(ejercicioActual + 1);
                  setFeedback(null);
                  setRespuestas({});
                }
              }}
              disabled={ejercicioActual === ejerciciosIniciales.length - 1}
            >
              <Text style={styles.textoBotonNavegacion}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenido educativo adicional */}
        <View style={styles.seccionContenido}>
          <Text style={styles.tituloSeccion}>Cultura gastronómica hispana</Text>
          
          <View style={styles.subseccion}>
            <Text style={styles.subtituloSeccion}>Influencias históricas</Text>
            <Text style={styles.textoContenido}>
              La gastronomía hispana es el resultado de siglos de influencias culturales:
              {"\n\n"}
              • <Text style={styles.textoDestacado}>Árabe:</Text> Introdujo el azafrán, las almendras, el arroz y las especias
              {"\n"}
              • <Text style={styles.textoDestacado}>Romana:</Text> Trajo el aceite de oliva, el vino y técnicas de conservación
              {"\n"}
              • <Text style={styles.textoDestacado}>Indígena americana:</Text> Contribuyó con el maíz, la papa, el tomate y el chocolate
              {"\n"}
              • <Text style={styles.textoDestacado}>Africana:</Text> Añadió sabores y técnicas de cocción
            </Text>
          </View>

          <View style={styles.subseccion}>
            <Text style={styles.subtituloSeccion}>Técnicas culinarias</Text>
            <Text style={styles.textoContenido}>
              • <Text style={styles.textoDestacado}>Sofreír:</Text> Cocinar a fuego lento con aceite
              {"\n"}
              • <Text style={styles.textoDestacado}>Guisar:</Text> Cocinar en líquido a fuego bajo
              {"\n"}
              • <Text style={styles.textoDestacado}>Asar:</Text> Cocinar con calor seco
              {"\n"}
              • <Text style={styles.textoDestacado}>Marinar:</Text> Conservar en líquido ácido
              {"\n"}
              • <Text style={styles.textoDestacado}>Curar:</Text> Conservar con sal y tiempo
            </Text>
          </View>

          <View style={styles.subseccion}>
            <Text style={styles.subtituloSeccion}>Ingredientes fundamentales</Text>
            <Text style={styles.textoContenido}>
              • <Text style={styles.textoDestacado}>Aceite de oliva:</Text> Base de la cocina mediterránea
              {"\n"}
              • <Text style={styles.textoDestacado}>Ajo:</Text> Aromatizante esencial
              {"\n"}
              • <Text style={styles.textoDestacado}>Cebolla:</Text> Base de muchos sofritos
              {"\n"}
              • <Text style={styles.textoDestacado}>Tomate:</Text> Ingrediente versátil
              {"\n"}
              • <Text style={styles.textoDestacado}>Especias:</Text> Azafrán, pimentón, comino
            </Text>
          </View>

          <View style={styles.subseccion}>
            <Text style={styles.subtituloSeccion}>Consejos para cocinar</Text>
            <Text style={styles.textoContenido}>
              • Usa ingredientes frescos y de temporada
              {"\n"}
              • Respeta los tiempos de cocción
              {"\n"}
              • Prueba y ajusta la sal al final
              {"\n"}
              • No tengas miedo de experimentar
              {"\n"}
              • Cocina con paciencia y amor
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  titulo: TextStyle;
  subtitulo: TextStyle;
  contenido: ViewStyle;
  descripcion: TextStyle;
  seccionPaises: ViewStyle;
  tituloSeccion: TextStyle;
  selectorPaises: ViewStyle;
  botonPais: ViewStyle;
  textoBotonPais: TextStyle;
  textoBotonPaisSeleccionado: TextStyle;
  listaPlatos: ViewStyle;
  platoContainer: ViewStyle;
  nombrePlato: TextStyle;
  ingredientes: TextStyle;
  etiqueta: TextStyle;
  descripcionPlato: TextStyle;
  imagenPlato: ImageStyle;
  seccionEjercicios: ViewStyle;
  ejercicioContainer: ViewStyle;
  tituloEjercicio: TextStyle;
  tituloReceta: TextStyle;
  instruccion: TextStyle;
  contenedorRelacionar: ViewStyle;
  columna: ViewStyle;
  subtituloColumna: TextStyle;
  itemRelacionar: ViewStyle;
  itemSeleccionado: ViewStyle;
  textoItem: TextStyle;
  pasoReceta: ViewStyle;
  numeroPaso: ViewStyle;
  textoNumeroPaso: TextStyle;
  contenidoPaso: ViewStyle;
  textoPaso: TextStyle;
  inputReceta: TextStyle;
  inputIncorrecto: TextStyle;
  botonVerificar: ViewStyle;
  textoBotonVerificar: TextStyle;
  feedback: ViewStyle;
  feedbackCorrecto: ViewStyle;
  feedbackIncorrecto: ViewStyle;
  textoFeedback: TextStyle;
  navegacionEjercicios: ViewStyle;
  botonNavegacion: ViewStyle;
  botonDeshabilitado: ViewStyle;
  textoBotonNavegacion: TextStyle;
  indicadorEjercicio: TextStyle;
  seccionContenido: ViewStyle;
  subseccion: ViewStyle;
  subtituloSeccion: TextStyle;
  textoContenido: TextStyle;
  textoDestacado: TextStyle;
}

// Estilos simplificados y corregidos
const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#4a90e2',
    padding: 20,
    paddingTop: 70,
    paddingBottom: 30,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: 16,
    color: '#e3f2fd',
    textAlign: 'center',
  },
  contenido: {
    padding: 20,
    paddingBottom: 40,
  },
  descripcion: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  seccionPaises: {
    marginBottom: 30,
  },
  tituloSeccion: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  selectorPaises: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  botonPais: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f9fa',
  },
  textoBotonPais: {
    color: '#333',
  },
  textoBotonPaisSeleccionado: {
    color: '#fff',
  },
  listaPlatos: {
    marginTop: 15,
  },
  platoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  nombrePlato: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  ingredientes: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  etiqueta: {
    fontWeight: 'bold',
    color: '#333',
  },
  descripcionPlato: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  imagenPlato: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 10,
  },
  seccionEjercicios: {
    marginTop: 20,
  },
  ejercicioContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  tituloEjercicio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  tituloReceta: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingBottom: 10,
  },
  instruccion: {
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    lineHeight: 20,
  },
  contenedorRelacionar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  columna: {
    width: '48%',
  },
  subtituloColumna: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90e2',
    marginBottom: 10,
    textAlign: 'center',
  },
  itemRelacionar: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  itemSeleccionado: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4a90e2',
  },
  textoItem: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  pasoReceta: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4a90e2',
  },
  numeroPaso: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  textoNumeroPaso: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contenidoPaso: {
    flex: 1,
  },
  textoPaso: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  inputReceta: {
    minWidth: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#4a90e2',
    marginHorizontal: 3,
    paddingHorizontal: 3,
    textAlign: 'center',
    color: '#2c3e50',
    fontWeight: '500',
  },
  inputIncorrecto: {
    borderBottomColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  botonVerificar: {
    backgroundColor: '#4a90e2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotonVerificar: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  feedback: {
    marginTop: 10,
    padding: 10,
    borderRadius: 6,
  },
  feedbackCorrecto: {
    backgroundColor: '#e8f5e9',
  },
  feedbackIncorrecto: {
    backgroundColor: '#ffebee',
  },
  textoFeedback: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  navegacionEjercicios: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  botonNavegacion: {
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  botonDeshabilitado: {
    backgroundColor: '#ccc',
  },
  textoBotonNavegacion: {
    color: '#fff',
    fontSize: 14,
  },
  indicadorEjercicio: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  seccionContenido: {
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  subseccion: {
    marginBottom: 20,
  },
  subtituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  textoContenido: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  textoDestacado: {
    fontWeight: 'bold',
    color: '#4a90e2',
  },
});
