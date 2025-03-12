import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'react-native-axios';
import { API_URL } from '@env';

const Signup = ({ navigation }) => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthdate, setBirthdate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidPassword = (value) => value.length >= 6;

  const validateFields = () => {
    const newErrors = {};

    if (!name) newErrors.name = 'El nombre es requerido';
    if (!lastName) newErrors.lastName = 'El apellido es requerido';
    if (!email || !isValidEmail(email)) newErrors.email = 'Email válido es requerido';
    if (!birthdate) newErrors.birthdate = 'La fecha de nacimiento es requerida';
    if (!password || !isValidPassword(password))
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateFields()) {
      Toast.show({
        type: 'error',
        text1: 'Error de validación',
        text2: 'Por favor corrige los campos resaltados.',
      });
      return;
    }
  
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/user/register`, {
        name,
        lastName,
        email,
        password,
        birthdate,
      });
  
      if (response.status === 201) {
        Toast.show({
          type: 'success',
          text1: 'Cuenta Creada',
          text2: '¡Tu cuenta fue creada exitosamente! Ya puedes iniciar sesión.',
        });
  
        // Navegar a la pantalla de inicio de sesión después de un breve retraso
        setTimeout(() => navigation.navigate('Login'), 2000);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Ocurrió un error durante el registro.';
      Toast.show({
        type: 'error',
        text1: 'Registro Fallido',
        text2: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthdate(selectedDate);
      setErrors({...errors, birthdate: ''});
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="hamburger" size={50} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Premier Burguer</Text>
            <Text style={styles.subtitle}>Crea tu cuenta para comenzar</Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Registro</Text>
            
            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, errors.name && styles.inputContainerError]}>
                <Icon name="account-outline" size={20} color="#777777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nombre"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (text) setErrors({...errors, name: ''});
                  }}
                />
              </View>
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, errors.lastName && styles.inputContainerError]}>
                <Icon name="account-outline" size={20} color="#777777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Apellido"
                  placeholderTextColor="#9CA3AF"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (text) setErrors({...errors, lastName: ''});
                  }}
                />
              </View>
              {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, errors.email && styles.inputContainerError]}>
                <Icon name="email-outline" size={20} color="#777777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (isValidEmail(text)) setErrors({...errors, email: ''});
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <TouchableOpacity
                style={[styles.inputContainer, errors.birthdate && styles.inputContainerError]}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon name="calendar-outline" size={20} color="#777777" style={styles.inputIcon} />
                <Text style={[styles.datePickerText, !birthdate && { color: '#9CA3AF' }]}>
                  {birthdate ? formatDate(birthdate) : 'Fecha de nacimiento'}
                </Text>
              </TouchableOpacity>
              {errors.birthdate ? <Text style={styles.errorText}>{errors.birthdate}</Text> : null}
            </View>

            {showDatePicker && (
              <DateTimePicker
                mode="date"
                value={birthdate || new Date()}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, errors.password && styles.inputContainerError]}>
                <Icon name="lock-outline" size={20} color="#777777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (isValidPassword(text)) setErrors({...errors, password: ''});
                  }}
                  secureTextEntry
                />
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, errors.confirmPassword && styles.inputContainerError]}>
                <Icon name="lock-check-outline" size={20} color="#777777" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirmar Contraseña"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (text === password) setErrors({...errors, confirmPassword: ''});
                  }}
                  secureTextEntry
                />
              </View>
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>Creando cuenta...</Text>
              ) : (
                <Text style={styles.buttonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                ¿Ya tienes una cuenta?{' '}
                <Text style={styles.loginTextBold}>Iniciar Sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  content: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingVertical: 30,
    paddingHorizontal: 20
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 30 
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  title: { 
    fontSize: 28, 
    color: '#D32F2F', 
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: { 
    fontSize: 16, 
    color: '#6B7280', 
    textAlign: 'center' 
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginHorizontal: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  inputContainerError: {
    borderColor: '#D32F2F',
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  datePickerText: {
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    height: 55,
    borderRadius: 12,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#F87171',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#6B7280',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    color: '#6B7280',
    fontSize: 15,
  },
  loginTextBold: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
});

export default Signup;