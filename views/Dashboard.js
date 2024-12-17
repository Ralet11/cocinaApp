import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useSelector, useDispatch } from 'react-redux'; 
import { API_URL } from '@env';
import axios from 'react-native-axios';
import { setUserLocation } from '../redux/slices/user.slice';

const FEATURED_DATA = [
  { id: '1', name: 'Italiana', icon: 'pasta' },
  { id: '2', name: 'Japonesa', icon: 'food-sushi' },
  { id: '3', name: 'Mexicana', icon: 'taco' },
  { id: '4', name: 'Postres', icon: 'cake' },
];

const Dashboard = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [nearbyItems, setNearbyItems] = useState([]);
  const [partner, setPartner] = useState(null);
  const [locationText, setLocationText] = useState('Ubicación Actual');
  const [loading, setLoading] = useState(true);

  // Seleccionamos la dirección (ubicación) del usuario del estado global
  const userAddress = useSelector(state => state.user.address);

  console.log(userAddress)

  const handleProductClick = (item) => {
    navigation.getParent().navigate('ProductDetail', { product: item });
  };

  const fetchData = async (lat, lng) => {
    try {
      // Enviamos lat y lng del usuario y la dirección (ahora es lat/lng) para obtener el partner más cercano
      const closestPartnerResponse = await axios.post(`${API_URL}/closest`, {
        address: userAddress, // { latitude, longitude }
        userLat: lat,
        userLng: lng,
      });
      
      const closestPartnerData = closestPartnerResponse.data;
      setPartner(closestPartnerData);

      // Ahora obtenemos los productos de este partner
      const productsResponse = await axios.get(`${API_URL}/${closestPartnerData.id}/products`);
      const productsData = productsResponse.data;
      setNearbyItems(productsData);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText('Permiso de ubicación denegado');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        const { latitude, longitude } = location.coords;

        // Guardamos la ubicación del usuario en el store de Redux
        dispatch(setUserLocation({ latitude, longitude }));

        setLocationText(`Lat: ${latitude.toFixed(3)}, Lng: ${longitude.toFixed(3)}`);
        fetchData(latitude, longitude);
      } else {
        setLocationText('No se pudo obtener la ubicación');
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4C1D95" />
        <Text style={styles.loaderText}>Cargando datos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="map-marker" size={24} color="#4C1D95" />
          <Text style={styles.locationText}>{locationText}</Text>
          <Icon name="chevron-down" size={24} color="#4C1D95" />
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell-outline" size={24} color="#4C1D95" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar comida o restaurante"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="tune-vertical" size={24} color="#4C1D95" />
          </TouchableOpacity>
        </View>

        {/* Categorías destacadas */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Radar Destacado</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
            {FEATURED_DATA.map((item) => (
              <TouchableOpacity key={item.id} style={styles.featuredItem}>
                <View style={styles.featuredIconContainer}>
                  <Icon name={item.icon} size={32} color="#4C1D95" />
                </View>
                <Text style={styles.featuredText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Más Cercanos */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Más Cercanos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver Todo</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.gridContainer}>
            {nearbyItems.map((item) => (
              <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => handleProductClick(item)}>
                <Image source={{ uri: item.img }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.restaurantName}>{item.partner_name}</Text>
                  <View style={styles.itemFooter}>
                    <View style={styles.ratingContainer}>
                      <Icon name="star" size={16} color="#F59E0B" />
                      <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
                    </View>
                    <View style={styles.timeContainer}>
                      <Icon name="clock-outline" size={16} color="#6B7280" />
                      <Text style={styles.timeText}>{item.time || '20-30 min'}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  loaderText:{
    marginTop:10,
    fontSize:16,
    color:'#4C1D95'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4C1D95',
    marginHorizontal: 8,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#EF4444',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchIcon: {
    position: 'absolute',
    left: 36,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: '#4B5563',
  },
  filterButton: {
    marginLeft: 12,
    width: 50,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4C1D95',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4C1D95',
    fontWeight: '600',
  },
  featuredScroll: {
    marginTop: 16,
  },
  featuredItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  featuredIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E9D8FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  featuredText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default Dashboard;
