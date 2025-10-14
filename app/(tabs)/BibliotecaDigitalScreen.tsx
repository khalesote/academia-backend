import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const libros = [
  // HISTORIA DE ESPAÑA
  {
    titulo: "Historia de España",
    autor: "Rafael Altamira",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/historia-de-espana-tomo-i/html/",
    historia: true,
  },
  {
    titulo: "Historia general de España",
    autor: "Modesto Lafuente",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/historia-general-de-espana-tomo-i/html/",
    historia: true,
  },
  {
    titulo: "La España del Cid",
    autor: "Ramón Menéndez Pidal",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/la-espana-del-cid/html/",
    historia: true,
  },
  {
    titulo: "La Inquisición española",
    autor: "Juan Antonio Llorente",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/historia-critica-de-la-inquisicion-espanola/html/",
    historia: true,
  },
  {
    titulo: "Historia de la dominación de los árabes en España",
    autor: "José Antonio Conde",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/historia-de-la-dominacion-de-los-arabes-en-espana/html/",
    historia: true,
  },
  // APRENDER ESPAÑOL
  {
    titulo: "Gramática de la lengua castellana",
    autor: "Real Academia Española",
    gratis: true,
    link: "https://www.rae.es/sites/default/files/Gram%C3%A1tica%20de%20la%20lengua%20castellana%20(1771).pdf",
  },
  {
    titulo: "Manual de español para inmigrantes",
    autor: "Ministerio de Educación de España",
    gratis: true,
    link: "https://www.educacionyfp.gob.es/dam/jcr:6a9e0b7b-7c5a-4e8b-9c4f-7e7e0b1e3e6f/manual-espanol-inmigrantes.pdf",
  },
  {
    titulo: "Curso de español para extranjeros (Nivel A1-A2)",
    autor: "Recursos Educativos Abiertos",
    gratis: true,
    link: "https://www.mecd.gob.es/dam/jcr:0b8d6b4e-2e4c-4c7d-8e2d-7a1e4e1d4e2b/curso-espanol-extranjeros-a1-a2.pdf",
  },
  {
    titulo: "Lecturas fáciles en español (PDF)",
    autor: "Colección de textos adaptados",
    gratis: true,
    link: "https://www.cervantes.es/imagenes/File/biblioteca/lecturas_faciles.pdf",
  },
  {
    titulo: "Diccionario español-árabe básico (PDF)",
    autor: "Ministerio de Educación de España",
    gratis: true,
    link: "https://www.educacionyfp.gob.es/dam/jcr:5e3c7b7b-0f3e-4e5d-9a3f-8c7e1e1e1e1e/diccionario-espanol-arabe-basico.pdf",
  },
  {
    titulo: "La revolución española vista por una republicana",
    autor: "Clara Campoamor",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/la-revolucion-espanola-vista-por-una-republicana/html/",
    historia: true,
  },
  // POESÍA Y POETAS
  {
    titulo: "Don Quijote de la Mancha",
    autor: "Miguel de Cervantes",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/don-quijote-de-la-mancha--0/html/",
  },
  {
    titulo: "La casa de Bernarda Alba",
    autor: "Federico García Lorca",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/la-casa-de-bernarda-alba/html/",
  },
  {
    titulo: "Bodas de sangre",
    autor: "Federico García Lorca",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/bodas-de-sangre/html/",
  },
  {
    titulo: "Marianela",
    autor: "Benito Pérez Galdós",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/marianela/html/",
  },
  {
    titulo: "El sí de las niñas",
    autor: "Leandro Fernández de Moratín",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/el-si-de-las-ninas/html/",
  },
  {
    titulo: "La Regenta",
    autor: 'Leopoldo Alas "Clarín"',
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/la-regenta-tomo-i/html/",
  },
  {
    titulo: "El sombrero de tres picos",
    autor: "Pedro Antonio de Alarcón",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/el-sombrero-de-tres-picos/html/",
  },
  {
    titulo: "La vida es sueño",
    autor: "Pedro Calderón de la Barca",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/la-vida-es-sueno/html/",
  },
  {
    titulo: "Fuenteovejuna",
    autor: "Lope de Vega",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/fuenteovejuna/html/",
  },
  {
    titulo: "El lazarillo de Tormes",
    autor: "Anónimo",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/la-vida-de-lazarillo-de-tormes-y-de-sus-fortunas-y-adversidades/html/",
  },
  {
    titulo: "Cantar de mio Cid",
    autor: "Anónimo",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/el-cantar-de-mio-cid/html/",
  },
  {
    titulo: "Poema del Gaucho Martín Fierro",
    autor: "José Hernández",
    gratis: true,
    link: "https://www.gutenberg.org/ebooks/15116",
  },
  {
    titulo: "El matadero",
    autor: "Esteban Echeverría",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/el-matadero/html/",
  },
  {
    titulo: "Fábulas",
    autor: "Félix María Samaniego",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/fabulas/html/",
  },
  {
    titulo: "El libro de buen amor",
    autor: "Juan Ruiz, Arcipreste de Hita",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/el-libro-de-buen-amor/html/",
  },
  {
    titulo: "La Celestina",
    autor: "Fernando de Rojas",
    gratis: true,
    link: "https://www.cervantesvirtual.com/obra-visor/la-celestina/html/",
  },
  // Libros no gratuitos (mantengo algunos para ejemplo)
  {
    titulo: "Cien años de soledad",
    autor: "Gabriel García Márquez",
    gratis: false,
  },
  { titulo: "Rayuela", autor: "Julio Cortázar", gratis: false },
  { titulo: "Pedro Páramo", autor: "Juan Rulfo", gratis: false },
  { titulo: "La sombra del viento", autor: "Carlos Ruiz Zafón", gratis: false },
  {
    titulo: "El amor en los tiempos del cólera",
    autor: "Gabriel García Márquez",
    gratis: false,
  },
  { titulo: "La colmena", autor: "Camilo José Cela", gratis: false },
  { titulo: "Nada", autor: "Carmen Laforet", gratis: false },
  { titulo: "El túnel", autor: "Ernesto Sabato", gratis: false },
];

export default function BibliotecaDigitalScreen() {
  const [soloGratis, setSoloGratis] = useState(false);
  const router = useRouter();

  const librosFiltrados = soloGratis ? libros.filter((l) => l.gratis) : libros;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#7e57c2" />
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Ionicons name="library" size={40} color="#7e57c2" />
        <Text style={styles.title}>Biblioteca Digital</Text>
        <Text style={styles.titleAr}>مكتبة رقمية</Text>
      </View>
      <Text style={styles.subtitle}>Libros y autores destacados de España y mundo hispánico:</Text>

      {/* Personajes españoles */}
      <Text style={[styles.subtitle, { marginTop: 18, fontWeight: "bold", color: "#512da8" }]}>
        Personajes españoles
      </Text>
      <View style={{ marginBottom: 16 }}>
        <View style={styles.personajeItem}>
          <Text style={styles.personajeNombre}>Isabel la Católica</Text>
          <Text style={styles.personajeAr}>إيزابيل الكاثوليكية</Text>
        </View>
        <View style={styles.personajeItem}>
          <Text style={styles.personajeNombre}>Pablo Picasso</Text>
          <Text style={styles.personajeAr}>بابلو بيكاسو</Text>
        </View>
        <View style={styles.personajeItem}>
          <Text style={styles.personajeNombre}>Adolfo Suárez</Text>
          <Text style={styles.personajeAr}>أدولفو سواريث</Text>
        </View>
        <View style={styles.personajeItem}>
          <Text style={styles.personajeNombre}>Severo Ochoa</Text>
          <Text style={styles.personajeAr}>سيفيرو أوتشوا</Text>
        </View>
        <View style={styles.personajeItem}>
          <Text style={styles.personajeNombre}>Federico García Lorca</Text>
          <Text style={styles.personajeAr}>فيديريكو غارسيا لوركا</Text>
        </View>
        <View style={styles.personajeItem}>
          <Text style={styles.personajeNombre}>Clara Campoamor</Text>
          <Text style={styles.personajeAr}>كلارا كامبوامور</Text>
        </View>
        <View style={styles.personajeItem}>
          <Text style={styles.personajeNombre}>Salvador Dalí</Text>
          <Text style={styles.personajeAr}>سلفادور دالي</Text>
        </View>
        <View style={styles.personajeItem}>
          <Text style={styles.personajeNombre}>Francisco Franco</Text>
          <Text style={styles.personajeAr}>فرانسيسكو فرانكو</Text>
        </View>
        <View style={styles.personajeItem}>
          <Text style={styles.personajeNombre}>Santiago Ramón y Cajal</Text>
          <Text style={styles.personajeAr}>سانتياغو رامون إي كاخال</Text>
        </View>
        <View style={styles.personajeItem}>
          <Text style={styles.personajeNombre}>Rosalía de Castro</Text>
          <Text style={styles.personajeAr}>روزاليا دي كاسترو</Text>
        </View>
      </View>

      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <Text
          style={{
            color: "#7e57c2",
            fontWeight: "bold",
            textDecorationLine: "underline",
            marginBottom: 4,
          }}
          onPress={() => setSoloGratis((s) => !s)}
        >
          {soloGratis ? "Mostrar todos los libros" : "Mostrar solo libros gratis"}
        </Text>
      </View>
      {librosFiltrados.map((libro, idx) => (
        <View style={styles.bookItem} key={idx}>
          <Ionicons name="book" size={22} color="#512da8" style={{ marginRight: 8 }} />
          <View>
            <Text style={styles.bookTitle}>{libro.titulo}</Text>
            <Text style={styles.bookAuthor}>{libro.autor}</Text>
            {libro.gratis && libro.link && (
              <Text
                style={{ color: "#1976d2", textDecorationLine: "underline" }}
                onPress={() => (window.open ? window.open(libro.link) : null)}
              >
                Leer gratis
              </Text>
            )}
          </View>
        </View>
      ))}
      {librosFiltrados.length === 0 && (
        <Text style={{ color: "#d32f2f", textAlign: "center", marginTop: 20 }}>
          No hay libros gratuitos en la lista.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  personajeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ede7f6",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  personajeNombre: {
    fontSize: 16,
    color: "#222",
    fontWeight: "bold",
  },
  personajeAr: {
    fontSize: 16,
    color: "#388e3c",
    fontWeight: "bold",
    fontFamily: "System",
    writingDirection: "rtl",
    marginLeft: 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 4,
    marginLeft: 2,
  },
  backButtonText: {
    color: "#7e57c2",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 4,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 18,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#7e57c2",
    marginTop: 6,
    textAlign: "center",
  },
  titleAr: {
    fontSize: 18,
    color: "#512da8",
    fontWeight: "bold",
    fontFamily: "System",
    writingDirection: "rtl",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#444",
    textAlign: "center",
  },
  bookItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede7f6",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
  },
  bookAuthor: {
    fontSize: 15,
    color: "#555",
    fontStyle: "italic",
  },
});
