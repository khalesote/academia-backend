import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CursoComercioScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header con botón de regreso */}
      <LinearGradient
        colors={['#9C27B0', '#7B1FA2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/PreFormacionScreen")}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Comercio y Atención</Text>
            <Text style={styles.headerTitleAr}>تجارة وخدمة عملاء</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>📌 ¿Qué aprenderás?</Text>
        <Text style={styles.textBlock}>{`
1. Atención al cliente profesional.
2. Técnicas de venta básicas.
3. Gestión de productos y stock.
4. Uso de cajas registradoras.
5. Comunicación efectiva.`}</Text>
        <Text style={styles.sectionTitle}>📚 Módulos:</Text>
        <Text style={styles.textBlock}>{`- Atención al cliente.
- Técnicas de venta.
- Gestión de productos.
- Cajas registradoras.
- Comunicación.`}</Text>
        <Text style={styles.sectionTitle}>🗣️ Vocabulario útil:</Text>
        <Text style={styles.textBlock}>{`- Cliente – عميل
- Producto – منتج
- Precio – سعر
- Venta – بيع
- Atención – خدمة`}</Text>
        <Text style={styles.sectionTitleAr}>📌 ماذا ستتعلم؟</Text>
        <Text style={styles.textBlockAr}>{`
1. خدمة العملاء المهنية.
2. تقنيات البيع الأساسية.
3. إدارة المنتجات والمخزون.
4. استخدام الصندوق.
5. التواصل الفعال.`}</Text>
        <Text style={styles.sectionTitleAr}>📚 الوحدات:</Text>
        <Text style={styles.textBlockAr}>{`- خدمة العملاء.
- تقنيات البيع.
- إدارة المنتجات.
- الصندوق.
- التواصل.`}</Text>
        <Text style={styles.sectionTitleAr}>🗣️ المفردات المهمة:</Text>
        <Text style={styles.textBlockAr}>{`- عميل – Cliente
- منتج – Producto
- سعر – Precio
- بيع – Venta
- خدمة – Atención`}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerTitleAr: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'right',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
    marginTop: 18,
    marginBottom: 6,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  sectionTitleAr: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
    marginTop: 18,
    marginBottom: 6,
    textAlign: 'right',
    alignSelf: 'flex-end',
    writingDirection: 'rtl',
    fontFamily: 'System',
  },
  textBlock: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    textAlign: 'left',
    alignSelf: 'flex-start',
    lineHeight: 22,
  },
  textBlockAr: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    textAlign: 'right',
    alignSelf: 'flex-end',
    writingDirection: 'rtl',
    fontFamily: 'System',
    lineHeight: 22,
  },
});
