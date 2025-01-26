import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Importa tus acciones necesarias
import { removeItem, clearCart, updateItemQuantity } from '../redux/slices/cart.slice';
import { setCurrentOrder, setOrderItems } from '../redux/slices/order.slice';

const { width } = Dimensions.get('window');
const cardWidth = width - 40; // Full width minus padding

export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();

  // Estado del carrito y demás datos desde Redux
  const cartItems = useSelector((state) => state.cart.items);
  const partner_id = useSelector((state) => state.partner.partner_id);
  const user_id = useSelector((state) => state.user.userInfo.id);

  // Para controlar expandir/colapsar ingredientes en cada ítem
  const [expandedItems, setExpandedItems] = useState({});

  // Funciones de dispatch para manipular el carrito
  const handleRemoveItem = (id) => {
    dispatch(removeItem(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleUpdateQuantity = (id, quantity) => {
    if (quantity > 0) {
      dispatch(updateItemQuantity({ id, quantity }));
    }
  };

  const toggleItemExpansion = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Función para mostrar ingredientes
  const renderIngredients = (ingredients, type) => (
    <View style={styles.ingredientsContainer}>
      <Text style={styles.ingredientsTitle}>
        {type === 'included' ? 'Ingredientes incluidos:' : 'Ingredientes extra:'}
      </Text>
      {ingredients.map((ingredient) => (
        <View key={ingredient.id} style={styles.ingredientItem}>
          <Icon
            name={ingredient.included ? 'check-circle' : 'minus-circle'}
            size={16}
            color={ingredient.included ? '#10B981' : '#EF4444'}
          />
          <Text style={styles.ingredientName}>{ingredient.name}</Text>
          {type === 'extra' && (
            <Text style={styles.ingredientPrice}>
              ${parseFloat(ingredient.price).toFixed(2)}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  // Render de cada producto
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemContent}>
          <View style={styles.itemTitleContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
              <Icon name="close" size={24} color="#6D28D9" />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemOption}>{item.option}</Text>
          <View style={styles.itemDetails}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              >
                <Icon name="minus-circle-outline" size={24} color="#6D28D9" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                <Icon name="plus-circle-outline" size={24} color="#6D28D9" />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemPrice}>
              ${parseFloat(item.totalPrice).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Botón de expandir/cerrar detalles de ingredientes */}
      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => toggleItemExpansion(item.id)}
      >
        <Icon
          name={expandedItems[item.id] ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#6D28D9"
        />
      </TouchableOpacity>

      {/* Muestra los ingredientes si está expandido */}
      {expandedItems[item.id] && (
        <View style={styles.expandedContent}>
          {renderIngredients(item.includedIngredients, 'included')}
          {item.extraIngredients.length > 0 &&
            renderIngredients(item.extraIngredients, 'extra')}
        </View>
      )}
    </View>
  );

  // Cálculo del total general (subtotal)
  const totalGeneral = cartItems.reduce(
    (sum, item) => sum + item.quantity * parseFloat(item.pricePerUnit),
    0
  );

  // Manejo de la acción al pasar a la siguiente pantalla
  const handleCheckout = () => {
    // Despacha los datos a order.slice
    dispatch(
      setCurrentOrder({
        user_id,
        partner_id,
        price: totalGeneral, // Subtotal
      })
    );
    // Guarda los ítems con sus detalles en la orden
    dispatch(setOrderItems(cartItems));

    // Navega a la pantalla de Checkout o Pago
    navigation.navigate('ConfirmationScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header del carrito */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Icon name="trash-can-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Listado de productos */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cart-off" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>Tu carrito está vacío</Text>
          </View>
        }
      />

      {/* Footer con total y botón de checkout */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${totalGeneral.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceder al pago</Text>
          <Icon name="arrow-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* --- ESTILOS --- */
const styles = StyleSheet.create({
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  itemOption: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6D28D9',
  },
  expandButton: {
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  expandedContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  ingredientsContainer: {
    marginTop: 8,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4B5563',
    marginBottom: 4,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ingredientName: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  ingredientPrice: {
    fontSize: 14,
    color: '#6D28D9',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginTop: 16,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6D28D9',
  },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6D28D9',
    borderRadius: 12,
    paddingVertical: 16,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});
