// components/DeepLinkHandler.js
import React, { useEffect } from 'react';
import { Linking } from 'react-native';

const DeepLinkHandler = ({ onDeepLink }) => {
  useEffect(() => {
    const handleUrl = (event) => {
      const { url } = event;
      console.log('Deep link recibido:', url);
      onDeepLink(url);
    };

    // Escucha los eventos de deep link
    const subscription = Linking.addEventListener('url', handleUrl);

    // Revisa si la app se abrió mediante un deep link inicialmente
    Linking.getInitialURL().then((url) => {
      if (url) {
        onDeepLink(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [onDeepLink]);

  return null;
};

export default DeepLinkHandler;
