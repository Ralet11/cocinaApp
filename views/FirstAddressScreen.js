import React, { useState, useRef, useMemo } from 'react';
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

const FirstAddressScreen = () => {
  const token = useSelector((state) => state?.user?.userInfo?.token);
  const user_id = useSelector((state) => state?.user?.userInfo?.id);
  const navigation = useNavigation();

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
  const mapRef = useRef(null);

  const googleQuery = useMemo(() => ({
    key: GOOGLE_API_KEY,
    language: 'en',
  }), []);

  const handlePlaceSelect = (data, details) => {
    if (details && details.geometry) {
      const { lat, lng } = details.geometry.location;
      const addressComponents = details.address_components;

      const getComponent = (type) =>
        addressComponents.find((component) => component.types.includes(type))?.long_name || '';

      setMarkerCoords({ latitude: lat, longitude: lng });
      setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 });
      setAddress((prev) => ({
        ...prev,
        street: details.formatted_address || data.description,
        city: getComponent('locality'),
        state: getComponent('administrative_area_level_1'),
        zipCode: getComponent('postal_code') || '',
        country: getComponent('country'),
      }));
      mapRef.current?.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerCoords({ latitude, longitude });
    setRegion((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const handleSaveAddress = async () => {
    const data = {
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
      await axios.post(`${API_URL}/user/addAddress`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Address saved');
      navigation.navigate('HomeTabs', { refresh: true });
    } catch (error) {
      console.error('Error saving address:', error);
      alert('There was a problem saving the address.');
    }
  };

  const AddressTypeButton = ({ type, icon, label }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        address.type === type && styles.typeButtonActive,
      ]}
      onPress={() => setAddress((prev) => ({ ...prev, type }))}
    >
      <Icon name={icon} size={20} color={address.type === type ? '#8B3DFF' : '#666'} />
      <Text style={[styles.typeButtonText, address.type === type && styles.typeButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Your First Address</Text>
            <Text style={styles.headerSubtitle}>An address is required to get started</Text>
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
              placeholder="Address*"
              fetchDetails
              debounce={300}
              query={googleQuery}
              onPress={handlePlaceSelect}
              styles={styles.googleStyles}
              textInputProps={{
                value: address.street,
                onChangeText: (text) => setAddress((prev) => ({ ...prev, street: text })),
              }}
            />

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                value={address.floor}
                onChangeText={(text) => setAddress((prev) => ({ ...prev, floor: text }))}
                placeholder="Floor / Apt (e.g., 3B)"
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                value={address.comments}
                onChangeText={(text) => setAddress((prev) => ({ ...prev, comments: text }))}
                placeholder="Comments (e.g., Doorbell doesn't work, please call)"
                multiline
              />
            </View>

            <View style={styles.typeContainer}>
              <AddressTypeButton type="home" icon="home" label="Home" />
              <AddressTypeButton type="work" icon="briefcase" label="Work" />
              <AddressTypeButton type="other" icon="map-marker" label="Other" />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
              <Text style={styles.saveButtonText}>Save Address</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
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
  map: {
    flex: 1,
    borderRadius: 8,
  },
  form: {
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
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
  typeButtonActive: {
    backgroundColor: '#C7D2FE',
  },
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

export default FirstAddressScreen;

