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
  const [email, setEmail] = useState('chulina@gmail.com');
  const [password, setPassword] = useState('123456');
/*   const password = "" */
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const dispatch = useDispatch();

  // Validación de email con regex
  const isValidEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSignIn = async () => {
    // Reiniciar errores
    setEmailError(false);
    setPasswordError(false);

    // Validaciones
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
        text2: 'check your password and try again.',
      });
      return;
    }

    // Datos válidos
    const data = { email, password };

    try {
      // Llamada al backend para autenticar al usuario
      const response = await axios.post(`${API_URL}/user/login`, data);

      if (response.status === 200) {
        const { user, token } = response.data;

        // Guardar el usuario y token en Redux
        dispatch(setUser({ ...user, token }));

        // Navegar a la pantalla principal
        navigation.navigate('HomeTabs');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Invalid credentials. Try again.',
        });
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Authentication failed.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="rocket" size={40} color="#4C1D95" />
          </View>
          <Text style={styles.title}>Hello again!</Text>
          <Text style={styles.subtitle}>Log in to your account to continue</Text>
        </View>

        {/* Formulario */}
        <View> </View>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                emailError && styles.inputError, // Aplicar borde rojo si hay error
              ]}
              placeholder="john@email.com"
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
                passwordError && styles.inputError, // Aplicar borde rojo si hay error
              ]}
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Botón de Olvidar Contraseña */}
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </TouchableOpacity>

          {/* Botón de Iniciar Sesión */}
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          {/* Enlace a la página de registro */}
          <TouchableOpacity
            style={styles.signupLink}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupText}>
              Don't have an account?{' '}
              <Text style={styles.signupTextBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {/* Toast */}
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
    borderColor: '#EF4444', // Borde rojo sutil
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
});

export default Login;
