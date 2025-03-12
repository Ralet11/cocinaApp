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
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'react-native-axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/user.slice';
import Toast from 'react-native-toast-message';
import { API_URL } from '@env';

const { width } = Dimensions.get('window');

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('ramiro.alet@hotmail.com');
  const [password, setPassword] = useState('123456');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        text2: 'Please check your password and try again.',
      });
      return;
    }

    const data = { email, password };
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/user/login`, data);

      if (response.status === 200) {
        const { user, token } = response.data;
        dispatch(setUser({ ...user, token }));
        navigation.navigate('HomeTabs');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: 'Invalid credentials. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.error || 'Authentication failed.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordRequest = async () => {
    if (!email || !isValidEmail(email)) {
      setEmailError(true);
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/user/forgot-password`, { email });
      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Password Recovery',
          text2: response.data.message || 'Recovery email sent.',
        });
      }
    } catch (error) {
      console.error('Error during password reset request:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to send email.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="hamburger" size={50} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Premier Burguer</Text>
          <Text style={styles.subtitle}>
            {showForgotPassword
              ? 'Recover your password'
              : 'The flavor that keeps you coming back'}
          </Text>
        </View>

        <View style={styles.card}>
          {!showForgotPassword ? (
            <>
              <Text style={styles.cardTitle}>Sign In</Text>
              
              <View style={styles.inputWrapper}>
                <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
                  <Icon name="email-outline" size={20} color="#777777" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError(false);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {emailError && <Text style={styles.errorText}>Invalid email</Text>}
              </View>

              <View style={styles.inputWrapper}>
                <View style={[styles.inputContainer, passwordError && styles.inputContainerError]}>
                  <Icon name="lock-outline" size={20} color="#777777" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setPasswordError(false);
                    }}
                    secureTextEntry
                  />
                </View>
                {passwordError && <Text style={styles.errorText}>Password required</Text>}
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => setShowForgotPassword(true)}
              >
                <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.buttonText}>Loading...</Text>
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.signupLink}
                onPress={() => navigation.navigate('Signup')}
              >
                <Text style={styles.signupText}>
                  Don't have an account? <Text style={styles.signupTextBold}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.cardTitle}>Recover Password</Text>
              <Text style={styles.resetInfo}>
                Enter your email to receive a recovery link.
              </Text>
              
              <View style={styles.inputWrapper}>
                <View style={[styles.inputContainer, emailError && styles.inputContainerError]}>
                  <Icon name="email-outline" size={20} color="#777777" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setEmailError(false);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {emailError && <Text style={styles.errorText}>Invalid email</Text>}
              </View>

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled, { marginTop: 20 }]} 
                onPress={handleForgotPasswordRequest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Text style={styles.buttonText}>Sending...</Text>
                ) : (
                  <Text style={styles.buttonText}>Send Link</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.backToLogin} 
                onPress={() => setShowForgotPassword(false)}
              >
                <Icon name="arrow-left" size={16} color="#D32F2F" style={{ marginRight: 5 }} />
                <Text style={styles.backToLoginText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
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
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: 4,
  },
  forgotPasswordText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
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
  signupLink: {
    alignItems: 'center',
  },
  signupText: {
    color: '#6B7280',
    fontSize: 15,
  },
  signupTextBold: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  resetInfo: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  backToLogin: {
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backToLoginText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Login;
