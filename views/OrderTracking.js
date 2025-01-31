import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'react-native-axios';
import { OrderStatusTracker } from '../components/OrderTracker';
import { API_URL } from '@env';

const { width } = Dimensions.get('window');

export default function OrderTrackingScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params;
  const allOrders = useSelector((state) => [
    ...state.order.activeOrders,
    ...state.order.historicOrders,
  ]);
  
  const currentOrder = allOrders.find((o) => o.id === orderId);
  const [orderProducts, setOrderProducts] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrderProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/order-products/getByOrder/${orderId}`);
        setOrderProducts(response.data);
      } catch (error) {
        console.log('Error fetching order products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderProducts();
  }, [orderId]);

  const renderOrderItems = () => {
    if (!orderProducts || !orderProducts.length) {
      return (
        <Text style={styles.infoText}>No products found for this order.</Text>
      );
    }
    return orderProducts.map((orderItem) => (
      <View key={orderItem.id} style={styles.itemContainer}>
        <Image
          source={{
            uri: orderItem.product?.imageUrl || 'https://via.placeholder.com/50',
          }}
          style={styles.itemImage}
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>
            {orderItem.quantity}x {orderItem.product?.name}
          </Text>
          <Text style={styles.itemPrice}>
            ${parseFloat(orderItem.price).toFixed(2)}
          </Text>
        </View>
      </View>
    ));
  };

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Order not found or no longer active.</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
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
        <View style={{ width: 24 }} />
      </View>

      {/* Contenido principal */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta con el estado actual */}
        <View style={styles.cardContainer}>
          <OrderStatusTracker currentStatus={currentOrder.status || 'pendiente'} />
        </View>

        {/* Detalles de la orden */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID:</Text>
            <Text style={styles.detailValue}>#{currentOrder.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total:</Text>
            <Text style={styles.detailValue}>
              ${parseFloat(currentOrder.finalPrice || 0).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.lastDetailRow]}>
            <Text style={styles.detailLabel}>Delivery Address:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {currentOrder.deliveryAddress || 'No address provided'}
            </Text>
          </View>
        </View>

        {/* Lista de productos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items</Text>
          {renderOrderItems()}
        </View>
      </ScrollView>

      {/* Footer con botón */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('HomeTabs')}
        >
          <Text style={styles.footerButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* Pantalla principal */
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },

  /* Loader y mensaje de error */
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#EF4444',
    fontSize: 16,
  },

  /* Encabezado */
  header: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Tarjetas */
  cardContainer: {
    marginTop: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    // sombra sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },

  /* Filas de detalle */
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastDetailRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1.2,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },

  /* Lista de productos */
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: '#F3F4F6',
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 3,
  },
  itemPrice: {
    fontSize: 13,
    color: '#6B7280',
  },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  footerButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
