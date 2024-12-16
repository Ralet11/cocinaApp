import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const FEATURED_DATA = [
  { id: '1', name: 'Italiana', icon: 'pasta' },
  { id: '2', name: 'Japonesa', icon: 'food-sushi' },
  { id: '3', name: 'Mexicana', icon: 'taco' },
  { id: '4', name: 'Postres', icon: 'cake' },
];

const NEARBY_ITEMS = [
  {
    id: '1',
    name: 'Pizza Pepperoni',
    restaurant: 'Pizza House',
    rating: '4.8',
    time: '20-30 min',
    image: '/placeholder.svg?height=200&width=200',
    description: 'Pizza clásica de pepperoni con queso mozzarella y salsa de tomate.',
  },
  {
    id: '2',
    name: 'Veggie Supreme',
    restaurant: 'Green Bites',
    rating: '4.5',
    time: '15-25 min',
    image: '/placeholder.svg?height=200&width=200',
    description: 'Pizza vegetariana con una mezcla de verduras frescas y queso.',
  },
  {
    id: '3',
    name: 'Hamburguesa Clásica',
    restaurant: 'Burger Joint',
    rating: '4.7',
    time: '25-35 min',
    image: '/placeholder.svg?height=200&width=200',
    description: 'Jugosa hamburguesa con queso cheddar, lechuga y tomate.',
  },
  {
    id: '4',
    name: 'Ensalada Fresca',
    restaurant: 'Healthy Bowl',
    rating: '4.6',
    time: '10-20 min',
    image: '/placeholder.svg?height=200&width=200',
    description: 'Ensalada mixta con ingredientes frescos y aderezo ligero.',
  },
];

const Dashboard = () => {
  const navigation = useNavigation();

  const handleProductClick = (item) => {
    navigation.getParent().navigate('ProductDetail', { product: item });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="map-marker" size={24} color="#4C1D95" />
          <Text style={styles.locationText}>Ubicación Actual</Text>
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
            {NEARBY_ITEMS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.gridItem} onPress={() => handleProductClick(item)}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.restaurantName}>{item.restaurant}</Text>
                  <View style={styles.itemFooter}>
                    <View style={styles.ratingContainer}>
                      <Icon name="star" size={16} color="#F59E0B" />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                    <View style={styles.timeContainer}>
                      <Icon name="clock-outline" size={16} color="#6B7280" />
                      <Text style={styles.timeText}>{item.time}</Text>
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
