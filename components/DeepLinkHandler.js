// components/DeepLinkHandler.jsx
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';

const SCREEN_MAP = {
  'payment-success': 'PaymentSuccess',
  'payment-failure': 'PaymentFailure',
  'payment-pending': 'PaymentPending',
};

export default function DeepLinkHandler() {
  const navigation = useNavigation();

  function routeFromUrl(url) {
    const { path, queryParams } = Linking.parse(url);   // ← usa “path”
    if (SCREEN_MAP[path]) {
      navigation.reset({
        index: 0,
        routes: [{ name: SCREEN_MAP[path], params: queryParams }],
      });
    }
  }

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => routeFromUrl(url));
    Linking.getInitialURL().then(url => url && routeFromUrl(url));
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null; // no UI
}
