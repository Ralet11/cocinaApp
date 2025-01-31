// views/Terms.js
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

export default function Terms({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
      </View>

      {/* Contenido */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Placeholder de texto legal */}
        <Text style={styles.title}>Introduction</Text>
        <Text style={styles.paragraph}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ac orci eget 
          sapien laoreet tincidunt. Pellentesque habitant morbi tristique senectus et netus 
          et malesuada fames ac turpis egestas.
        </Text>

        <Text style={styles.title}>User Responsibilities</Text>
        <Text style={styles.paragraph}>
          Aenean egestas magna at porttitor vehicula. Praesent laoreet malesuada ultrices. 
          Nulla finibus, massa vitae placerat suscipit, magna augue commodo libero, at posuere 
          urna lectus id quam.
        </Text>

        <Text style={styles.title}>Changes to Terms</Text>
        <Text style={styles.paragraph}>
          Fusce luctus consequat faucibus. Nunc eget ligula ac risus vehicula placerat. Sed 
          quis magna at diam faucibus pretium in eu ligula.
        </Text>

        {/* Agrega más secciones según necesites */}
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4C1D95',
    marginBottom: 6,
    marginTop: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    lineHeight: 20,
  },
});
