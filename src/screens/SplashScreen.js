import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
    Animated.timing(barAnim, { toValue: 1, duration: 2000, useNativeDriver: false }).start();
    const timer = setTimeout(() => navigation.replace('Onboarding'), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="water-drop" size={56} color={COLORS.red} />
        </View>
        <Text style={styles.title}>Rakta-<Text style={{ color: COLORS.red }}>Seva</Text></Text>
        <Text style={styles.subtitle}>Life-Saving Blood Donor Network</Text>
        <View style={styles.loaderTrack}>
          <Animated.View style={[styles.loaderFill, { width: barAnim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }) }]} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' },
  inner: { alignItems: 'center' },
  iconWrap: { width: 100, height: 100, borderRadius: 28, backgroundColor: 'rgba(220,20,60,0.12)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.text2, marginTop: 8 },
  loaderTrack: { width: 140, height: 3, backgroundColor: COLORS.surface2, borderRadius: 4, marginTop: 32, overflow: 'hidden' },
  loaderFill: { height: '100%', backgroundColor: COLORS.red, borderRadius: 4 },
});
