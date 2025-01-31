// views/Coupons.js
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Coupons({ navigation }) {
  const dummyCoupons = [
    { id: 1, code: 'WELCOME10', description: '10% off on your first order' },
    { id: 2, code: 'FREESHIP', description: 'Free shipping over $50' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Coupons</Text>
      </View>

      {/* Contenido */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {dummyCoupons.length === 0 ? (
          <Text style={styles.emptyText}>No coupons available.</Text>
        ) : (
          dummyCoupons.map((coupon) => (
            <View key={coupon.id} style={styles.couponCard}>
              <Text style={styles.couponCode}>{coupon.code}</Text>
              <Text style={styles.couponDesc}>{coupon.description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginLeft: 16,
  },
  contentContainer: {
    padding: 16,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
  couponCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  couponCode: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4C1D95',
    marginBottom: 4,
  },
  couponDesc: {
    fontSize: 14,
    color: '#4B5563',
  },
});
