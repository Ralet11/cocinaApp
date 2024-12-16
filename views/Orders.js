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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ORDERS = [
  {
    id: '1',
    restaurant: 'Pizza House',
    items: ['1x Pepperoni Pizza', '1x Garlic Bread'],
    total: '$24.99',
    status: 'Delivered',
    date: '2023-06-15',
    image: '/placeholder.svg?height=80&width=80',
  },
  {
    id: '2',
    restaurant: 'Burger Joint',
    items: ['2x Classic Burger', '1x Fries', '2x Cola'],
    total: '$35.50',
    status: 'In Progress',
    date: '2023-06-14',
    image: '/placeholder.svg?height=80&width=80',
  },
  {
    id: '3',
    restaurant: 'Sushi Palace',
    items: ['1x California Roll', '1x Miso Soup', '1x Green Tea'],
    total: '$28.75',
    status: 'Delivered',
    date: '2023-06-12',
    image: '/placeholder.svg?height=80&width=80',
  },
  {
    id: '4',
    restaurant: 'Taco Town',
    items: ['3x Beef Tacos', '1x Guacamole', '2x Horchata'],
    total: '$22.50',
    status: 'Cancelled',
    date: '2023-06-10',
    image: '/placeholder.svg?height=80&width=80',
  },
  {
    id: '5',
    restaurant: 'Pasta Paradise',
    items: ['1x Spaghetti Carbonara', '1x Caesar Salad', '1x Tiramisu'],
    total: '$42.00',
    status: 'Delivered',
    date: '2023-06-08',
    image: '/placeholder.svg?height=80&width=80',
  },
];

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = ORDERS.filter(order =>
    order.restaurant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#10B981';
      case 'In Progress':
        return '#F59E0B';
      case 'Cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
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
        {filteredOrders.map((order) => (
          <TouchableOpacity key={order.id} style={styles.orderItem}>
            <Image source={{ uri: order.image }} style={styles.orderImage} />
            <View style={styles.orderInfo}>
              <Text style={styles.restaurantName}>{order.restaurant}</Text>
              <Text style={styles.orderItems}>{order.items.join(', ')}</Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>{order.total}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.orderDate}>{order.date}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home-outline" size={24} color="#6B7280" />
          <Text style={styles.navTextInactive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="compass-outline" size={24} color="#6B7280" />
          <Text style={styles.navTextInactive}>Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="clipboard-text" size={24} color="#4C1D95" />
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="account-outline" size={24} color="#6B7280" />
          <Text style={styles.navTextInactive}>Profile</Text>
        </TouchableOpacity>
      </View>
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
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
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
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  orderItems: {
    fontSize: 14,
    color: '#6B7280',
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  orderDate: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 12,
    color: '#9CA3AF',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    marginTop: 4,
    fontSize: 12,
    color: '#4C1D95',
    fontWeight: '500',
  },
  navTextInactive: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },
});

export default Orders;

