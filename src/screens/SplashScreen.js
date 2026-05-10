import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../utils/theme';
import { useApp } from '../utils/AppContext';

export default function SplashScreen({ navigation }) {
  const { user, hospital, isLoading } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: false }),
    ]).start();
    
    Animated.timing(barAnim, { toValue: 1, duration: 2000, useNativeDriver: false }).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: false }),
      ])
    ).start();
    
    // Set ready after 2.5 seconds minimum visual display
    const timer = setTimeout(() => setIsReady(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only navigate when both the animations have finished AND data has loaded
    if (isReady && !isLoading) {
      if (user) {
        navigation.replace('Main');
      } else if (hospital) {
        navigation.replace('HospitalMain');
      } else {
        navigation.replace('Onboarding');
      }
    }
  }, [isReady, isLoading, user, hospital, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: pulseAnim }] }]}>
          <MaterialIcons name="water-drop" size={56} color={COLORS.red} />
        </Animated.View>
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
