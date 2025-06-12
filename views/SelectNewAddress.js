import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from 'react-native-axios';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { GOOGLE_API_KEY, API_URL } from '@env';

const SelectNewAddress = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const currentLang = useSelector(s => s.user.language);

  // sincronizar idioma
  useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang);
  }, [currentLang]);

  const { addressParam } = route.params || {};
  const token   = useSelector(s => s.user.userInfo.token);
  const user_id = useSelector(s => s.user.userInfo.id);

  const [addressId, setAddressId] = useState(null);
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
    latitude: -34.603722,
    longitude: -58.381592,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerCoords, setMarkerCoords] = useState({
    latitude: -34.603722,
    longitude: -58.381592,
  });

  const googlePlacesRef = useRef();
  const mapRef          = useRef();
  const handled         = useRef(false);

  const googleQuery = useMemo(() => ({
    key: GOOGLE_API_KEY,
    language: currentLang || 'es',
  }), [currentLang]);

  const googleStyles = {
    container: { flex: 0 },
    textInputContainer: {
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      paddingHorizontal: 12,
    },
    textInput: {
      height: 44,
      fontSize: 15,
      backgroundColor: '#f5f5f5',
    },
    listView: {
      backgroundColor: '#fff',
      borderRadius: 8,
      marginTop: 8,
    },
  };

  useEffect(() => {
    if (addressParam && !handled.current) {
      setAddressId(addressParam.id);
      setAddress({
        street: addressParam.street || '',
        floor: addressParam.floor || '',
        comments: addressParam.comments || '',
        type: addressParam.type || 'home',
        city: addressParam.city || '',
        state: addressParam.state || '',
        zipCode: addressParam.zipCode || '',
        country: addressParam.country || '',
      });
      if (addressParam.latitude && addressParam.longitude) {
        setMarkerCoords({
          latitude: addressParam.latitude,
          longitude: addressParam.longitude,
        });
        setRegion({
          latitude: addressParam.latitude,
          longitude: addressParam.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      handled.current = true;
    }
  }, [addressParam]);

  const handlePlaceSelect = (data, details) => {
    if (!details?.geometry) return;
    const { lat, lng } = details.geometry.location;
    const comps = details.address_components;
    const getComp = type =>
      comps.find(c => c.types.includes(type))?.long_name || '';
    const city    = getComp('locality');
    const state   = getComp('administrative_area_level_1');
    const zipCode = getComp('postal_code');
    const country = getComp('country');

    setMarkerCoords({ latitude: lat, longitude: lng });
    setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    setAddress(prev => ({
      ...prev,
      street: details.formatted_address || data.description,
      city, state, zipCode, country,
    }));
    mapRef.current?.animateToRegion(
      { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      1000
    );
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
      if (addressId) {
        await axios.put(`${API_URL}/user/updateAddress/${addressId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/user/addAddress`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigation.goBack();
    } catch (err) {
      console.error('Error saving address:', err);
      alert(t('selectAddress.errorSave'));
    }
  };

  const TypeButton = ({ type, icon, labelKey }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        address.type === type && styles.typeButtonActive,
      ]}
      onPress={() => setAddress(prev => ({ ...prev, type }))}
    >
      <Icon
        name={icon}
        size={24}
        color={address.type === type ? '#D32F2F' : '#666'}
      />
      <Text
        style={[
          styles.typeButtonText,
          address.type === type && styles.typeButtonTextActive,
        ]}
      >
        {t(labelKey)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {addressId
            ? t('selectAddress.headerEdit')
            : t('selectAddress.headerAdd')}
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

      <View style={styles.contentContainer}>
        <View style={styles.searchContainer}>
          <GooglePlacesAutocomplete
            ref={googlePlacesRef}
            placeholder={t('selectAddress.searchPlaceholder')}
            fetchDetails
            minLength={2}
            debounce={300}
            query={googleQuery}
            onPress={handlePlaceSelect}
            styles={googleStyles}
            predefinedPlaces={[]}
            textInputProps={{}}
          />
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('selectAddress.floorLabel')}</Text>
            <TextInput
              style={styles.input}
              value={address.floor}
              onChangeText={text =>
                setAddress(prev => ({ ...prev, floor: text }))
              }
              placeholder={t('selectAddress.floorPlaceholder')}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('selectAddress.commentsLabel')}</Text>
            <TextInput
              style={styles.input}
              value={address.comments}
              onChangeText={text =>
                setAddress(prev => ({ ...prev, comments: text }))
              }
              placeholder={t('selectAddress.commentsPlaceholder')}
              multiline
            />
          </View>

          <View style={styles.typeContainer}>
            <TypeButton type="home" icon="home" labelKey="selectAddress.typeHome" />
            <TypeButton type="work" icon="briefcase" labelKey="selectAddress.typeWork" />
            <TypeButton type="other" icon="map-marker" labelKey="selectAddress.typeOther" />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
            <Text style={styles.saveButtonText}>
              {addressId
                ? t('selectAddress.buttonUpdate')
                : t('selectAddress.buttonSave')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SelectNewAddress;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#D32F2F',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#FFF', marginLeft: 16 },
  backButton: { padding: 4 },

  mapContainer: { height: Dimensions.get('window').height * 0.35 },
  map: { flex: 1 },

  contentContainer: { flex: 1, backgroundColor: '#fff' },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  form: { padding: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 44,
  },

  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  typeButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  typeButtonActive: { backgroundColor: '#F7F2FF' },
  typeButtonText: { marginTop: 4, fontSize: 12, color: '#666' },
  typeButtonTextActive: { color: '#D32F2F' },

  saveButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
