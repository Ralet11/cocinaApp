import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const Orders = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Tomamos las órdenes del store
  const historicOrders = useSelector((state) => state.order.historicOrders);

  // Filtramos por código o dirección de entrega
  const filteredOrders = historicOrders.filter((order) => {
    const codeMatch = order.code
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const addressMatch = order.deliveryAddress
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return codeMatch || addressMatch;
  });

  // Separamos las órdenes en finalizadas y no finalizadas
  const activeOrders = filteredOrders.filter(
    (order) => order.status !== 'finalizada',
  );
  const finishedOrders = filteredOrders.filter(
    (order) => order.status === 'finalizada',
  );

  // Unimos primero las activas y después las finalizadas
  const sortedOrders = [...activeOrders, ...finishedOrders];

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Función para abrir el modal (solo para órdenes finalizadas)
  const openModal = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  // Función para manejar el onPress según el estado de la orden
  const handlePress = (order) => {
    if (order.status === 'finalizada') {
      // Órdenes finalizadas -> mostrar modal
      openModal(order);
    } else {
      // Órdenes activas -> navegar a OrderTracking
      navigation.navigate('OrderTracking', { orderId: order.id });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="tune-vertical" size={24} color="#4C1D95" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders"
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Orders List */}
      <ScrollView style={styles.ordersList} showsVerticalScrollIndicator={false}>
        {sortedOrders.map((order) => {
          const isActive = order.status !== 'finalizada';
          return (
            <TouchableOpacity
              key={order.id}
              style={[
                styles.orderItem,
                isActive && styles.activeOrderItem, // Estilo adicional para órdenes activas
              ]}
              onPress={() => handlePress(order)}
            >
              <Image
                source={{ uri: '/placeholder.svg?height=80&width=80' }}
                style={styles.orderImage}
              />
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>{order.code || 'Sin código'}</Text>
                <Text style={styles.orderAddress}>{order.deliveryAddress}</Text>
                <Text style={styles.orderStatus}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>${order.finalPrice}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Modal para mostrar detalles de la orden finalizada */}
      {selectedOrder && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <Text style={styles.modalText}>
                Address: {selectedOrder.deliveryAddress}
              </Text>
              <Text style={styles.modalText}>
                Status:{' '}
                {selectedOrder.status.charAt(0).toUpperCase() +
                  selectedOrder.status.slice(1)}
              </Text>
              <Text style={styles.modalText}>
                Total: ${selectedOrder.finalPrice}
              </Text>

              <Text style={styles.modalSubtitle}>Products:</Text>
              <FlatList
                data={selectedOrder.order_products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View style={styles.productItem}>
                    <Image
                      source={{ uri: item.product.img }}
                      style={styles.productImage}
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.product.name}</Text>
                      <Text style={styles.productDescription}>
                        {item.product.description}
                      </Text>
                      <Text style={styles.productPrice}>
                        ${item.product.price} x {item.quantity}
                      </Text>
                    </View>
                  </View>
                )}
              />

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4C1D95',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
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
  ordersList: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  // Estilo adicional para las órdenes activas
  activeOrderItem: {
    borderWidth: 1,
    borderColor: '#10B981', // un verde suave, por ejemplo
    backgroundColor: '#ECFDF5', // un fondo suave para destacar
  },
  orderImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  orderAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  orderStatus: {
    fontSize: 14,
    color: '#4C1D95',
    fontWeight: '500',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4C1D95',
  },
  orderDate: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4C1D95',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#4B5563',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#4C1D95',
  },
  productItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#4C1D95',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#4C1D95',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Orders;
