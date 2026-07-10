module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|expo-router|@expo/vector-icons|react-navigation|@react-navigation/.*|@shopify/react-native-skia)',
  ],
};
