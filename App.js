// App.js
import React from 'react';
import 'react-native-get-random-values';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import DeepLinkHandler from './components/DeepLinkHandler';
import RootNavigator from './navigation'; // tu stack/tab navigator
import { store, persistor } from './redux/store';
import { STRIPE_PUBLISHABLE_KEY } from '@env';
import './i18n';

export default function App() {
  return (
    <Provider store={store}>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <PersistGate loading={null} persistor={persistor}>
    
            <RootNavigator />
     
        </PersistGate>
      </StripeProvider>
    </Provider>
  );
}
