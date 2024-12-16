import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProductDetail = ({ route, navigation }) => {
  const { product } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#4C1D95" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{product.name}</Text>
        <View style={{ width: 24 }} /> {/* Espaciador para alinear el título */}
      </View>

      <ScrollView>
        {/* Imagen del producto */}
        <Image source={{ uri: product.image }} style={styles.productImage} />

        {/* Detalles del producto */}
        <View style={styles.detailsContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>

          <View style={styles.productMetaContainer}>
            <Text style={styles.productPrice}>${product.price}</Text>
            <Text style={styles.productCalories}>{product.calories} cal</Text>
          </View>

          {/* Opciones */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionText}>Simple</Text>
              <Text style={styles.optionSubText}>${product.price} - {product.calories} cal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionText}>Doble</Text>
              <Text style={styles.optionSubText}>${(product.price * 1.5).toFixed(2)} - {(product.calories * 1.5).toFixed(0)} cal</Text>
            </TouchableOpacity>
          </View>

          {/* Botón de agregar */}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Agregar por ${product.price}</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4C1D95',
  },
  productImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 20,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  productMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4C1D95',
  },
  productCalories: {
    fontSize: 16,
    color: '#6B7280',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  optionSubText: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: '#4C1D95',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ProductDetail;
