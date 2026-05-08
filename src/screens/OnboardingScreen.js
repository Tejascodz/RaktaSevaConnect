import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    icon: 'water-drop',
    title: 'Find Blood Donors\nInstantly',
    desc: 'Connect with verified donors near you in seconds. Every drop counts when saving a life.',
    accent: COLORS.red,
  },
  {
    id: '2',
    icon: 'local-hospital',
    title: 'Hospital Emergency\nAlerts',
    desc: 'Hospitals can broadcast urgent blood requests to all matching donors in their area.',
    accent: '#448AFF',
  },
  {
    id: '3',
    icon: 'favorite',
    title: 'Save Lives\nTogether',
    desc: 'Join a network of heroes. Your single donation can save up to three lives.',
    accent: '#00C853',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 10000, useNativeDriver: true })
    ).start();
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const renderSlide = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = scrollX.interpolate({ inputRange, outputRange: [0.8, 1, 0.8], extrapolate: 'clamp' });
    const opacity = scrollX.interpolate({ inputRange, outputRange: [0.4, 1, 0.4], extrapolate: 'clamp' });
    const translateY = scrollX.interpolate({ inputRange, outputRange: [30, 0, 30], extrapolate: 'clamp' });

    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });

    const reverseSpin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['360deg', '0deg']
    });

    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale }, { translateY }], opacity, borderColor: item.accent + '30' }]}>
          <Animated.View style={[styles.iconInner, { backgroundColor: item.accent + '18', transform: [{ scale: pulseAnim }] }]}>
            <MaterialIcons name={item.icon} size={64} color={item.accent} />
          </Animated.View>
          <Animated.View style={[styles.glowRing, { borderColor: item.accent + '15', transform: [{ scale: pulseAnim }, { rotate: spin }] }]} />
          <Animated.View style={[styles.glowRing2, { borderColor: item.accent + '08', transform: [{ scale: pulseAnim }, { rotate: reverseSpin }] }]} />
        </Animated.View>

        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
        </Animated.View>
      </View>
    );
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      {/* Skip button */}
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('DonorLogin')} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfig}
      />

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity: dotOpacity, backgroundColor: COLORS.red }]}
              />
            );
          })}
        </View>

        {/* Action buttons */}
        {isLastSlide ? (
          <View style={styles.actionButtons}>
            {/* Donor button */}
            <TouchableOpacity style={styles.donorBtn} onPress={() => navigation.navigate('DonorLogin')} activeOpacity={0.85}>
              <MaterialIcons name="favorite" size={20} color="#fff" />
              <Text style={styles.donorBtnText}>I'm a Donor</Text>
            </TouchableOpacity>
            {/* Hospital button */}
            <TouchableOpacity style={styles.hospitalBtn} onPress={() => navigation.navigate('HospitalLogin')} activeOpacity={0.85}>
              <MaterialIcons name="local-hospital" size={20} color={COLORS.blue} />
              <Text style={styles.hospitalBtnText}>Hospital Portal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  skipBtn: {
    position: 'absolute',
    top: 54,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface2,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text2,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: height * 0.06,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    borderWidth: 2,
  },
  iconInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  glowRing2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
  },
  desc: {
    fontSize: 15,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: 10,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.red,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  donorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.red,
    borderRadius: RADIUS.full,
    paddingVertical: 16,
    elevation: 8,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  donorBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  hospitalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: RADIUS.full,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: COLORS.blue,
    backgroundColor: 'rgba(68,138,255,0.08)',
  },
  hospitalBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.blue,
  },
});
