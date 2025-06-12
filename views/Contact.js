// views/Support.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export default function Support() {
  const { t, i18n } = useTranslation();
  const currentLang = useSelector(s => s.user.language);

  // Sincronizar i18n con Redux
  useEffect(() => {
    if (currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [currentLang]);

  const [subject, setSubject] = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('general');
  const [errors, setErrors]   = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const categories = [
    { id: 'general',   labelKey: 'support.general' },
    { id: 'order',     labelKey: 'support.order' },
    { id: 'technical', labelKey: 'support.technical' },
    { id: 'billing',   labelKey: 'support.billing' },
  ];

  const validateForm = () => {
    const errs = {};
    if (!subject.trim()) errs.subject = t('support.errorSubjectRequired');
    if (!email.trim()) errs.email = t('support.errorEmailRequired');
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = t('support.errorEmailInvalid');
    if (!message.trim()) errs.message = t('support.errorMessageRequired');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    Keyboard.dismiss();
    setShowConfirm(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    // Reset form
    setSubject('');
    setEmail('');
    setMessage('');
    setCategory('general');
    setErrors({});
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowConfirm(false);
      });
    }, 5000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('support.headerTitle')}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Confirmation */}
          {showConfirm && (
            <Animated.View style={[styles.confirmationContainer, { opacity: fadeAnim }]}>
              <Icon name="check-circle" size={28} color="#10B981" style={styles.confirmationIcon} />
              <View style={styles.confirmationTextContainer}>
                <Text style={styles.confirmationTitle}>{t('support.successTitle')}</Text>
                <Text style={styles.confirmationText}>{t('support.successText')}</Text>
              </View>
            </Animated.View>
          )}

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{t('support.formTitle')}</Text>
            <Text style={styles.formSubtitle}>{t('support.formSubtitle')}</Text>

            {/* Category */}
            <Text style={styles.inputLabel}>{t('support.categoryLabel')}</Text>
            <View style={styles.categoryContainer}>
              {categories.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.categoryOption,
                    category === item.id && styles.categoryOptionActive,
                  ]}
                  onPress={() => setCategory(item.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === item.id && styles.categoryOptionTextActive,
                    ]}
                  >
                    {t(item.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Email */}
            <Text style={styles.inputLabel}>{t('support.emailLabel')}</Text>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <Icon name="email-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('support.emailPlaceholder')}
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Subject */}
            <Text style={styles.inputLabel}>{t('support.subjectLabel')}</Text>
            <View style={[styles.inputContainer, errors.subject && styles.inputError]}>
              <Icon name="format-title" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('support.subjectPlaceholder')}
                placeholderTextColor="#9CA3AF"
                value={subject}
                onChangeText={setSubject}
              />
            </View>
            {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}

            {/* Message */}
            <Text style={styles.inputLabel}>{t('support.messageLabel')}</Text>
            <View style={[styles.messageContainer, errors.message && styles.inputError]}>
              <TextInput
                style={styles.messageInput}
                placeholder={t('support.messagePlaceholder')}
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}

            {/* Submit */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>{t('support.sendButton')}</Text>
              <Icon
                name="send"
                size={18}
                color="#FFFFFF"
                style={styles.submitButtonIcon}
              />
            </TouchableOpacity>

            {/* Additional Info */}
            <View style={styles.additionalInfo}>
              <View style={styles.infoItem}>
                <Icon name="clock-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{t('support.responseTime')}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="shield-check-outline" size={18} color="#6B7280" />
                <Text style={styles.infoText}>{t('support.infoSecure')}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  confirmationContainer: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    elevation: 2,
  },
  confirmationIcon: {
    marginRight: 12,
  },
  confirmationTextContainer: {
    flex: 1,
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 4,
  },
  confirmationText: {
    fontSize: 14,
    color: '#047857',
  },

  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },

  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: -4,
  },
  categoryOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  categoryOptionActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#E53935',
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  categoryOptionTextActive: {
    color: '#E53935',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#111827',
  },
  messageContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    padding: 12,
  },
  messageInput: {
    height: 120,
    fontSize: 15,
    color: '#111827',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },

  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#E53935',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButtonIcon: {
    marginLeft: 8,
  },

  additionalInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
});
