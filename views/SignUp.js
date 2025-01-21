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

  console.log(API_URL, "api url")

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidPassword = (value) => value.length >= 6;

  const validateFields = () => {
    const newErrors = {};

    if (!name) newErrors.name = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!email || !isValidEmail(email)) newErrors.email = 'Valid email is required';
    if (!birthdate) newErrors.birthdate = 'Birthdate is required';
    if (!password || !isValidPassword(password))
      newErrors.password = 'Password must be at least 8 characters long';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateFields()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the highlighted fields.',
      });
      return;
    }
  
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
          text1: 'Account Created',
          text2: 'Your account was created successfully. You can now log in!',
        });
  
        // Navegar a la pantalla de inicio de sesión después de un breve retraso
        setTimeout(() => navigation.navigate('Login'), 2000);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'An error occurred while registering.';
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
      });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="rocket" size={40} color="#4C1D95" />
            </View>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>Create an account to get started</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="First Name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                onBlur={() => setErrors({ ...errors, name: !name ? 'First name is required' : '' })}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Last Name"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
                onBlur={() =>
                  setErrors({ ...errors, lastName: !lastName ? 'Last name is required' : '' })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={() =>
                  setErrors({ ...errors, email: !isValidEmail(email) ? 'Valid email is required' : '' })
                }
              />
            </View>

            <TouchableOpacity
              style={[styles.datePickerContainer, errors.birthdate && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.datePickerText, !birthdate && { color: '#9CA3AF' }]}>
                {birthdate ? birthdate.toISOString().split('T')[0] : 'Select Birthdate'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                mode="date"
                value={birthdate || new Date()}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onBlur={() =>
                  setErrors({
                    ...errors,
                    password: !isValidPassword(password)
                      ? 'Password must be at least 8 characters long'
                      : '',
                  })
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                placeholder="Confirm Password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                onBlur={() =>
                  setErrors({
                    ...errors,
                    confirmPassword: password !== confirmPassword ? 'Passwords do not match' : '',
                  })
                }
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.loginTextBold}>Log in</Text>
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
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E9D8FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, color: '#4C1D95', fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  form: { marginTop: 20 },
  inputContainer: { marginBottom: 20 },
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
  inputError: { borderColor: '#EF4444' },
  datePickerContainer: {
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  datePickerText: { color: '#4B5563', fontSize: 16 },
  button: { height: 50, borderRadius: 12, backgroundColor: '#4C1D95', justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  loginLink: { marginTop: 20, alignItems: 'center' },
  loginText: { color: '#6B7280', fontSize: 14 },
  loginTextBold: { color: '#4C1D95', fontWeight: 'bold' },
});

export default Signup;
