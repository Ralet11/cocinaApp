// views/OrderSummaryScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import axios from 'react-native-axios';
import { API_URL } from '@env';
import {
  addCurrentOrderToActiveOrders,
  clearCurrentOrder,
} from '../redux/slices/order.slice';
import { clearCart } from '../redux/slices/cart.slice';
import { useTranslation } from 'react-i18next';

export default function OrderSummaryScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const currentLang = useSelector(s => s.user.language);
  useEffect(() => {
    if (currentLang) i18n.changeLanguage(currentLang);
  }, [currentLang]);

  const dispatch = useDispatch();
  const currentAddress = useSelector(s => s.user.currentAddress);
  const currentOrder = useSelector(s => s.order.currentOrder);

  const items = currentOrder.items ?? [];
  const priceNum = Number(currentOrder.price ?? 0);
  const deliveryFeeNum = Number(currentOrder.deliveryFee ?? 0);
  const taxes = 0.54;
  const totalNum = priceNum + deliveryFeeNum + taxes;

  const [isProcessing, setProcessing] = useState(false);
  const [expanded, setExpanded] = useState({});

  const showAddressError = () => {
    Toast.show({
      type: 'error',
      text1: t('orderSummary.confirmAddressError'),
      position: 'bottom',
      visibilityTime: 2000,
      bottomOffset: 80,
    });
  };

  const handleMercadoPago = async () => {
    if (!currentAddress) return showAddressError();
    setProcessing(true);
    try {
      const orderPayload = {
        deliveryAddress: currentAddress.street,
        partner_id: currentOrder.partner_id,
        user_id: currentOrder.user_id,
        finalPrice: totalNum.toFixed(2),
        deliveryFee: deliveryFeeNum.toFixed(2),
        price: priceNum.toFixed(2),
      };
      const itemsPayload = items.length
        ? items.map(i => ({
            name: i.name,
            quantity: i.quantity,
            price: Number(i.totalPrice),
            currency_id: 'ARS',
          }))
        : [
            {
              name: t('orderSummary.defaultItem'),
              quantity: 1,
              price: totalNum,
              currency_id: 'ARS',
            },
          ];

      const { data } = await axios.post(
        `${API_URL}/payment/mp/create-preference`,
        { order: orderPayload, items: itemsPayload }
      );
      const { preference, order } = data;

      dispatch(addCurrentOrderToActiveOrders({ order, items }));
      dispatch(clearCart());

      if (await Linking.canOpenURL(preference.init_point)) {
        Linking.openURL(preference.init_point);
      } else {
        Alert.alert(t('orderSummary.mpErrorTitle'), t('orderSummary.mpErrorOpen'));
      }
    } catch (err) {
      console.error(err);
      Alert.alert(t('orderSummary.mpErrorTitle'), t('orderSummary.mpError'));
    } finally {
      setProcessing(false);
    }
  };

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  const renderIngredients = (title, ingr = []) =>
    !ingr.length ? null : (
      <View style={styles.ingredientsContainer}>
        <Text style={styles.ingredientsTitle}>{title}</Text>
        {ingr.map((g, i) => (
          <View key={i} style={styles.ingredientRow}>
            <Text style={styles.ingredientBullet}>•</Text>
            <Text style={styles.ingredientName}>{g.name}</Text>
            {g.price != null && (
              <Text style={styles.ingredientPrice}>
                +${Number(g.price).toFixed(2)}
              </Text>
            )}
          </View>
        ))}
      </View>
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orderSummary.headerTitle')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Address Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressHeader}>
            <Icon name="map-marker" size={20} color="#E53935" />
            <Text style={styles.addressLabel}>{t('orderSummary.addressLabel')}</Text>
          </View>
          {currentAddress?.street ? (
            <Text style={styles.addressText}>{currentAddress.street}</Text>
          ) : (
            <Text style={styles.noAddressText}>{t('orderSummary.noAddress')}</Text>
          )}
          <TouchableOpacity
            style={styles.changeAddressButton}
            onPress={() => navigation.navigate('Addresses')}
          >
            <Text style={styles.changeAddressText}>
              {currentAddress
                ? t('orderSummary.changeAddress')
                : t('orderSummary.confirmAddress')}
            </Text>
            <Icon name="chevron-right" size={16} color="#E53935" />
          </TouchableOpacity>
        </View>

        {/* Items Section */}
        {!!items.length && (
          <View style={styles.itemsContainer}>
            <View style={styles.sectionHeader}>
              <Icon name="food" size={20} color="#E53935" />
              <Text style={styles.sectionTitle}>{t('orderSummary.itemsTitle')}</Text>
            </View>
            {items.map(it => {
              const open = expanded[it.id];
              return (
                <View key={it.id} style={styles.itemBlock}>
                  <TouchableOpacity onPress={() => toggle(it.id)} style={styles.itemRow}>
                    <View style={styles.itemQuantity}>
                      <Text style={styles.itemQuantityText}>{it.quantity}</Text>
                    </View>
                    <Text style={styles.itemName}>{it.name}</Text>
                    <View style={styles.itemRight}>
                      <Text style={styles.itemPrice}>
                        ${Number(it.totalPrice).toFixed(2)}
                      </Text>
                      <Icon
                        name={open ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#6B7280"
                      />
                    </View>
                  </TouchableOpacity>
                  {open && (
                    <View style={styles.expandedContent}>
                      {renderIngredients(t('orderSummary.includedTitle'), it.includedIngredients)}
                      {renderIngredients(t('orderSummary.extraTitle'), it.extraIngredients)}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.sectionHeader}>
            <Icon name="receipt" size={20} color="#E53935" />
            <Text style={styles.sectionTitle}>{t('orderSummary.summaryTitle')}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>{t('orderSummary.subtotal')}</Text>
            <Text style={styles.summaryValue}>${priceNum.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>{t('orderSummary.delivery')}</Text>
            <Text style={styles.summaryValue}>${deliveryFeeNum.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>{t('orderSummary.taxes')}</Text>
            <Text style={styles.summaryValue}>${taxes.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('orderSummary.total')}</Text>
            <Text style={styles.totalAmount}>${totalNum.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={handleMercadoPago}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.loadingText}>{t('orderSummary.processing')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.paymentLogoContainer}>
                <Image
                  source={require('../assets/mercadopago.jpg')}
                  style={styles.paymentLogo}
                />
              </View>
              <Text style={styles.paymentButtonText}>{t('orderSummary.payWithMP')}</Text>
              <Icon name="arrow-right" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    elevation: 4,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  contentContainer: { padding: 16, paddingBottom: 24 },
  addressSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.5,
  },
  addressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  addressLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginLeft: 8 },
  addressText: { fontSize: 15, color: '#4B5563', marginBottom: 12, paddingLeft: 28 },
  noAddressText: {
    fontSize: 15,
    color: '#EF4444',
    fontStyle: 'italic',
    marginBottom: 12,
    paddingLeft: 28,
  },
  changeAddressButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  changeAddressText: { fontSize: 14, color: '#E53935', fontWeight: '600', marginRight: 4 },
  itemsContainer: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginLeft: 8 },
  itemBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.5,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center' },
  itemQuantity: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemQuantityText: { fontSize: 12, fontWeight: '700', color: '#4B5563' },
  itemName: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1 },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemPrice: { fontSize: 15, fontWeight: '700', color: '#E53935', marginRight: 8 },
  expandedContent: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  ingredientsContainer: { marginBottom: 8 },
  ingredientsTitle: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
  ingredientRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 12, marginBottom: 4 },
  ingredientBullet: { marginRight: 6, color: '#9CA3AF', fontSize: 16 },
  ingredientName: { fontSize: 14, color: '#4B5563', flex: 1 },
  ingredientPrice: { fontSize: 14, color: '#E53935', fontWeight: '600' },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.5,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingLeft: 28 },
  summaryText: { fontSize: 15, color: '#4B5563' },
  summaryValue: { fontSize: 15, color: '#111827', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12, marginLeft: 28 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 28 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalAmount: { fontSize: 18, fontWeight: '700', color: '#E53935' },
  footer: { padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  paymentButton: {
    flexDirection: 'row',
    backgroundColor: '#E53935',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  paymentLogoContainer: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 6, marginRight: 12 },
  paymentLogo: { width: 24, height: 24, resizeMode: 'contain' },
  paymentButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
