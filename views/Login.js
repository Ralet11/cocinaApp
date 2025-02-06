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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'react-native-axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/user.slice';
import Toast from 'react-native-toast-message';
import { API_URL } from '@env';

const Login = ({ navigation }) => {
  // Estado para el login
  const [email, setEmail] = useState('ramiro.alet@hotmail.com');
  const [password, setPassword] = useState('123123');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  // Estado que controla si estamos en modo "Forgot Password"
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const dispatch = useDispatch();

  const isValidEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSignIn = async () => {
    setEmailError(false);
    setPasswordError(false);

    if (!email || !isValidEmail(email)) {
      setEmailError(true);
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    }

    if (!password) {
      setPasswordError(true);
      Toast.show({
        type: 'error',
        text1: 'Invalid Password',
        text2: 'Check your password and try again.',
      });
      return;
    }

    const data = { email, password };

    try {
      const response = await axios.post(`${API_URL}/user/login`, data);

      if (response.status === 200) {
        const { user, token } = response.data;
        dispatch(setUser({ ...user, token }));
        navigation.navigate('HomeTabs');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Invalid credentials. Try again.',
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Authentication failed.',
      });
    }
  };

  const handleForgotPasswordRequest = async () => {
    // Validamos el email antes de enviar
    if (!email || !isValidEmail(email)) {
      setEmailError(true);
      Toast.show({
        type: 'error',
        text1: 'Email inválido',
        text2: 'Por favor ingresa un email válido.',
      });
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/user/forgot-password`, { email });
      if (response.status === 200) {
        // Si todo salió bien, mostramos feedback
        Toast.show({
          type: 'success',
          text1: 'Recuperación de contraseña',
          text2: response.data.message || 'Correo de recuperación enviado.',
        });
      }
    } catch (error) {
      console.error('Error during password reset request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'No se pudo enviar el correo.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="rocket" size={40} color="#4C1D95" />
          </View>
          <Text style={styles.title}>¡Hola de nuevo!</Text>
          <Text style={styles.subtitle}>
            {showForgotPassword
              ? 'Recupera tu contraseña'
              : 'Inicia sesión en tu cuenta para continuar'}
          </Text>
        </View>

        {/* Si NO estamos en modo 'Forgot Password', muestra el formulario de login */}
        {!showForgotPassword && (
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  emailError && styles.inputError,
                ]}
                placeholder="Correo electrónico"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  passwordError && styles.inputError,
                ]}
                placeholder="Contraseña"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => setShowForgotPassword(true)}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.signupText}>
                ¿No tienes cuenta?{' '}
                <Text style={styles.signupTextBold}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Si SÍ estamos en modo 'Forgot Password', muestra el formulario para recuperar contraseña */}
        {showForgotPassword && (
          <View style={styles.form}>
            <Text style={styles.resetInfo}>
              Ingresa tu correo electrónico para enviarte un enlace de recuperación.
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  emailError && styles.inputError,
                ]}
                placeholder="Correo electrónico"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { marginBottom: 10 }]}
              onPress={handleForgotPasswordRequest}
            >
              <Text style={styles.buttonText}>Enviar enlace de recuperación</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => setShowForgotPassword(false)}
            >
              <Text style={styles.backToLoginText}>Volver al Login</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E9D8FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    color: '#4C1D95',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#4B5563',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4C1D95',
    fontSize: 14,
  },
  button: {
    height: 50,
    borderRadius: 12,
    backgroundColor: '#4C1D95',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signupTextBold: {
    color: '#4C1D95',
    fontWeight: 'bold',
  },
  resetInfo: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  backToLogin: {
    marginTop: 10,
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#4C1D95',
    fontSize: 14,
  },
});

export default Login;
