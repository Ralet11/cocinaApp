// views/FirstAddressScreen.jsx
import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from 'react-native-axios';
import { useSelector } from 'react-redux';
import { GOOGLE_API_KEY, API_URL } from '@env';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function FirstAddressScreen() {
  const { t, i18n }     = useTranslation();
  const currentLang     = useSelector(s => s.user.language);
  const token           = useSelector(s => s.user.userInfo.token);
  const user_id         = useSelector(s => s.user.userInfo.id);
  const navigation      = useNavigation();

  // sync i18n with Redux language
  useEffect(() => {
    if (currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [currentLang]);

  const [address, setAddress] = useState({
    street: '',
    floor: '',
    comments: '',
    type: 'home',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [region, setRegion] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerCoords, setMarkerCoords] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
  });

  const googlePlacesRef = useRef(null);
  const mapRef          = useRef(null);

  const googleQuery = useMemo(() => ({
    key: GOOGLE_API_KEY,
    language: currentLang || 'en',
  }), [currentLang]);

  const handlePlaceSelect = (data, details) => {
    if (details?.geometry) {
      const { lat, lng } = details.geometry.location;
      const comps = details.address_components;
      const getComp = type =>
        comps.find(c => c.types.includes(type))?.long_name || '';

      setMarkerCoords({ latitude: lat, longitude: lng });
      setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setAddress(prev => ({
        ...prev,
        street: details.formatted_address || data.description,
        city: getComp('locality'),
        state: getComp('administrative_area_level_1'),
        zipCode: getComp('postal_code') || '',
        country: getComp('country'),
      }));
      mapRef.current?.animateToRegion(
        { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        1000
      );
    }
  };

  const handleMapPress = e => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerCoords({ latitude, longitude });
    setRegion(prev => ({ ...prev, latitude, longitude }));
  };

  const handleSaveAddress = async () => {
    const payload = {
      user_id,
      street: address.street,
      floor: address.floor,
      comments: address.comments,
      type: address.type,
      latitude: markerCoords.latitude,
      longitude: markerCoords.longitude,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    };
    try {
      await axios.post(`${API_URL}/user/addAddress`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigation.navigate('HomeTabs', { refresh: true });
    } catch (err) {
      console.error('Error saving address:', err);
      alert(t('firstAddress.errorSaving'));
    }
  };

  const AddressTypeButton = ({ type, icon, labelKey }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        address.type === type && styles.typeButtonActive,
      ]}
      onPress={() => setAddress(prev => ({ ...prev, type }))}
    >
      <Icon name={icon} size={20} color={address.type === type ? '#8B3DFF' : '#666'} />
      <Text style={[
        styles.typeButtonText,
        address.type === type && styles.typeButtonTextActive,
      ]}>
        {t(labelKey)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t('firstAddress.headerTitle')}
            </Text>
            <Text style={styles.headerSubtitle}>
              {t('firstAddress.headerSubtitle')}
            </Text>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              region={region}
              onPress={handleMapPress}
            >
              <Marker coordinate={markerCoords} />
            </MapView>
          </View>

          <View style={styles.form}>
            <GooglePlacesAutocomplete
              ref={googlePlacesRef}
              placeholder={t('firstAddress.placeholder')}
              fetchDetails
              debounce={300}
              query={googleQuery}
              onPress={handlePlaceSelect}
              styles={styles.googleStyles}
              textInputProps={{
                value: address.street,
                onChangeText: text =>
                  setAddress(prev => ({ ...prev, street: text })),
              }}
            />

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                value={address.floor}
                onChangeText={text => setAddress(prev => ({ ...prev, floor: text }))}
                placeholder={t('firstAddress.floorPlaceholder')}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                value={address.comments}
                onChangeText={text => setAddress(prev => ({ ...prev, comments: text }))}
                placeholder={t('firstAddress.commentsPlaceholder')}
                multiline
              />
            </View>

            <View style={styles.typeContainer}>
              <AddressTypeButton type="home"   icon="home"      labelKey="firstAddress.home" />
              <AddressTypeButton type="work"   icon="briefcase" labelKey="firstAddress.work" />
              <AddressTypeButton type="other"  icon="map-marker" labelKey="firstAddress.other" />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
              <Text style={styles.saveButtonText}>
                {t('firstAddress.saveButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.3,
    marginBottom: 12,
  },
  map: { flex: 1, borderRadius: 8 },
  form: { paddingHorizontal: 16 },
  inputGroup: { marginBottom: 12 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  typeButtonActive: { backgroundColor: '#C7D2FE' },
  typeButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4B5563',
  },
  typeButtonTextActive: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  googleStyles: {
    container: { flex: 0, marginBottom: 12 },
    textInputContainer: {
      backgroundColor: '#F3F4F6',
      borderRadius: 8,
    },
    textInput: {
      height: 40,
      fontSize: 14,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: 8,
      paddingHorizontal: 12,
      color: '#1F2937',
    },
    listView: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      marginTop: 8,
      borderColor: '#D1D5DB',
      borderWidth: 1,
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      zIndex: 1000,
    },
  },
});
