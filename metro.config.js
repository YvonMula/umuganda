const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure we're using classic entry point, not expo-router
config.resolver.mainFields = ['main', 'module'];

module.exports = config;
