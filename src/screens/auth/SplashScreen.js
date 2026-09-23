import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import colors from '../../theme/colors';

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity, transform: [{ scale }] }]}>
        <View style={styles.outerRing}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>U</Text>
          </View>
        </View>
      </Animated.View>
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.appName}>UMUGANDA</Text>
        <Text style={styles.tagline}>Community. Together. Rwanda. 🇷🇼</Text>
      </Animated.View>
      <View style={styles.footer}>
        <View style={styles.dot} />
        <View style={[styles.dot, { opacity: 0.6 }]} />
        <View style={[styles.dot, { opacity: 0.3 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  logoWrap: { marginBottom: 32 },
  outerRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  logoCircle: {
    width: 94, height: 94, borderRadius: 47,
    backgroundColor: colors.white,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 12,
  },
  logoLetter: { fontSize: 50, fontWeight: 'bold', color: colors.primary },
  appName: { fontSize: 30, fontWeight: 'bold', color: colors.white, letterSpacing: 8, marginBottom: 8 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.85)', letterSpacing: 1 },
  footer: {
    position: 'absolute', bottom: 50,
    flexDirection: 'row', gap: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.white,
  },
});
