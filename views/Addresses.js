import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'react-native-axios';
import { API_URL } from '@env';
import { setCurrentAddress } from '../redux/slices/user.slice';
import { useTranslation } from 'react-i18next';

const AddressesView = ({ navigation }) => {
  const dispatch    = useDispatch();
  const { t, i18n } = useTranslation();
  const currentLang = useSelector(s => s.user.language);

  useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang);
  }, [currentLang]);

  const user_id        = useSelector(s => s.user.userInfo.id);
  const token          = useSelector(s => s.user.userInfo.token);
  const currentAddress = useSelector(s => s.user.currentAddress);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/user/getAllAddress/${user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const list = Array.isArray(res.data) ? res.data : [];
      setAddresses(list);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user_id && token) fetchAddresses();
  }, [user_id, token]);

  const handleDeleteAddress = async id => {
    try {
      await axios.delete(`${API_URL}/user/deleteAddress/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(prev =>
        Array.isArray(prev) ? prev.filter(a => a.id !== id) : []
      );
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const handleSelectAddress = address => {
    dispatch(setCurrentAddress(address));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('addresses.headerTitle')}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D32F2F" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('SelectNewAddress')}
          >
            <Icon name="plus" size={20} color="#FFF" style={styles.addIcon}/>
            <Text style={styles.addButtonText}>{t('addresses.addButton')}</Text>
          </TouchableOpacity>

          {Array.isArray(addresses) && addresses.length > 0 ? (
            addresses.map(addr => {
              const isSel = currentAddress?.id === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.addressCard, isSel && styles.selectedAddressCard]}
                  onPress={() => handleSelectAddress(addr)}
                  activeOpacity={0.8}
                >
                  <Icon name="map-marker" size={24} color="#666" style={styles.locationIcon}/>
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressName}>{addr.street}</Text>
                    <Text style={styles.addressDescription}>
                      {addr.type || t('addresses.noType')}
                    </Text>
                  </View>
                  {isSel && <Icon name="check-circle" size={20} color="#D32F2F" style={styles.tickIcon}/>}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAddress(addr.id)}
                  >
                    <Icon name="trash-can" size={20} color="#666"/>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noAddressesText}>{t('addresses.noAddresses')}</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AddressesView;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#D32F2F',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
      android: { elevation: 1 },
    }),
  },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#FFF', marginLeft: 16 },
  backButton: { padding: 4 },
  scrollContent: { padding: 16 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D32F2F', borderRadius: 8, padding: 12, marginBottom: 16 },
  addIcon: { marginRight: 8 },
  addButtonText: { color: '#FFF', fontSize: 15, fontWeight: '500' },
  addressCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, padding: 16, marginBottom: 12 },
  selectedAddressCard: { borderWidth: 1, borderColor: '#D32F2F' },
  locationIcon: { marginRight: 12 },
  addressInfo: { flex: 1 },
  addressName: { fontSize: 15, fontWeight: '500', color: '#000', marginBottom: 2 },
  addressDescription: { fontSize: 13, color: '#666' },
  tickIcon: { marginRight: 12 },
  deleteButton: { padding: 4, marginLeft: 8, zIndex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noAddressesText: { fontSize: 15, color: '#666', textAlign: 'center', marginTop: 20 },
});
