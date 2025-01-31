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
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { useStripe } from '@stripe/stripe-react-native';
import { API_URL } from '@env';
import { addCurrentOrderToActiveOrders, clearCurrentOrder } from '../redux/slices/order.slice';
import axios from 'react-native-axios';
import {clearCart} from "../redux/slices/cart.slice"

export default function OrderSummaryScreen({ navigation }) {
  const dispatch = useDispatch();
  const currentAddress = useSelector((state) => state.user.currentAddress);
  const currentOrder = useSelector((state) => state.order.currentOrder);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [isError, setIsError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  console.log(currentOrder, "order")

  const { items = [], price = 0, deliveryFee = 0 } = currentOrder;
  const taxes = 0.54;
  const total = price + deliveryFee + taxes;

  const handleContinue = async () => {
    if (!currentAddress) {
      setIsError(true);
      Toast.show({
        type: 'error',
        text1: 'You need to confirm address',
        position: 'bottom',
        visibilityTime: 2000,
        bottomOffset: 80,
      });
      setTimeout(() => setIsError(false), 2000);
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
        merchantDisplayName: 'YourAppName',
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
        const orderData = {
          ...currentOrder,
          deliveryAddress: currentAddress.street,
          finalPrice: total.toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          price: price.toFixed(2),
        };

        const orderResponse = await axios.post(`${API_URL}/order/`, orderData);
        const { message, order, orderProducts: items } = orderResponse.data;

        dispatch(addCurrentOrderToActiveOrders({ order, items }));
        dispatch(clearCurrentOrder());
        dispatch(clearCart())
        console.log(typeof order.id);
        navigation.navigate('OrderTracking', { orderId: order.id });
      }
    } catch (error) {
      console.error('Error during order process:', error);
      Alert.alert('Error', 'Something went wrong during the payment process.');
    } finally {
      setIsProcessing(false);
    }
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{ width: 24, height: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>Delivery Address:</Text>
          <Text style={styles.addressText}>{currentAddress ? currentAddress.street : ''}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Addresses')}>
            <Text style={styles.changeAddressText}>
              {currentAddress?.street ? 'Change address' : 'Confirm address'}
            </Text>
          </TouchableOpacity>
        </View>

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
                          color="#6B7280"
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

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}><Text>Subtotal</Text><Text>${price.toFixed(2)}</Text></View>
          <View style={styles.summaryRow}><Text>Fees</Text><Text>${deliveryFee.toFixed(2)}</Text></View>
          <View style={styles.summaryRow}><Text>Taxes</Text><Text>${taxes.toFixed(2)}</Text></View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}><Text>Total</Text><Text>${total.toFixed(2)}</Text></View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
          <Icon
            name={isError ? "alert-circle" : "arrow-right"}
            size={24}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      <Toast />
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6D28D9',
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
    color: '#4B5563',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  changeAddressText: {
    fontSize: 14,
    color: '#6D28D9',
    textDecorationLine: 'underline',
  },
  itemsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  itemBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
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
    color: '#4B5563',
    fontWeight: '600',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#4B5563',
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
    color: '#4B5563',
    flex: 1,
  },
  ingredientPrice: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#6D28D9',
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
});
