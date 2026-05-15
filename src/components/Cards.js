import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

export const RequestCard = memo(({ request, onAccept, onShare }) => {
  if (!request) return null;
  const urgency = request.urgency || 'high';
  const isCritical = urgency === 'critical';

  return (
    <View style={[styles.card, isCritical && styles.cardUrgent]}>
      <View style={styles.top}>
        <Text style={styles.blood}>{request.blood || 'O+'}</Text>
        <View style={[styles.badge, isCritical ? styles.badgeCritical : styles.badgeHigh]}>
          <Text style={[styles.badgeText, { color: isCritical ? COLORS.red : COLORS.amber }]}>
            {urgency.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.hospital}>{request.hospital || 'Hospital'}</Text>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="schedule" size={13} color={COLORS.text2} />
          <Text style={styles.metaText}>{request.time || 'Just now'}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="place" size={13} color={COLORS.text2} />
          <Text style={styles.metaText}>{request.distance || 'Nearby'}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="water-drop" size={13} color={COLORS.text2} />
          <Text style={styles.metaText}>{request.units || 1} unit{(request.units || 1) > 1 ? 's' : ''}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => onAccept?.(request)} activeOpacity={0.8}>
          <MaterialIcons name="volunteer-activism" size={16} color="#fff" />
          <Text style={styles.btnPrimaryText}>I Can Donate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnOutline} onPress={() => onShare?.(request)} activeOpacity={0.7}>
          <MaterialIcons name="share" size={16} color={COLORS.text2} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

export const DonorCard = memo(({ donor, isAvail }) => {
  if (!donor) return null;
  const name = donor.name || 'Unknown Donor';
  const initials = name.split(' ').map(w => w?.[0] || '').join('').substring(0, 2).toUpperCase() || 'U';
  const lastDonation = donor.lastDonation || '2025-01-01';

  // Safe calculation for days since donation
  let days = 0;
  try {
    const donationDate = new Date(lastDonation);
    if (!isNaN(donationDate.getTime())) {
      days = Math.floor((Date.now() - donationDate.getTime()) / (1000*60*60*24));
    }
  } catch (e) { console.error(e); }
  
  return (
    <View style={styles.donorCard}>
      <View style={styles.donorAvatar}>
        <Text style={styles.donorAvatarText}>{initials}</Text>
      </View>
      <View style={styles.donorInfo}>
        <Text style={styles.donorName}>{name}</Text>
        <View style={styles.donorDetail}>
          <MaterialIcons name="water-drop" size={13} color={COLORS.text2} />
          <Text style={styles.metaText}>{donor.blood || 'O+'} · {donor.distance || 1.0} km</Text>
        </View>
        <View style={styles.donorDetail}>
          <MaterialIcons name="event" size={13} color={COLORS.text2} />
          <Text style={styles.metaText}>Donated {days < 0 ? 0 : days} days ago</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, isAvail ? styles.statusAvail : styles.statusUnavail]}>
        <Text style={[styles.statusText, { color: isAvail ? COLORS.green : COLORS.text3 }]}>
          {isAvail ? 'Available' : '90-day wait'}
        </Text>
      </View>
    </View>
  );
});

export const BloodChip = memo(({ group, count, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.chipGroup}>{group}</Text>
      <Text style={styles.chipCount}>{count} donor{count !== 1 ? 's' : ''}</Text>
    </TouchableOpacity>
  );
});

export const StatCard = memo(({ value, label, color }) => {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statNum, { color }]}>{value || 0}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.bg2, borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cardUrgent: { borderLeftWidth: 3, borderLeftColor: COLORS.red },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  blood: { fontSize: 28, fontWeight: '900', color: COLORS.red },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  badgeCritical: { backgroundColor: COLORS.redLight },
  badgeHigh: { backgroundColor: COLORS.amberLight },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  hospital: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  metaRow: { flexDirection: 'row', gap: 14, marginBottom: SPACING.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.text2 },
  actions: { flexDirection: 'row', gap: 8 },
  btnPrimary: { flex: 1, backgroundColor: COLORS.red, borderRadius: RADIUS.full, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  btnPrimaryText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  btnOutline: { width: 44, height: 44, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  donorCard: { backgroundColor: COLORS.bg2, borderRadius: RADIUS.md, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  donorAvatar: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center' },
  donorAvatarText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  donorInfo: { flex: 1 },
  donorName: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  donorDetail: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusAvail: { backgroundColor: COLORS.greenLight },
  statusUnavail: { backgroundColor: COLORS.surface },
  statusText: { fontSize: 9, fontWeight: '600' },
  chip: { width: '22%', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipSelected: { borderColor: COLORS.red, backgroundColor: COLORS.redLight },
  chipGroup: { fontSize: 17, fontWeight: '800', color: COLORS.red },
  chipCount: { fontSize: 10, color: COLORS.text2, marginTop: 2 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: COLORS.text2, marginTop: 2 },
});
