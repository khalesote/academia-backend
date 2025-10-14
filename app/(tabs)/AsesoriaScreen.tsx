import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type AppointmentType = 'presencial' | 'telefonica' | '';

export default function AsesoriaScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    if (!name || !email || !phone || !appointmentType || !date || !time) {
      Alert.alert('Error', 'Por favor complete todos los campos obligatorios\n\nالرجاء ملء جميع الحقول الإلزامية');
      return;
    }
    
    // Here you would typically send this data to your backend
    console.log({
      name,
      email,
      phone,
      appointmentType,
      date,
      time,
      notes
    });

    Alert.alert(
      'Solicitud Enviada / تم إرسال الطلب',
      'Hemos recibido tu solicitud de cita. Nos pondremos en contacto contigo pronto para confirmar los detalles.\n\nلقد تلقينا طلبك. سنتواصل معك قريباً لتأكيد التفاصيل.',
      [
        { text: 'OK / موافق', onPress: () => router.back() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#1976d2" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="people-circle" size={50} color="#1976d2" />
          <Text style={styles.title}>Asesoría de Inmigración</Text>
          <Text style={styles.titleAr}>استشارات الهجرة</Text>
          <Text style={styles.subtitle}>Sesiones personalizadas de asesoramiento</Text>
          <Text style={styles.subtitleAr}>جلسات استشارية مخصصة</Text>
        </View>
      </View>
      <ScrollView style={styles.scrollView}>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nuestros Servicios</Text>
        <Text style={styles.sectionTitleAr}>خدماتنا</Text>
        <View style={styles.serviceCard}>
          <Ionicons name="document-text" size={24} color="#1976d2" />
          <View style={styles.serviceText}>
            <Text style={styles.serviceTitle}>Asesoría en Extranjería</Text>
            <Text style={styles.serviceTitleAr}>استشارات الجوازات والإقامة</Text>
            <Text>Orientación sobre trámites de residencia, nacionalidad, arraigo y más.</Text>
            <Text style={styles.arabicText}>توجيه بخصوص إجراءات الإقامة والجذور والجنسية والمزيد</Text>
          </View>
        </View>
        
        <View style={styles.serviceCard}>
          <Ionicons name="document-attach" size={24} color="#1976d2" />
          <View style={styles.serviceText}>
            <Text style={styles.serviceTitle}>Revisión de Documentación</Text>
            <Text style={styles.serviceTitleAr}>مراجعة الوثائق</Text>
            <Text>Verificamos que toda tu documentación esté en orden.</Text>
            <Text style={styles.arabicText}>نتأكد من أن جميع وثائقك في حالة جيدة</Text>
          </View>
        </View>
        
        <View style={styles.serviceCard}>
          <Ionicons name="people" size={24} color="#1976d2" />
          <View style={styles.serviceText}>
            <Text style={styles.serviceTitle}>Acompañamiento</Text>
            <Text style={styles.serviceTitleAr}>مرافقة</Text>
            <Text>Te acompañamos en tus citas y trámites oficiales.</Text>
            <Text style={styles.arabicText}>نرافقك في مواعيدك وإجراءاتك الرسمية</Text>
          </View>
        </View>

        <View style={styles.serviceCard}>
          <Ionicons name="briefcase" size={24} color="#1976d2" />
          <View style={styles.serviceText}>
            <Text style={styles.serviceTitle}>Formación y Empleo</Text>
            <Text style={styles.serviceTitleAr}>التدريب والتوظيف</Text>
            <Text>Te ayudamos a formarte y a encontrar un empleo.</Text>
            <Text style={styles.arabicText}>نساعدك في التدريب والعثور على عمل</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Solicitar Cita</Text>
        <Text style={styles.sectionTitleAr}>طلب موعد</Text>
        <Text style={styles.requiredField}>* Campos obligatorios</Text>
        <Text style={styles.requiredFieldAr}>* الحقول الإلزامية</Text>
        
        <Text style={styles.label}>Nombre completo *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre y apellidos / الاسم الكامل"
        />
        
        <Text style={styles.label}>Correo electrónico *</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="tu@email.com / بريدك الإلكتروني"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Text style={styles.label}>Teléfono *</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+34 123 456 789 / رقم الهاتف"
          keyboardType="phone-pad"
        />
        
        <Text style={styles.label}>Tipo de cita *</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={[styles.radioButton, appointmentType === 'presencial' && styles.radioButtonSelected]}
            onPress={() => setAppointmentType('presencial')}
          >
            <Ionicons 
              name={appointmentType === 'presencial' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={appointmentType === 'presencial' ? '#1976d2' : '#666'} 
            />
            <View>
              <Text style={styles.radioText}>Presencial</Text>
              <Text style={styles.radioTextAr}>حضوري</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.radioButton, appointmentType === 'telefonica' && styles.radioButtonSelected]}
            onPress={() => setAppointmentType('telefonica')}
          >
            <Ionicons 
              name={appointmentType === 'telefonica' ? 'radio-button-on' : 'radio-button-off'} 
              size={24} 
              color={appointmentType === 'telefonica' ? '#1976d2' : '#666'} 
            />
            <View>
              <Text style={styles.radioText}>Telefónica</Text>
              <Text style={styles.radioTextAr}>هاتفي</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Fecha *</Text>
            <TextInput
              style={[styles.input, styles.halfInput]}
              value={date}
              onChangeText={setDate}
              placeholder="DD/MM/AAAA / يوم/شهر/سنة"
            />
          </View>
          
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Hora *</Text>
            <TextInput
              style={[styles.input, styles.halfInput]}
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM / ساعة:دقيقة"
            />
          </View>
        </View>
        
        <Text style={styles.label}>Notas adicionales</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Describe brevemente el motivo de tu consulta\n\nصف بإيجاز سبب استشارتك"
          multiline
          numberOfLines={4}
        />
        
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.submitButtonText}>Solicitar Cita</Text>
            <Text style={styles.submitButtonTextAr}>طلب موعد</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Horario de atención: Lunes a Viernes de 9:00 a 18:00</Text>
        <Text style={styles.footerTextAr}>ساعات العمل: من الاثنين إلى الجمعة من 9:00 إلى 18:00</Text>
        <Text style={styles.footerText}>Email: info@academiainmigracion.com</Text>
        <Text style={styles.footerText}>Teléfono: +34 123 456 789</Text>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 10,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 10,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
    textAlign: 'center',
  },
  titleAr: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 4,
    writingDirection: 'rtl',
  },
  subtitle: {
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  subtitleAr: {
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  sectionTitleAr: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  serviceTitleAr: {
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  arabicText: {
    color: '#666',
    textAlign: 'right',
    writingDirection: 'rtl',
    fontSize: 13,
    marginTop: 2,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  serviceText: {
    marginLeft: 15,
    flex: 1,
  },
  serviceTitle: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  requiredField: {
    color: '#f44336',
    fontSize: 12,
    marginBottom: 5,
    fontStyle: 'italic',
  },
  requiredFieldAr: {
    color: '#f44336',
    fontSize: 12,
    marginBottom: 15,
    fontStyle: 'italic',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  label: {
    marginBottom: 5,
    color: '#444',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    padding: 8,
    borderRadius: 4,
  },
  radioButtonSelected: {
    backgroundColor: '#e3f2fd',
  },
  radioText: {
    marginLeft: 8,
  },
  radioTextAr: {
    fontSize: 12,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  buttonTextContainer: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
  },
  halfInput: {
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#f1f1f1',
  },
  footerText: {
    color: '#666',
    marginBottom: 3,
    textAlign: 'center',
  },
  footerTextAr: {
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  submitButtonTextAr: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
