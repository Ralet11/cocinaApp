import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'react-native-axios';
import { useSelector } from 'react-redux';
import { API_URL } from '@env';
import { useTranslation } from 'react-i18next';

const Signup = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const currentLang = useSelector(s => s.user.language);

  useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang);
  }, [currentLang]);

  const [name, setName]                   = useState('');
  const [lastName, setLastName]           = useState('');
  const [email, setEmail]                 = useState('');
  const [birthdate, setBirthdate]         = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors]               = useState({});
  const [isLoading, setIsLoading]         = useState(false);

  const isValidEmail    = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPassword = v => v.length >= 6;

  const validateFields = () => {
    const newErrors = {};
    if (!name)           newErrors.name           = t('signup.error.nameRequired');
    if (!lastName)       newErrors.lastName       = t('signup.error.lastNameRequired');
    if (!email || !isValidEmail(email))
                         newErrors.email          = t('signup.error.emailRequired');
    if (!birthdate)      newErrors.birthdate      = t('signup.error.birthdateRequired');
    if (!password || !isValidPassword(password))
                         newErrors.password       = t('signup.error.passwordInvalid');
    if (password !== confirmPassword)
                         newErrors.confirmPassword = t('signup.error.passwordMismatch');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateFields()) {
      Toast.show({
        type: 'error',
        text1: t('signup.error.validationTitle'),
        text2: t('signup.error.validationMessage'),
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/user/register`, {
        name, lastName, email, password, birthdate
      });
      if (res.status === 201) {
        Toast.show({
          type: 'success',
          text1: t('signup.success.accountCreatedTitle'),
          text2: t('signup.success.accountCreatedMessage'),
        });
        setTimeout(() => navigation.navigate('Login'), 2000);
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: t('signup.error.registrationFailedTitle'),
        text2: err.response?.data?.error
          ? err.response.data.error
          : t('signup.error.registrationFailedMessage'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthdate(selectedDate);
      setErrors(prev => ({ ...prev, birthdate: '' }));
    }
  };

  const formatDate = date => {
    if (!date) return '';
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
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
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="hamburger" size={50} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>{t('signup.headerTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('signup.headerSubtitle')}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('signup.cardTitle')}</Text>

            {/* Nombre */}
            <View style={styles.inputWrapper}>
              <View style={[
                styles.inputContainer,
                errors.name && styles.inputError
              ]}>
                <Icon
                  name="account-outline"
                  size={20}
                  color="#777777"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('signup.namePlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={t => {
                    setName(t);
                    if (t) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                />
              </View>
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Apellido */}
            <View style={styles.inputWrapper}>
              <View style={[
                styles.inputContainer,
                errors.lastName && styles.inputError
              ]}>
                <Icon
                  name="account-outline"
                  size={20}
                  color="#777777"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('signup.lastNamePlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  value={lastName}
                  onChangeText={t => {
                    setLastName(t);
                    if (t) setErrors(prev => ({ ...prev, lastName: ''}));
                  }}
                />
              </View>
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <View style={[
                styles.inputContainer,
                errors.email && styles.inputError
              ]}>
                <Icon
                  name="email-outline"
                  size={20}
                  color="#777777"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('signup.emailPlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={t => {
                    setEmail(t);
                    if (isValidEmail(t)) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Fecha de nacimiento */}
            <View style={styles.inputWrapper}>
              <TouchableOpacity
                style={[
                  styles.inputContainer,
                  errors.birthdate && styles.inputError
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Icon
                  name="calendar-outline"
                  size={20}
                  color="#777777"
                  style={styles.inputIcon}
                />
                <Text style={[
                  styles.input,
                  !birthdate && { color: '#9CA3AF', flex: 1 }
                ]}>
                  {birthdate
                    ? formatDate(birthdate)
                    : t('signup.birthdatePlaceholder')}
                </Text>
              </TouchableOpacity>
              {errors.birthdate && (
                <Text style={styles.errorText}>{errors.birthdate}</Text>
              )}
            </View>

            {showDatePicker && (
              <DateTimePicker
                mode="date"
                value={birthdate || new Date()}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Contraseña */}
            <View style={styles.inputWrapper}>
              <View style={[
                styles.inputContainer,
                errors.password && styles.inputError
              ]}>
                <Icon
                  name="lock-outline"
                  size={20}
                  color="#777777"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('signup.passwordPlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={t => {
                    setPassword(t);
                    if (isValidPassword(t)) setErrors(prev => ({ ...prev, password: ''}));
                  }}
                  secureTextEntry
                />
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirmar contraseña */}
            <View style={styles.inputWrapper}>
              <View style={[
                styles.inputContainer,
                errors.confirmPassword && styles.inputError
              ]}>
                <Icon
                  name="lock-check-outline"
                  size={20}
                  color="#777777"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={t('signup.confirmPasswordPlaceholder')}
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={t => {
                    setConfirmPassword(t);
                    if (t === password) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  secureTextEntry
                />
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Botón crear cuenta */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading
                  ? t('signup.button.loading')
                  : t('signup.button.create')}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('signup.dividerOr')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                {t('signup.alreadyAccountText')}{' '}
                <Text style={styles.loginTextBold}>
                  {t('signup.loginText')}
                </Text>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
  },
  title: { fontSize: 28, color: '#D32F2F', fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputWrapper: { marginBottom: 16 },
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
  inputError: { borderColor: '#D32F2F' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: '#1F2937' },
  errorText: { color: '#D32F2F', fontSize: 12, marginTop: 4, marginLeft: 4 },
  button: {
    height: 55,
    borderRadius: 12,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: '#F87171' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { color: '#6B7280', paddingHorizontal: 10, fontSize: 14 },
  loginLink: { alignItems: 'center' },
  loginText: { color: '#6B7280', fontSize: 15 },
  loginTextBold: { color: '#D32F2F', fontWeight: 'bold' }
});

export default Signup;
