import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'react-native-axios';

// Acciones de Redux
import { setAddresses, setCurrentAddress } from "../redux/slices/user.slice";
import { setPartnerId } from '../redux/slices/partner.slice';
import { setHistoricOrders } from '../redux/slices/order.slice';
import useSocket from '../config/socket';
import { API_URL } from "@env";

const { width } = Dimensions.get('window');
const cardWidth = width * 0.7;

const Dashboard = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // -- Estados locales --
  const [groupedProducts, setGroupedProducts] = useState({});
  const [partner, setPartner] = useState(null);

  // Control de carga general de la pantalla (partner, productos, etc.)
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  // Control de carga específico para "addresses"
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(false);

  // -- Redux: carrito, órdenes históricas, token, user_id
  const cart = useSelector((state) => state.cart.items);
  const historicOrders = useSelector((state) => state.order.historicOrders);
  const token = useSelector((state) => state.user?.userInfo?.token);
  const user_id = useSelector((state) => state.user?.userInfo?.id);
  console.log(historicOrders, "order11s")
  // -- Redux: direcciones --
  const addresses = useSelector((state) => state.user?.addresses);
  const currentAddress = useSelector((state) => state.user?.currentAddress);

  // 1) Al montar: cargar direcciones si es necesario
  useEffect(() => {
    const getAddresses = async () => {
      // Si ya tenemos addresses, no las volvemos a pedir
      if (addresses && addresses.length > 0) {
        // Aseguramos que haya currentAddress
        if (!currentAddress) {
          dispatch(setCurrentAddress(addresses[0]));
        }
        return; // nos salimos
      }

      // Si NO hay direcciones, las pedimos
      setIsFetchingAddresses(true);
      try {
        const response = await axios.get(`${API_URL}/user/getAllAddress/${user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.length === 0) {
          // Si definitivamente no hay direcciones => navigate
          navigation.navigate('FirstAddressScreen');
        } else {
          // Guardamos en Redux
          dispatch(setAddresses(response.data));

          // Si no hay currentAddress, definimos la primera
          if (!currentAddress) {
            dispatch(setCurrentAddress(response.data[0]));
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setIsFetchingAddresses(false);
      }
    };

    getAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Cargar órdenes históricas (solo una vez)
  useEffect(() => {
    const fetchHistoricOrders = async () => {
      try {
        const response = await axios.get(`${API_URL}/order/getAllByUser/${user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        dispatch(setHistoricOrders(response.data));
      } catch (error) {
        console.error('Error fetching historic orders:', error);
      }
    };
    fetchHistoricOrders();
  }, [user_id, token, dispatch]);

  // 3) Cada vez que tengamos (o cambie) currentAddress, pedimos el Partner más cercano
  //    y los productos. Hasta entonces, la pantalla estará "cargando".
  useEffect(() => {
    const getClosestPartnerAndProducts = async () => {
      if (!currentAddress || isFetchingAddresses) return;
  
      setIsScreenLoading(true);
      try {
        // 1) Partner más cercano
        const resp = await axios.post(
          `${API_URL}/partner/closest`,
          {
            address: {
              latitude: currentAddress.lat,
              longitude: currentAddress.lng,
            },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const closestPartner = resp.data.closestPartner;
        setPartner(closestPartner);
        dispatch(setPartnerId(closestPartner.id));
  
        // 2) Productos agrupados por categoría
        const productsResp = await axios.get(
          `${API_URL}/partner/${closestPartner.id}/products`,
          {
            headers: { Authorization: `Bearer ${token}` }, // Token incluido aquí
          }
        );
        setGroupedProducts(productsResp.data.cat || {});
      } catch (error) {
        console.error('Error fetching partner/products:', error);
      } finally {
        setIsScreenLoading(false);
      }
    };
  
    getClosestPartnerAndProducts();
  }, [currentAddress, isFetchingAddresses, dispatch]);
  
  // 4) Cuando la pantalla reciba "focus", si hay que refrescar direcciones, lo hacemos
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const refresh = navigation.getParam?.('refresh', false);
      if (refresh) {
        setIsFetchingAddresses(true);
        try {
          const response = await axios.get(`${API_URL}/user/getAllAddress/${user_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.length === 0) {
            navigation.navigate('FirstAddressScreen');
          } else {
            dispatch(setAddresses(response.data));
            if (!currentAddress) {
              dispatch(setCurrentAddress(response.data[0]));
            }
          }
        } catch (error) {
          console.error('Error fetching addresses on focus:', error);
        } finally {
          setIsFetchingAddresses(false);
        }
      }
    });
    return unsubscribe;
  }, [navigation, user_id, token, dispatch, currentAddress]);



  // 5) Render de carga general, si es que todavía estamos trayendo partner/productos
  //    o si estamos pidiendo direcciones. (Opcional: puedes refinar la lógica)
  if (isScreenLoading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6D28D9" />
        <Text style={styles.loaderText}>Cargando datos...</Text>
      </SafeAreaView>
    );
  }

  // --- Render principal ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="map-marker" size={24} color="#FFFFFF" />
        <TouchableOpacity
          onPress={() => navigation.navigate("Addresses")}
          style={styles.addressContainer}
        >
          <View style={styles.streetLine}>
            <Text
              style={styles.locationText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {currentAddress?.street || 'Seleccionar dirección'}
            </Text>
            <Icon name="chevron-down" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.addressType}>
            {currentAddress?.type || ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('CartScreen')}
        >
          <Icon name="cart-outline" size={24} color="#FFFFFF" />
          {cart.length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Barra de búsqueda */}
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

        {/* Listado de categorías y productos */}
        {Object.keys(groupedProducts).map((categoryName) => (
  <View key={categoryName} style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{categoryName}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.featuredScroll}
    >
      {groupedProducts[categoryName].map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.gridItem}
          onPress={() =>
            navigation
              .getParent()
              .navigate('ProductDetail', {
                product: item,
                isHamburger: categoryName === 'Burgers', // <-- Pass true only for Burgers
              })
          }
        >
          {/* Image */}
          <Image source={{ uri: item.img }} style={styles.itemImage} />

          {/* Dark overlay (optional) */}
          <View style={styles.itemOverlay} />

          {/* Product info (name & price) */}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.price}</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#6D28D9',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  addressContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    maxWidth: '70%',
  },
  streetLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  addressType: {
    fontSize: 12,
    color: '#E5E7EB',
    marginTop: 2,
  },
  cartButton: {
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
  featuredScroll: {},
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
  itemPrice: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default Dashboard;
