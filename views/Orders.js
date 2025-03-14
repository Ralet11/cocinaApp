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

/* Helper: Returns card style based on status */
function getCardStyleByStatus(status) {
  const lowerStatus = status?.toLowerCase();
  switch (lowerStatus) {
    case 'pendiente':
      return { backgroundColor: '#FEF9C3' }; // very light yellow
    case 'aceptada':
      return { backgroundColor: '#DCFCE7' }; // light green
    case 'envio':
      return { backgroundColor: '#E0F2FE' }; // light blue
    case 'finalizada':
      return { backgroundColor: '#F3F4F6' }; // light gray
    case 'rechazada':
    case 'cancelada':
      return { backgroundColor: '#FEE2E2' }; // light red
    default:
      return { backgroundColor: '#FFFFFF' };
  }
}

export default function Orders() {
  const navigation = useNavigation();

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const historicOrders = useSelector((state) => state.order.historicOrders);

  // Filter and search function
  function applyFilters() {
    let orders = [...historicOrders];

    // Filter by status
    if (filterStatus === 'active') {
      orders = orders.filter(
        (o) =>
          !['finalizada', 'rechazada', 'cancelada'].includes(o.status?.toLowerCase())
      );
    } else if (filterStatus === 'finished') {
      orders = orders.filter((o) =>
        ['finalizada', 'rechazada', 'cancelada'].includes(o.status?.toLowerCase())
      );
    }

    // Search by order code or delivery address
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      orders = orders.filter((order) => {
        const codeMatch = order.code?.toLowerCase().includes(query);
        const addressMatch = order.deliveryAddress?.toLowerCase().includes(query);
        return codeMatch || addressMatch;
      });
    }

    return orders;
  }

  const filteredOrders = applyFilters();

  // Separate active and finished orders (for "all" view)
  const activeOrders = filteredOrders.filter(
    (o) => !['finalizada', 'rechazada', 'cancelada'].includes(o.status?.toLowerCase())
  );
  const finishedOrders = filteredOrders.filter((o) =>
    ['finalizada', 'rechazada', 'cancelada'].includes(o.status?.toLowerCase())
  );

  // Modal functions
  const openModal = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };
  const closeModal = () => {
    setSelectedOrder(null);
    setModalVisible(false);
  };

  // Navigate to order tracking if active, otherwise open modal for finished orders
  const handlePress = (order) => {
    const lowerStatus = order.status?.toLowerCase();
    if (['finalizada', 'rechazada', 'cancelada'].includes(lowerStatus)) {
      openModal(order);
    } else {
      navigation.navigate('OrderTracking', { orderId: order.id });
    }
  };

  // Simple date format: YYYY-MM-DD
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.filterButton}>
          <Icon name="tune-vertical" size={24} color="#D32F2F" />
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* STATUS FILTER */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterOption,
            filterStatus === 'all' && styles.filterOptionActive,
          ]}
          onPress={() => setFilterStatus('all')}
        >
          <Text
            style={[
              styles.filterOptionText,
              filterStatus === 'all' && styles.filterOptionTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterOption,
            filterStatus === 'active' && styles.filterOptionActive,
          ]}
          onPress={() => setFilterStatus('active')}
        >
          <Text
            style={[
              styles.filterOptionText,
              filterStatus === 'active' && styles.filterOptionTextActive,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterOption,
            filterStatus === 'finished' && styles.filterOptionActive,
          ]}
          onPress={() => setFilterStatus('finished')}
        >
          <Text
            style={[
              styles.filterOptionText,
              filterStatus === 'finished' && styles.filterOptionTextActive,
            ]}
          >
            Finished
          </Text>
        </TouchableOpacity>
      </View>

      {/* ORDERS LIST */}
      <ScrollView style={styles.ordersList} showsVerticalScrollIndicator={false}>
        {filterStatus !== 'all' &&
          filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={[styles.orderItem, getCardStyleByStatus(order.status)]}
              onPress={() => handlePress(order)}
            >
              <Image
                source={{ uri: '/placeholder.svg?height=80&width=80' }}
                style={styles.orderImage}
              />
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>{order.code || 'No code'}</Text>
                <Text style={styles.orderAddress}>{order.deliveryAddress}</Text>
                <Text style={styles.orderStatus}>{order.status}</Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>${order.finalPrice}</Text>
                </View>
              </View>
              <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
            </TouchableOpacity>
          ))}

        {filterStatus === 'all' && (
          <>
            {/* ACTIVE ORDERS */}
            {activeOrders.length > 0 && (
              <Text style={styles.sectionTitle}>Active Orders</Text>
            )}
            {activeOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderItem, getCardStyleByStatus(order.status)]}
                onPress={() => handlePress(order)}
              >
                <Image
                  source={{ uri: '/placeholder.svg?height=80&width=80' }}
                  style={styles.orderImage}
                />
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>{order.code || 'No code'}</Text>
                  <Text style={styles.orderAddress}>{order.deliveryAddress}</Text>
                  <Text style={styles.orderStatus}>{order.status}</Text>
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>${order.finalPrice}</Text>
                  </View>
                </View>
                <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
              </TouchableOpacity>
            ))}

            {/* SEPARATOR */}
            {activeOrders.length > 0 && finishedOrders.length > 0 && (
              <View style={styles.separator} />
            )}

            {/* HISTORICAL ORDERS */}
            {finishedOrders.length > 0 && (
              <Text style={styles.sectionTitle}>Historical Orders</Text>
            )}
            {finishedOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={[styles.orderItem, getCardStyleByStatus(order.status)]}
                onPress={() => handlePress(order)}
              >
                <Image
                  source={{ uri: '/placeholder.svg?height=80&width=80' }}
                  style={styles.orderImage}
                />
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle}>{order.code || 'No code'}</Text>
                  <Text style={styles.orderAddress}>{order.deliveryAddress}</Text>
                  <Text style={styles.orderStatus}>{order.status}</Text>
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>${order.finalPrice}</Text>
                  </View>
                </View>
                <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* MODAL FOR ORDER DETAILS (for finished orders) */}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* HEADER */
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
    color: '#D32F2F',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* SEARCH BAR */
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchIcon: {
    position: 'absolute',
    left: 36,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    color: '#000000',
  },

  /* FILTERS */
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
  },
  filterOptionActive: {
    backgroundColor: '#D32F2F',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#FFFFFF',
  },

  /* ORDERS LIST */
  ordersList: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },

  /* ORDER ITEM */
  orderItem: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  orderImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  orderAddress: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '500',
    marginBottom: 6,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  orderDate: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 12,
    color: '#9CA3AF',
  },

  /* MODAL */
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#000000',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#D32F2F',
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
    color: '#000000',
  },
  productDescription: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#D32F2F',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#D32F2F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
