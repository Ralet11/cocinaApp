import React from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PaymentFailure({ navigation }) {
  const handleGoHome = () => {
    navigation.navigate('HomeTabs');
  };

  const handleTryAgain = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Icon name="close-circle" size={80} color="#EF4444" />
        </View>
        
        {/* Error Message */}
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.message}>
          We couldn't process your payment. Please check your payment details and try again.
        </Text>
        
        {/* Possible Reasons */}
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>Possible reasons:</Text>
          <View style={styles.reasonItem}>
            <Icon name="circle-small" size={24} color="#6B7280" />
            <Text style={styles.reasonText}>Insufficient funds</Text>
          </View>
          <View style={styles.reasonItem}>
            <Icon name="circle-small" size={24} color="#6B7280" />
            <Text style={styles.reasonText}>Card expired or invalid</Text>
          </View>
          <View style={styles.reasonItem}>
            <Icon name="circle-small" size={24} color="#6B7280" />
            <Text style={styles.reasonText}>Payment service unavailable</Text>
          </View>
        </View>
        
        {/* Order ID */}
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdLabel}>Reference ID:</Text>
          <Text style={styles.orderId}>{generateRandomId()}</Text>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.tryAgainButton}
          onPress={handleTryAgain}
          activeOpacity={0.8}
        >
          <Icon name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.tryAgainButtonText}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={handleGoHome}
          activeOpacity={0.8}
        >
          <Icon name="home" size={20} color="#4B5563" />
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
      
      {/* Support Link */}
      <TouchableOpacity style={styles.supportLink}>
        <Icon name="headset" size={16} color="#E53935" />
        <Text style={styles.supportLinkText}>Contact Support</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Helper function to generate a random order ID
function generateRandomId() {
  return 'ERR-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  reasonsContainer: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  reasonsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#4B5563',
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIdLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  buttonsContainer: {
    padding: 24,
    paddingTop: 0,
  },
  tryAgainButton: {
    flexDirection: 'row',
    backgroundColor: '#E53935',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tryAgainButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  homeButton: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  homeButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  supportLinkText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
});