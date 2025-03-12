import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Toast from 'react-native-toast-message'; // Importa el Toast
import { StripeProvider } from '@stripe/stripe-react-native';
import AppNavigation from './navigation';
import { store, persistor } from './redux/store'; // Ajusta la ruta si es necesario
import toastConfig from './components/toastConfig';
import 'react-native-get-random-values';
import DeepLinkHandler from './components/DeepLinkHandler';


export default function App() {
  const handleDeepLink = (url) => {
    console.log('Deep link recibido:', url);
    // Aquí podrías, por ejemplo, navegar a una pantalla específica según la URL.
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <StripeProvider publishableKey="pk_test_51OJV6vCtqRjqS5ch2BT38s88U8qgkJeqWLZ8ODgOfB95sfshzLQw8gvkcmu4yplXKbuL8nnO85We2r1Ie7nYQkue00FX8swMRF">
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <DeepLinkHandler onDeepLink={handleDeepLink} />
          <AppNavigation />
          <Toast />
        </SafeAreaView>
        </StripeProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
