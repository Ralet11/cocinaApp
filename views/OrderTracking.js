import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'react-native-axios';
import socket from '../config/socket'; // Importa el socket configurado
import { updateOrderState } from '../redux/slices/order.slice'; // Acción de Redux
import socketIOClient from "socket.io-client";
import { OrderStatusTracker } from '../components/OrderTracker'; // Componente de tracking
import { API_URL } from '@env';

export default function OrderTrackingScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { orderId } = route.params;


  const orders = useSelector((state) => state.order.activeOrders);
  const order = orders.find((o) => o.id === orderId);

  const [orderProducts, setOrderProducts] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(false);

  console.log(order, "order")

  // Manejar el botón de retroceso para navegar a HomeTabs
  useEffect(() => {
    const backAction = () => {
      navigation.navigate('HomeTabs');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Cargar los productos de la orden al montar el componente
  useEffect(() => {
    const fetchOrderProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/order-products/getByOrder/${orderId}`
        );
        setOrderProducts(response.data);
      } catch (error) {
        console.log('Error fetching order products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderProducts();
  }, [orderId]);

  // Escuchar cambios en el estado de la orden mediante WebSocket
  useEffect(() => {
    const socket = socketIOClient("http://192.168.0.251:3000", {
      transports: ["websocket"],
    });
  
    // Confirmar conexión
    socket.on("connect", () => {
      console.log("Conectado al socket con ID:", socket.id);
    });
  
    // Escuchar el evento personalizado
    socket.on("state changed", (data) => {
      console.log("Evento 'state changed' recibido:", data);
      // Puedes usar `data` para actualizar Redux o el estado local
    });
  
    // Manejar errores
    socket.on("connect_error", (err) => {
      console.error("Error al conectar al socket:", err);
    });
  
    // Limpieza al desmontar el componente
    return () => {
      socket.disconnect();
      console.log("Socket desconectado.");
    };
  }, []);

  // Expandir o contraer los detalles de un producto
  const toggleItemExpansion = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Renderizar los ingredientes (incluidos o extras)
  const renderIngredients = (title, ingredients = []) => {
    if (!ingredients.length) return null;
    return (
      <View style={styles.ingredientsContainer}>
        <Text style={styles.ingredientsTitle}>{title}</Text>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <Icon name="circle-small" size={16} color="#6B7280" />
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            {ingredient.price && (
              <Text style={styles.ingredientPrice}>
                +${parseFloat(ingredient.price).toFixed(2)}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Renderizar los productos de la orden
  const renderOrderItems = () => {
    if (!orderProducts || !orderProducts.length) {
      return (
        <Text style={styles.infoText}>
          No products found for this order.
        </Text>
      );
    }

    return orderProducts.map((orderItem) => {
      const isExpanded = expandedItems[orderItem.id] || false;
      return (
        <View key={orderItem.id} style={styles.itemContainer}>
          <TouchableOpacity
            style={styles.itemHeader}
            onPress={() => toggleItemExpansion(orderItem.id)}
          >
            <View style={styles.itemLeft}>
              <Image
                source={{
                  uri: orderItem.product?.imageUrl || 'https://via.placeholder.com/50',
                }}
                style={styles.itemImage}
              />
              <View>
                <Text style={styles.itemName}>
                  {orderItem.quantity}x {orderItem.product?.name}
                </Text>
                <Text style={styles.itemPrice}>
                  ${parseFloat(orderItem.price).toFixed(2)}
                </Text>
              </View>
            </View>
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.expandedContent}>
              {renderIngredients(
                'Included:',
                orderItem.extras?.includedIngredients
              )}
              {renderIngredients(
                'Extras:',
                orderItem.extras?.extraIngredients
              )}
            </View>
          )}
        </View>
      );
    });
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          Order not found or no longer active.
        </Text>
      </SafeAreaView>
    );
  }

  if (loading && !orderProducts) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#4F46E5"
          style={{ marginTop: 20 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeTabs')}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 24, height: 24 }} />
      </View>

      {/* Contenido */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Tracker de estatus */}
        <OrderStatusTracker currentStatus={order.state || 'Pending'} />

        {/* Detalles de la orden */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID:</Text>
            <Text style={styles.detailValue}>{order.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.detailValue}>
              ${parseFloat(order.finalPrice || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Address:</Text>
            <Text style={styles.detailValue}>
              {order.deliveryAddress || 'No address provided'}
            </Text>
          </View>
        </View>

        {/* Lista de productos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {renderOrderItems()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    maxWidth: '60%',
  },
  infoText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
    maxWidth: 200,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  expandedContent: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  ingredientsContainer: {
    marginBottom: 8,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#4B5563',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 2,
  },
  ingredientName: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
    marginLeft: 4,
  },
  ingredientPrice: {
    fontSize: 14,
    color: '#6B7280',
  },
});
