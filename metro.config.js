// metro.config.js  —  para Expo SDK 53+
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Habilitamos el transformer para SVG
  config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  // Decimos a Metro que los .svg ya no son "assets", sino código fuente
  config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...config.resolver.sourceExts, 'svg'],
  };

  return config;
})();