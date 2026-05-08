import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { BLOOD_GROUPS, isDonorAvailable } from '../data/mockData';
import { RequestCard, DonorCard, BloodChip, StatCard } from '../components/Cards';
import { useApp } from '../utils/AppContext';
import { useAlert } from '../components/CustomAlert';

export default function HomeScreen({ navigation }) {
  const { donors, requests, unreadCount, acceptRequest } = useApp();
  const { showAlert, showToast } = useAlert();
  
  // Animation Values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const listFadeAnim = useRef(new Animated.Value(0)).current;
  const listTranslateAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // 1. Live Dot Heartbeat Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.8, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(600),
      ])
    ).start();

    // 2. Banner Glow Float Effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
      ])
    ).start();

    // 3. Staggered List Entry
    Animated.parallel([
      Animated.timing(listFadeAnim, { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
      Animated.spring(listTranslateAnim, { toValue: 0, tension: 50, friction: 7, delay: 100, useNativeDriver: true })
    ]).start();
  }, []);

  const availCount = donors.filter(isDonorAvailable).length;
  const criticalCount = requests.filter(r => r.urgency === 'critical').length;

  const handleAccept = (req) => {
    acceptRequest(req.id);
    showAlert('Thank You! 🙏', `You've accepted the ${req.blood} request at ${req.hospital}.\n\nThe hospital has been notified and will contact you shortly.`);
    showToast('Request accepted! Hospital notified.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MaterialIcons name="water-drop" size={22} color={COLORS.red} />
        </View>
        <Text style={styles.headerTitle}>Rakta-<Text style={{ color: COLORS.red }}>Seva</Text></Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Notifications')}>
          <MaterialIcons name="notifications" size={22} color={COLORS.text} />
          {unreadCount > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <TouchableOpacity style={styles.banner} activeOpacity={0.85} onPress={() => navigation.navigate('Find')}>
          <Animated.View style={[styles.bannerGlow, { 
            transform: [{ translateY: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 10] }) }],
            opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.6] }) 
          }]} />
          <View style={styles.bannerTag}>
            <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.bannerTagText}>LIVE EMERGENCY</Text>
          </View>
          <Text style={styles.bannerTitle}>🩸 {criticalCount} Critical Requests Nearby</Text>
          <Text style={styles.bannerSub}>Tap to view and respond to emergencies</Text>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <StatCard value={donors.length} label="Registered" color={COLORS.red} />
          <StatCard value={availCount} label="Available" color={COLORS.green} />
          <StatCard value={requests.length} label="Requests" color={COLORS.amber} />
        </View>

        <Animated.View style={{ opacity: listFadeAnim, transform: [{ translateY: listTranslateAnim }] }}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Blood Groups Available</Text></View>
          <View style={styles.bloodGrid}>
            {BLOOD_GROUPS.map(g => {
              const count = donors.filter(d => d.blood === g && isDonorAvailable(d)).length;
              return <BloodChip key={g} group={g} count={count} onPress={() => navigation.navigate('Donors', { filterBlood: g })} />;
            })}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Requests</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Find')}><Text style={styles.sectionLink}>See All</Text></TouchableOpacity>
          </View>
          <View style={styles.listPad}>
            {requests.slice(0, 3).map(r => (
              <RequestCard key={r.id} request={r} onAccept={handleAccept} onShare={() => showToast('📋 Request link copied!')} />
            ))}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Donors</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Donors')}><Text style={styles.sectionLink}>See All</Text></TouchableOpacity>
          </View>
          <View style={styles.listPad}>
            {donors.filter(isDonorAvailable).slice(0, 3).map(d => (
              <DonorCard key={d.id} donor={d} isAvail={true} />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12, gap: 10 },
  headerIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(220,20,60,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: COLORS.text },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface2, alignItems: 'center', justifyContent: 'center' },
  notifBadge: { position: 'absolute', top: -3, right: -3, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.bg },
  notifBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  banner: { marginHorizontal: 16, marginBottom: 16, padding: 18, borderRadius: RADIUS.lg, backgroundColor: 'rgba(220,20,60,0.12)', borderWidth: 1, borderColor: 'rgba(220,20,60,0.25)', overflow: 'hidden' },
  bannerGlow: { position: 'absolute', top: -50, right: -30, width: 180, height: 180, borderRadius: 90, backgroundColor: COLORS.red, opacity: 0.15 },
  bannerTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  bannerTagText: { fontSize: 10, fontWeight: '700', color: COLORS.red, letterSpacing: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.red },
  bannerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  bannerSub: { fontSize: 13, color: COLORS.text2 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  sectionLink: { fontSize: 12, fontWeight: '600', color: COLORS.red },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 24 },
  listPad: { paddingHorizontal: 16 },
});
