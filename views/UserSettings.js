// views/UserSettings.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function UserSettings({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Settings Screen</Text>
      <Button title="Volver a Profile" onPress={() => navigation.navigate('ProfileTab')} />
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
