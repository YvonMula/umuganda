import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import colors from '../theme/colors';

/**
 * SkeletonLoader - Animated placeholder for loading content
 * 
 * Features:
 * - Smooth shimmer animation
 * - Customizable width, height, borderRadius
 * - Multiple variants (text, circle, image, avatar)
 * - Improves perceived performance
 * 
 * Usage:
 * <SkeletonLoader width="80%" height={20} variant="text" />
 * <SkeletonLoader width={50} height={50} variant="circle" />
 */
export default function SkeletonLoader({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  variant = 'rectangular', // 'rectangular' | 'circular' | 'text'
  style,
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const skeletonStyle = {
    width,
    height,
    borderRadius: variant === 'circular' ? height / 2 : borderRadius,
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        skeletonStyle,
        { opacity },
        style,
      ]}
    />
  );
}

/**
 * SkeletonCard - Pre-built card skeleton for list items
 */
export function SkeletonCard({ variant = 'news' }) {
  if (variant === 'news') {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <SkeletonLoader width={48} height={48} variant="circular" />
          <View style={styles.cardHeaderText}>
            <SkeletonLoader width="60%" height={14} />
            <SkeletonLoader width="40%" height={12} style={{ marginTop: 6 }} />
          </View>
        </View>
        <SkeletonLoader width="100%" height={16} style={{ marginTop: 12 }} />
        <SkeletonLoader width="85%" height={16} style={{ marginTop: 6 }} />
        <SkeletonLoader width="30%" height={12} style={{ marginTop: 10 }} />
      </View>
    );
  }

  if (variant === 'task') {
    return (
      <View style={styles.card}>
        <View style={styles.taskRow}>
          <SkeletonLoader width={90} height={90} borderRadius={12} />
          <View style={styles.taskContent}>
            <SkeletonLoader width="80%" height={16} />
            <SkeletonLoader width="60%" height={12} style={{ marginTop: 8 }} />
            <View style={styles.taskMeta}>
              <SkeletonLoader width={60} height={20} borderRadius={10} />
              <SkeletonLoader width={80} height={20} borderRadius={10} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (variant === 'room') {
    return (
      <View style={styles.card}>
        <View style={styles.roomRow}>
          <SkeletonLoader width={50} height={50} variant="circular" />
          <View style={styles.roomContent}>
            <SkeletonLoader width="70%" height={16} />
            <SkeletonLoader width="90%" height={12} style={{ marginTop: 6 }} />
            <SkeletonLoader width="50%" height={12} style={{ marginTop: 6 }} />
          </View>
        </View>
      </View>
    );
  }

  return null;
}

/**
 * SkeletonList - Multiple skeleton cards for list loading
 */
export function SkeletonList({ count = 3, variant = 'news' }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant={variant} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.lightGray,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  taskRow: {
    flexDirection: 'row',
    gap: 12,
  },
  taskContent: {
    flex: 1,
    justifyContent: 'center',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  roomRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  roomContent: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
});
