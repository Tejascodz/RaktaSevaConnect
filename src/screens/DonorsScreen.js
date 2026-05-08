import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';
import { BLOOD_GROUPS, isDonorAvailable } from '../data/mockData';
import { DonorCard } from '../components/Cards';
import { useApp } from '../utils/AppContext';

export default function DonorsScreen({ route }) {
  const { donors } = useApp();
  const initialFilter = route?.params?.filterBlood || '';
  const [filter, setFilter] = useState(initialFilter);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
    ]).start();
  }, [filter]); // Re-animate when filter changes

  const filtered = filter ? donors.filter(d => d.blood === filter) : donors;
  const sorted = [...filtered].sort((a, b) => {
    const aA = isDonorAvailable(a) ? 0 : 1;
    const bA = isDonorAvailable(b) ? 0 : 1;
    return aA - bA || a.distance - b.distance;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.h2}>Donor Directory</Text>
        <Text style={styles.sub}>Verified voluntary blood donors near you</Text>
      </View>
      <View style={{ height: 60 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <TouchableOpacity style={[styles.chip, !filter && styles.chipActive]} onPress={() => setFilter('')}>
            <Text style={[styles.chipText, !filter && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {BLOOD_GROUPS.map(g => (
            <TouchableOpacity key={g} style={[styles.chip, filter === g && styles.chipActive]} onPress={() => setFilter(g)}>
              <Text style={[styles.chipText, filter === g && styles.chipTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {sorted.map(d => <DonorCard key={d.id} donor={d} isAvail={isDonorAvailable(d)} />)}
          {sorted.length === 0 && <View style={styles.empty}><Text style={styles.emptyText}>No donors found for {filter}</Text></View>}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 4 },
  h2: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: 13, color: COLORS.text2, marginTop: 2 },
  chipRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: 'rgba(220,20,60,0.12)', borderColor: COLORS.red },
  chipText: { fontSize: 13, fontWeight: '700', color: COLORS.text2 },
  chipTextActive: { color: COLORS.red },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: COLORS.text3 },
});
