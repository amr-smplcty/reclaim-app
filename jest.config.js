module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|expo-router|expo-modules-core|standard-navigation|@expo/vector-icons|react-navigation|@react-navigation/.*|@shopify/react-native-skia|react-native-purchases|@revenuecat/.*)',
  ],
};
