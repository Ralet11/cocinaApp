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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useSelector, useDispatch } from 'react-redux';
import { API_URL } from '@env';
import axios from 'react-native-axios';
import { setUserLocation } from '../redux/slices/user.slice';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

const Dashboard = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [groupedProducts, setGroupedProducts] = useState({});
  const [partner, setPartner] = useState(null);
  const [locationText, setLocationText] = useState('Ubicación Actual');
  const [loading, setLoading] = useState(true);

  console.log(groupedProducts, "prod")



  const userAddress = useSelector((state) => state.user.address);

  const handleProductClick = (item) => {
    navigation.getParent().navigate('ProductDetail', { product: item });
  };

  const fetchData = async (lat, lng) => {
    try {
      const closestPartnerResponse = await axios.post(`${API_URL}/partner/closest`, {
        address: userAddress,
      });

      setPartner(closestPartnerResponse.data.closestPartner);

      const productsResponse = await axios.get(
        `${API_URL}/partner/${closestPartnerResponse.data.closestPartner.id}/products`
      );
      const productsData = productsResponse.data;

      setGroupedProducts(productsData.cat || {});
    } catch (error) {
      console.error(error);
      setGroupedProducts({});
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
        <ActivityIndicator size="large" color="#6D28D9" />
        <Text style={styles.loaderText}>Cargando datos...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="map-marker" size={24} color="#FFFFFF" />
          <Text style={styles.locationText}>{locationText}</Text>
          <Icon name="chevron-down" size={24} color="#FFFFFF" />
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Icon name="bell-outline" size={24} color="#FFFFFF" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar comida o restaurante"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="tune-vertical" size={24} color="#6D28D9" />
          </TouchableOpacity>
        </View>

        {Object.keys(groupedProducts).map((categoryName) => (
          <View key={categoryName} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{categoryName}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
              {groupedProducts[categoryName].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.gridItem}
                  onPress={() => handleProductClick(item)}
                >
                  <Image source={{ uri: item.img }} style={styles.itemImage} />
                  <View style={styles.itemOverlay} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.restaurantName}>{partner?.name}</Text>
                    <View style={styles.itemFooter}>
                      <View style={styles.ratingContainer}>
                        <Icon name="star" size={16} color="#F59E0B" />
                        <Text style={styles.ratingText}>{item.rating || '4.5'}</Text>
                      </View>
                      <View style={styles.timeContainer}>
                        <Icon name="clock-outline" size={16} color="#E5E7EB" />
                        <Text style={styles.timeText}>{item.time || '20-30 min'}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6D28D9',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#6D28D9',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  content: {
    flex: 1,
    paddingTop: 20,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: '#4B5563',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  featuredScroll: {
    overflow: 'visible',
  },
  gridItem: {
    width: cardWidth,
    height: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  itemInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 14,
    color: '#E5E7EB',
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
    color: '#FFFFFF',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#E5E7EB',
  },
});

export default Dashboard;

