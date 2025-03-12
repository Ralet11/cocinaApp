import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useStripe } from '@stripe/stripe-react-native';
import * as WebBrowser from 'expo-web-browser';
import { API_URL } from '@env';
import { addCurrentOrderToActiveOrders, clearCurrentOrder } from '../redux/slices/order.slice';
import { clearCart } from '../redux/slices/cart.slice';
import axios from 'react-native-axios';
import { Linking } from 'react-native';

export default function OrderSummaryScreen({ navigation }) {
  const dispatch = useDispatch();
  const currentAddress = useSelector((state) => state.user.currentAddress);
  const currentOrder = useSelector((state) => state.order.currentOrder);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [isError, setIsError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  const { items = [], price = 0, deliveryFee = 0 } = currentOrder;
  const taxes = 0.54;
  const total = price + deliveryFee + taxes;

  // --- STRIPE Payment Flow ---
  const handleStripePayment = async () => {
    if (!currentAddress) {
      showAddressError();
      return;
    }

    setIsProcessing(true);
    try {
      const paymentResponse = await axios.post(`${API_URL}/payment/intent`, {
        amount: Math.floor(total * 100),
      });

      const { clientSecret } = paymentResponse.data;

      const initResponse = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Premier Burguer',
        allowsDelayedPaymentMethods: true,
      });

      if (initResponse.error) {
        Alert.alert('Error', initResponse.error.message);
        setIsProcessing(false);
        return;
      }

      const paymentResult = await presentPaymentSheet();

      if (paymentResult.error) {
        Alert.alert('Payment failed', paymentResult.error.message);
      } else {
        await createOrderInBackend();
      }
    } catch (error) {
      console.error('Error during Stripe order process:', error);
      Alert.alert('Error', 'Something went wrong during the payment process.');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- MERCADO PAGO Flow ---
  const handleMercadoPago = async () => {
    if (!currentAddress) {
      showAddressError();
      return;
    }

    setIsProcessing(true);
    try {
      const itemsToSend = [
        {
          name: 'Order Total',
          quantity: 1,
          price: parseFloat(total.toFixed(2)),
          currency_id: 'ARS',
        },
      ];

      const mpResponse = await axios.post(
        `${API_URL}/payment/mp/create-preference`,
        itemsToSend
      );
      const { init_point } = mpResponse.data;

      const supported = await Linking.canOpenURL(init_point);
      if (supported) {
        await Linking.openURL(init_point);
      } else {
        Alert.alert('Error', 'No se puede abrir la URL: ' + init_point);
      }
    } catch (error) {
      console.error('Error during Mercado Pago process:', error);
      Alert.alert('Error', 'Something went wrong during the Mercado Pago payment process.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Crea la orden en tu backend
  const createOrderInBackend = async () => {
    try {
      const orderData = {
        ...currentOrder,
        deliveryAddress: currentAddress.street,
        finalPrice: total.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        price: price.toFixed(2),
      };

      const orderResponse = await axios.post(`${API_URL}/order/`, orderData);
      const { order, orderProducts: items } = orderResponse.data;

      console.log(order, 'order');

      dispatch(addCurrentOrderToActiveOrders({ order, items }));
      dispatch(clearCurrentOrder());
      dispatch(clearCart());

      // Espera 2 segundos antes de navegar
      setTimeout(() => {
        navigation.navigate('OrderTracking', { orderId: order.id });
      }, 2000);
    } catch (err) {
      console.error('Error creating order:', err);
      Alert.alert('Error', 'Failed to create the order in backend');
    }
  };

  const showAddressError = () => {
    setIsError(true);
    Toast.show({
      type: 'error',
      text1: 'You need to confirm address',
      position: 'bottom',
      visibilityTime: 2000,
      bottomOffset: 80,
    });
    setTimeout(() => setIsError(false), 2000);
  };

  const toggleItemExpansion = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const renderIngredients = (title, ingredients = []) => {
    if (!ingredients.length) return null;
    return (
      <View style={styles.ingredientsContainer}>
        <Text style={styles.ingredientsTitle}>{title}</Text>
        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <Text style={styles.ingredientBullet}>•</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 24, height: 24 }} />
      </View>

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Dirección de entrega */}
        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>Delivery Address:</Text>
          <Text style={styles.addressText}>
            {currentAddress ? currentAddress.street : ''}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Addresses')}>
            <Text style={styles.changeAddressText}>
              {currentAddress?.street ? 'Change address' : 'Confirm address'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Items */}
        {items.length > 0 && (
          <View style={styles.itemsContainer}>
            <Text style={styles.sectionTitle}>Items in your order</Text>
            {items.map((item) => {
              const isExpanded = expandedItems[item.id] || false;
              return (
                <View key={item.id} style={styles.itemBlock}>
                  <View style={styles.itemRow}>
                    <Text style={styles.itemName}>
                      {item.quantity}x {item.name}
                    </Text>
                    <View style={styles.itemRight}>
                      <Text style={styles.itemPrice}>
                        ${parseFloat(item.totalPrice).toFixed(2)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => toggleItemExpansion(item.id)}
                        style={styles.expandButton}
                      >
                        <Icon
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color="#000000"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      {renderIngredients('Included:', item.includedIngredients)}
                      {renderIngredients('Extras:', item.extraIngredients)}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Resumen de costos */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Subtotal</Text>
            <Text style={styles.summaryText}>${price.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Fees</Text>
            <Text style={styles.summaryText}>${deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Taxes</Text>
            <Text style={styles.summaryText}>${taxes.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryText, styles.totalLabel]}>Total</Text>
            <Text style={[styles.summaryText, styles.totalAmount]}>
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer con botones de pago */}
      <View style={styles.footer}>
        {/* Botón: Stripe */}
        <TouchableOpacity
          style={[styles.paymentButton, { marginRight: 10 }]}
          onPress={handleStripePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.buttonContent}>
              <Image
                source={require('../assets/stripe-logo.jpg')}
                style={styles.buttonLogo}
              />
              <Text style={styles.continueButtonText}>Pay with Stripe</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Botón: Mercado Pago */}
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={handleMercadoPago}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.buttonContent}>
              <Image
                source={require('../assets/mercadopago.jpg')}
                style={styles.buttonLogo}
              />
              <Text style={styles.continueButtonText}>Pay with Mercado Pago</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Toast />
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
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contentContainer: {
    padding: 16,
  },
  addressSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    elevation: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
  },
  changeAddressText: {
    fontSize: 14,
    color: '#D32F2F',
    textDecorationLine: 'underline',
  },
  itemsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000000',
  },
  itemBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    color: '#D32F2F',
    marginRight: 4,
  },
  expandButton: {
    padding: 4,
  },
  expandedContent: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  ingredientsContainer: {
    marginBottom: 8,
  },
  ingredientsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000000',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 2,
  },
  ingredientBullet: {
    marginRight: 4,
    color: '#9CA3AF',
  },
  ingredientName: {
    fontSize: 13,
    color: '#000000',
    flex: 1,
  },
  ingredientPrice: {
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
});
