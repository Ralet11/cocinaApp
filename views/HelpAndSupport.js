// views/HelpSupport.js
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

export default function HelpSupport({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </View>

      {/* Contenido */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Need Help?</Text>
        <Text style={styles.paragraph}>
          You can reach out to us at any time via the following channels:
        </Text>

        <View style={styles.helpItem}>
          <Icon name="email-outline" size={20} color="#6B7280" style={styles.helpIcon} />
          <Text style={styles.helpText}>support@myapp.com</Text>
        </View>

        <View style={styles.helpItem}>
          <Icon name="phone-outline" size={20} color="#6B7280" style={styles.helpIcon} />
          <Text style={styles.helpText}>+1 (555) 123-4567</Text>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Text style={styles.paragraph}>
          1. How do I reset my password?
        </Text>
        <Text style={styles.paragraph}>
          2. Where can I track my orders?
        </Text>
        <Text style={styles.paragraph}>
          3. How do I update my profile information?
        </Text>
        {/* Agrega más FAQ según necesites */}
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
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4C1D95',
    marginBottom: 8,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
    lineHeight: 20,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpIcon: {
    marginRight: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#4B5563',
  },
});
