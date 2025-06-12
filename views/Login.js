// src/screens/Login.js

import React, { useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import axios from 'react-native-axios';
import { useSelector, useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/user.slice';
import Toast from 'react-native-toast-message';
import { API_URL } from '@env';
import { useTranslation } from 'react-i18next';

// Importa el logo como módulo
import logo from '../assets/premierburguer.png';

const Login = ({ navigation }) => {
  const dispatch    = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = useSelector(s => s.user.language);

  useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang);
  }, [currentLang]);

  const [email, setEmail]                 = useState('ramiro.alet@hotmail.com');
  const [password, setPassword]           = useState('123456');
  const [emailError, setEmailError]       = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading]         = useState(false);

  const isValidEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSignIn = async () => {
    setEmailError(false);
    setPasswordError(false);

    if (!email || !isValidEmail(email)) {
      setEmailError(true);
      Toast.show({
        type: 'error',
        text1: t('login.error.invalidEmailTitle'),
        text2: t('login.error.invalidEmailMessage'),
      });
      return;
    }

    if (!password) {
      setPasswordError(true);
      Toast.show({
        type: 'error',
        text1: t('login.error.invalidPasswordTitle'),
        text2: t('login.error.invalidPasswordMessage'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/user/login`, { email, password });
      if (res.status === 200) {
        const { user, token } = res.data;
        dispatch(setUser({ ...user, token }));
        navigation.navigate('HomeTabs');
      } else {
        Toast.show({
          type: 'error',
          text1: t('login.error.loginFailedTitle'),
          text2: t('login.error.loginFailedMessage'),
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: t('login.error.serverErrorTitle'),
        text2: err.response?.data?.error
          ? err.response.data.error
          : t('login.error.serverErrorMessage'),
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
        text1: t('login.error.invalidEmailTitle'),
        text2: t('login.error.invalidEmailMessage'),
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/user/forgot-password`, { email });
      if (res.status === 200) {
        Toast.show({
          type: 'success',
          text1: t('login.success.resetTitle'),
          text2: res.data.message || t('login.success.resetMessage'),
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: t('login.error.serverErrorTitle'),
        text2: err.response?.data?.message || t('login.error.serverErrorMessage'),
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {/* Usa el logo importado */}
              <Image source={logo} style={styles.logoImage} />
            </View>
            <Text style={styles.title}>Burguer</Text>
            <Text style={styles.subtitle}>El sabor que te hace regresar</Text>
          </View>

          {/* CARD */}
          <View style={styles.card}>
            {!showForgotPassword ? (
              <>
                <Text style={styles.cardTitle}>{t('login.cardTitle.signIn')}</Text>

                {/* Email */}
                <View style={styles.inputWrapper}>
                  <View style={[styles.inputContainer, emailError && styles.inputError]}>
                    <TextInput
                      style={styles.input}
                      placeholder={t('login.emailPlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={text => {
                        setEmail(text);
                        setEmailError(false);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {emailError && (
                    <Text style={styles.errorText}>
                      {t('login.error.invalidEmailMessage')}
                    </Text>
                  )}
                </View>

                {/* Password */}
                <View style={styles.inputWrapper}>
                  <View style={[styles.inputContainer, passwordError && styles.inputError]}>
                    <TextInput
                      style={styles.input}
                      placeholder={t('login.passwordPlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={text => {
                        setPassword(text);
                        setPasswordError(false);
                      }}
                      secureTextEntry
                    />
                  </View>
                  {passwordError && (
                    <Text style={styles.errorText}>
                      {t('login.error.invalidPasswordMessage')}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => setShowForgotPassword(true)}
                >
                  <Text style={styles.forgotPasswordText}>
                    {t('login.forgotPasswordText')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleSignIn}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading
                      ? t('login.button.loading')
                      : t('login.button.signIn')}
                  </Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t('login.dividerOr')}</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.signupLink}
                  onPress={() => navigation.navigate('Signup')}
                >
                  <Text style={styles.signupText}>
                    {t('login.noAccountText')}{' '}
                    <Text style={styles.signupTextBold}>
                      {t('login.signUpText')}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>{t('login.cardTitle.reset')}</Text>
                <Text style={styles.resetInfo}>{t('login.resetInfo')}</Text>

                <View style={styles.inputWrapper}>
                  <View style={[styles.inputContainer, emailError && styles.inputError]}>
                    <TextInput
                      style={styles.input}
                      placeholder={t('login.emailPlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={text => {
                        setEmail(text);
                        setEmailError(false);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  {emailError && (
                    <Text style={styles.errorText}>
                      {t('login.error.invalidEmailMessage')}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.button, styles.buttonForgot, isLoading && styles.buttonDisabled]}
                  onPress={handleForgotPasswordRequest}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>
                    {isLoading
                      ? t('login.button.resetLoading')
                      : t('login.button.reset')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backToLogin}
                  onPress={() => setShowForgotPassword(false)}
                >
                  <Text style={styles.backToLoginText}>
                    ← {t('login.backToLogin')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#FFFFFF' },
  content:          { flex: 1 },
  scrollContent:    { flexGrow: 1, justifyContent: 'center', padding: 20 },

  header:           { alignItems: 'center', marginBottom: 30 },
  logoContainer:    { marginBottom: 0, alignItems: 'center' },
  logoImage:        { width: 300, height: 150, resizeMode: 'contain' },  // ← Aumentado

  title:            { fontSize: 28, color: '#D32F2F', fontWeight: 'bold', marginBottom: 4 },
  subtitle:         { fontSize: 16, color: '#6B7280', textAlign: 'center' },

  card:             {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  cardTitle:        {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },

  inputWrapper:     { marginBottom: 16 },
  inputContainer:   {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  inputError:       { borderColor: '#D32F2F' },
  input:            { flex: 1, fontSize: 16, color: '#1F2937' },

  errorText:        { color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 4 },
  forgotPassword:   { alignSelf: 'flex-end', marginBottom: 24, marginTop: 4 },
  forgotPasswordText:{ color: '#D32F2F', fontSize: 14, fontWeight: '500' },

  button:           {
    height: 55,
    borderRadius: 12,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  buttonForgot:     { marginTop: 20 },
  buttonDisabled:   { backgroundColor: '#F87171' },
  buttonText:       { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },

  divider:          { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine:      { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText:      { color: '#6B7280', paddingHorizontal: 10, fontSize: 14 },

  signupLink:       { alignItems: 'center' },
  signupText:       { color: '#6B7280', fontSize: 15 },
  signupTextBold:   { color: '#D32F2F', fontWeight: 'bold' },

  backToLogin:      { marginTop: 20, alignItems: 'center' },
  backToLoginText:  { color: '#D32F2F', fontSize: 14, fontWeight: '500' },
});

export default Login;
