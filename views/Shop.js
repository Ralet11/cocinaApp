// views/Shop.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Shop({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shop Screen</Text>
      <Button title="Volver a HomeTabs" onPress={() => navigation.navigate('HomeTabs')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,  
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff', 
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});
