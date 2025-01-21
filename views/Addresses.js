import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'react-native-axios';
import { API_URL } from '@env';
import { setCurrentAddress } from "../redux/slices/user.slice";

const AddressesView = ({ navigation }) => {
  const dispatch = useDispatch();
  const user_id = useSelector((state) => state.user.userInfo.id);
  const token = useSelector((state) => state.user.userInfo.token);
  const currentAddress = useSelector((state) => state.user.currentAddress); // Dirección seleccionada

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/user/getAllAddress/${user_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAddresses(response.data);
    } catch (error) {
      console.error('Error al obtener las direcciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete(`${API_URL}/user/deleteAddress/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    } catch (error) {
      console.error('Error al eliminar la dirección:', error);
    }
  };

  const handleSelectAddress = (address) => {
    // Guardar todos los datos relevantes de la dirección en Redux
    dispatch(setCurrentAddress(address));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dirección de entrega</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B3DFF" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('SelectNewAddress')}
          >
            <Icon name="plus" size={20} color="#FFF" style={styles.addIcon} />
            <Text style={styles.addButtonText}>Añadir dirección</Text>
          </TouchableOpacity>

          {addresses.length > 0 ? (
            addresses.map((address) => {
              const isSelected = currentAddress?.id === address.id;

              return (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.addressCard,
                    isSelected && styles.selectedAddressCard, // Aplicar estilo si está seleccionada
                  ]}
                  onPress={() => handleSelectAddress(address)}
                  activeOpacity={0.8}
                >
                  <Icon name="map-marker" size={24} color="#666" style={styles.locationIcon} />
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressName}>{address.street}</Text>
                    <Text style={styles.addressDescription}>{address.type || 'Sin tipo'}</Text>
                  </View>

                  {isSelected && (
                    <Icon name="check-circle" size={20} color="#8B3DFF" style={styles.tickIcon} />
                  )}

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAddress(address.id)}
                  >
                    <Icon name="trash-can" size={20} color="#666" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.noAddressesText}>No tienes direcciones guardadas.</Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AddressesView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 16,
  },
  backButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B3DFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedAddressCard: {
    borderWidth: 1,
    borderColor: '#8B3DFF',
  },
  locationIcon: {
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  addressDescription: {
    fontSize: 13,
    color: '#666',
  },
  tickIcon: {
    marginRight: 12,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAddressesText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
