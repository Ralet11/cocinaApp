// views/CartScreen.jsx
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
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

// Importa tus acciones necesarias
import { removeItem, clearCart, updateItemQuantity } from '../redux/slices/cart.slice';
import { setCurrentOrder, setOrderItems } from '../redux/slices/order.slice';

const { width } = Dimensions.get('window');

export default function CartScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const currentLang = useSelector(s => s.user.language);
  // sincroniza i18n con Redux
  React.useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang);
  }, [currentLang]);

  const dispatch   = useDispatch();
  const cartItems  = useSelector(state => state.cart.items);
  const partner_id = useSelector(state => state.partner.partner_id);
  const user_id    = useSelector(state => state.user.userInfo.id);

  const [expandedItems, setExpandedItems] = useState({});

  const handleRemoveItem = id => {
    dispatch(removeItem(id));
  };
  const handleClearCart = () => {
    dispatch(clearCart());
  };
  const handleUpdateQuantity = (id, quantity) => {
    if (quantity > 0) dispatch(updateItemQuantity({ id, quantity }));
  };
  const toggleItemExpansion = id => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderIngredients = (ingredients, type) => (
    <View style={styles.ingredientsContainer}>
      <Text style={styles.ingredientsTitle}>
        {type === 'included'
          ? t('cart.ingredientsIncluded')
          : t('cart.ingredientsExtra')}
      </Text>
      {ingredients.map(ingredient => (
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

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Image source={{ uri: item.image }} style={styles.itemImage} />
        <View style={styles.itemContent}>
          <View style={styles.itemTitleContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
              <Icon name="close" size={24} color="#D32F2F" />
            </TouchableOpacity>
          </View>
          {item.option && (
            <Text style={styles.itemOption}>{item.option}</Text>
          )}
          <View style={styles.itemDetails}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() =>
                  handleUpdateQuantity(item.id, item.quantity - 1)
                }
              >
                <Icon
                  name="minus-circle-outline"
                  size={24}
                  color="#D32F2F"
                />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() =>
                  handleUpdateQuantity(item.id, item.quantity + 1)
                }
              >
                <Icon
                  name="plus-circle-outline"
                  size={24}
                  color="#D32F2F"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.itemPrice}>
              ${parseFloat(item.totalPrice).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => toggleItemExpansion(item.id)}
      >
        <Icon
          name={expandedItems[item.id] ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#D32F2F"
        />
      </TouchableOpacity>

      {expandedItems[item.id] && (
        <View style={styles.expandedContent}>
          {item.includedIngredients?.length > 0 &&
            renderIngredients(item.includedIngredients, 'included')}
          {item.extraIngredients?.length > 0 &&
            renderIngredients(item.extraIngredients, 'extra')}
        </View>
      )}
    </View>
  );

  const totalGeneral = cartItems.reduce(
    (sum, item) =>
      sum + item.quantity * parseFloat(item.pricePerUnit),
    0
  );

  const handleCheckout = () => {
    dispatch(
      setCurrentOrder({
        user_id,
        partner_id,
        price: totalGeneral,
      })
    );
    dispatch(setOrderItems(cartItems));
    navigation.navigate('ConfirmationScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('cart.headerTitle')}</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Icon name="trash-can-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cart-off" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>{t('cart.empty')}</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>{t('cart.total')}</Text>
          <Text style={styles.totalAmount}>
            ${totalGeneral.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>
            {t('cart.checkout')}
          </Text>
          <Icon name="arrow-right" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

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
    backgroundColor: '#D32F2F',
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
    shadowColor: '#000000',
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
    color: '#000000',
  },
  itemOption: {
    fontSize: 14,
    color: '#000000',
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
    color: '#000000',
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
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
    color: '#000000',
    marginBottom: 4,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  ingredientName: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
    flex: 1,
  },
  ingredientPrice: {
    fontSize: 14,
    color: '#D32F2F',
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
    color: '#000000',
    marginTop: 16,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000000',
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
    color: '#000000',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
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
