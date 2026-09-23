import { Image as ExpoImage } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import colors from '../theme/colors';

/**
 * OptimizedImage - Image component with caching, loading, and error states
 * 
 * Features:
 * - Automatic caching via expo-image
 * - Loading placeholder
 * - Error fallback
 * - Fade-in animation
 * - Customizable placeholder and error components
 * 
 * Usage:
 * <OptimizedImage
 *   source={{ uri: 'https://example.com/image.jpg' }}
 *   style={{ width: 200, height: 200 }}
 *   contentFit="cover"
 * />
 */
export default function OptimizedImage({ 
  source, 
  style, 
  contentFit = 'cover',
  placeholder,
  showLoading = true,
  errorText = 'Failed to load',
  ...props 
}) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'

  const placeholderComponent = (
    <View style={[styles.placeholder, style]}>
      <ActivityIndicator size="small" color={colors.primary} />
    </View>
  );

  const errorComponent = (
    <View style={[styles.errorContainer, style]}>
      <Text style={styles.errorIcon}>📷</Text>
      <Text style={styles.errorText}>{errorText}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ExpoImage
        source={source}
        style={[styles.image, style]}
        contentFit={contentFit}
        transition={200}
        cachePolicy="memory-disk"
        onLoad={() => setStatus('success')}
        onError={(error) => {
          console.error('Image load error:', error);
          setStatus('error');
        }}
        placeholder={placeholder}
        {...props}
      />
      
      {status === 'loading' && showLoading && placeholderComponent}
      {status === 'error' && errorComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  errorIcon: {
    fontSize: 32,
  },
  errorText: {
    fontSize: 12,
    color: colors.mediumGray,
    textAlign: 'center',
  },
});
