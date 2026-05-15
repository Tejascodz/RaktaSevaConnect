import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { BLOOD_GROUPS, isDonorAvailable } from '../data/mockData';
import { DonorCard } from '../components/Cards';
import { useApp } from '../utils/AppContext';

export default function DonorsScreen({ route, navigation }) {
  const { donors } = useApp();
  const initialFilter = route?.params?.filterBlood || '';
  const [filter, setFilter] = useState(initialFilter);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Reset and restart animation on filter change
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
    ]).start();
  }, [filter]);

  const sortedDonors = useMemo(() => {
    const filtered = filter ? donors.filter(d => d.blood === filter) : donors;
    return [...filtered].sort((a, b) => {
      const aA = isDonorAvailable(a) ? 0 : 1;
      const bA = isDonorAvailable(b) ? 0 : 1;
      return aA - bA || (a.distance || 0) - (b.distance || 0);
    });
  }, [donors, filter]);

  const renderItem = ({ item }) => (
    <DonorCard donor={item} isAvail={isDonorAvailable(item)} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.h2}>Donor Directory</Text>
          <Text style={styles.sub}>Verified voluntary blood donors</Text>
        </View>
      </View>

      <View style={styles.filterBar}>
        <FlatList
          horizontal
          data={['All', ...BLOOD_GROUPS]}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item }) => {
            const isAll = item === 'All';
            const isActive = isAll ? !filter : filter === item;
            return (
              <TouchableOpacity
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setFilter(isAll ? '' : item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <Animated.View style={[styles.listContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <FlatList
          data={sortedDonors}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="person-off" size={64} color={COLORS.text3} />
              <Text style={styles.emptyTitle}>No Donors Found</Text>
              <Text style={styles.emptySub}>We couldn't find any donors for {filter || 'your selection'}.</Text>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.surface2, justifyContent: 'center', alignItems: 'center' },
  h2: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: 13, color: COLORS.text2, marginTop: 2 },
  filterBar: { height: 64, marginVertical: 4 },
  chipRow: { paddingHorizontal: 16, alignItems: 'center', gap: 8 },
  chip: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: 'rgba(220,20,60,0.12)', borderColor: COLORS.red },
  chipText: { fontSize: 13, fontWeight: '700', color: COLORS.text2 },
  chipTextActive: { color: COLORS.red },
  listContainer: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptySub: { fontSize: 13, color: COLORS.text2, marginTop: 4, textAlign: 'center' },
});

