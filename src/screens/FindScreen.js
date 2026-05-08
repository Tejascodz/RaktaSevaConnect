import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { RequestCard } from '../components/Cards';
import { useApp } from '../utils/AppContext';
import { useAlert } from '../components/CustomAlert';

export default function FindScreen() {
  const { requests, acceptRequest } = useApp();
  const { showAlert, showToast } = useAlert();
  const [query, setQuery] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true })
    ]).start();
  }, []);

  const filtered = requests.filter(r =>
    (r?.blood || '').toLowerCase().includes(query.toLowerCase()) ||
    (r?.hospital || '').toLowerCase().includes(query.toLowerCase())
  );

  const handleAccept = (req) => {
    acceptRequest(req.id);
    showAlert('Thank You! 🙏', `You accepted the ${req.blood} request at ${req.hospital}.\n\nThe hospital will contact you shortly.`);
    showToast('Request accepted successfully!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.h2}>Emergency Requests</Text>
        <Text style={styles.sub}>Respond to save a life nearby</Text>
      </View>
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={20} color={COLORS.text3} style={{ marginRight: 8 }} />
        <TextInput style={styles.searchInput} placeholder="Search by blood group or hospital..." placeholderTextColor={COLORS.text3} value={query} onChangeText={setQuery} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {filtered.length ? filtered.map(r => (
            <RequestCard key={r.id} request={r} onAccept={handleAccept} onShare={() => showToast('📋 Request link copied!')} />
          )) : (
            <View style={styles.empty}>
              <MaterialIcons name="search-off" size={64} color={COLORS.text3} />
              <Text style={styles.emptyTitle}>No Results</Text>
              <Text style={styles.emptySub}>Try a different search term</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 54, paddingBottom: 8 },
  h2: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: 13, color: COLORS.text2, marginTop: 2 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptySub: { fontSize: 13, color: COLORS.text2, marginTop: 4 },
});
