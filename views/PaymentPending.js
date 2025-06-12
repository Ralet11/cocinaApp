// views/Confirmation.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, ActivityIndicator, Alert, Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import * as WebBrowser from 'expo-web-browser';
import axios from 'react-native-axios';
import { API_URL } from '@env';

export default function PaymentSuccess({ navigation }) {
  const currentOrder   = useSelector((s) => s.order.currentOrder);
  const currentAddress = useSelector((s) => s.user.currentAddress);
  const [loading, setLoading] = useState(false);

  const { items = [], price = 0, deliveryFee = 0 } = currentOrder;
  const taxes = 0.54;
  const total = price + deliveryFee + taxes;

  /* ────────────────  MERCADO PAGO ──────────────── */
  const handleMercadoPago = async () => {
    if (!currentAddress) {
      Toast.show({ type: 'error', text1: 'Confirm address first' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        order: {
          user_id: currentOrder.user_id,
          partner_id: currentOrder.partner_id,
          deliveryAddress: currentAddress.street,
          price,
          deliveryFee,
          finalPrice: total.toFixed(2),
          taxes,
          email: currentOrder.email,
        },
        items,
      };

      const { data } = await axios.post(`${API_URL}/payment/mp/init`, payload);
      await WebBrowser.openBrowserAsync(data.init_point);
      // El DeepLinkHandler se encargará del regreso
    } catch (e) {
      console.error('Mercado Pago front error:', e);
      Alert.alert('Error', 'Could not start Mercado Pago');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------  UI --------------- */
  return (
    <SafeAreaView style={styles.container}>
     <Text>Hola Payment</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  
});
