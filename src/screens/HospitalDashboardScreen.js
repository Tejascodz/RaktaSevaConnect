import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { BLOOD_GROUPS, isDonorAvailable } from '../data/mockData';
import { useApp } from '../utils/AppContext';
import { useAlert } from '../components/CustomAlert';

export default function HospitalDashboardScreen({ navigation }) {
  const { hospital, donors, requests, addRequest, logoutHospital, sendDonorRequest } = useApp();
  const { showAlert, showToast } = useAlert();
  const [showModal, setShowModal] = useState(false);
  const [blood, setBlood] = useState('');
  const [units, setUnits] = useState('1');
  const [contact, setContact] = useState('');
  const [urgency, setUrgency] = useState('critical');

  if (!hospital) return null;

  const myRequests = requests.filter(r => r.hospital === hospital.name || r.hospitalCode === hospital.code);
  const nearbyDonors = donors.filter(isDonorAvailable);
  const totalAccepted = myRequests.reduce((sum, r) => sum + (r.accepted?.length || 0), 0);

  const handlePostRequest = () => {
    if (!blood || !contact) { showAlert('Missing Fields', 'Please select blood group and enter contact person.'); return; }
    addRequest({ blood, units: parseInt(units) || 1, hospital: hospital.name, hospitalCode: hospital.code, urgency, contact });
    setShowModal(false);
    setBlood(''); setUnits('1'); setContact('');
    showAlert('🚨 Alert Sent!', `Emergency request for ${blood} blood (${units} units) has been pushed to all ${nearbyDonors.filter(d => d.blood === blood).length} matching donors within 10km!`,
      [{ text: 'OK' }]);
    showToast(`Alert sent to matching ${blood} donors!`);
  };

  const handleLogout = () => {
    showAlert('Log Out', 'Are you sure you want to log out of hospital portal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', onPress: () => { logoutHospital(); navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }); } },
    ]);
  };

  const handleSendRequest = (donor) => {
    showAlert('Send Direct Request', `Ask ${donor.name} to donate ${donor.blood} blood at your hospital?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send Request', onPress: () => {
        sendDonorRequest(donor, donor.blood, hospital.name);
        showToast(`Request sent to ${donor.name} ✅`);
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.hospBadge}><MaterialIcons name="local-hospital" size={20} color={COLORS.blue} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.hospName} numberOfLines={1}>{hospital.name}</Text>
          <Text style={styles.hospCode}>Code: {hospital.code}</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={COLORS.text2} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.red }]}>{myRequests.length}</Text>
            <Text style={styles.statLabel}>My Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.green }]}>{totalAccepted}</Text>
            <Text style={styles.statLabel}>Donors Responded</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: COLORS.amber }]}>{nearbyDonors.length}</Text>
            <Text style={styles.statLabel}>Available Nearby</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setShowModal(true)} activeOpacity={0.85}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(220,20,60,0.12)' }]}>
              <MaterialIcons name="campaign" size={24} color={COLORS.red} />
            </View>
            <Text style={styles.actionTitle}>Post Emergency</Text>
            <Text style={styles.actionDesc}>Send mass alert</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Blood Availability (10km)</Text></View>
        <View style={styles.bloodGrid}>
          {BLOOD_GROUPS.map(g => {
            const avail = donors.filter(d => d.blood === g && isDonorAvailable(d)).length;
            return (
              <View key={g} style={styles.bloodItem}>
                <Text style={styles.bloodGroup}>{g}</Text>
                <Text style={[styles.bloodCount, { color: avail > 0 ? COLORS.green : COLORS.red }]}>{avail}</Text>
                <Text style={styles.bloodLabel}>donors</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>My Active Requests</Text></View>
        <View style={styles.listPad}>
          {myRequests.length > 0 ? myRequests.map(r => (
            <View key={r.id} style={[styles.reqCard, r.urgency === 'critical' && styles.reqCardUrgent]}>
              <View style={styles.reqTop}>
                <Text style={styles.reqBlood}>{r.blood}</Text>
                <View style={[styles.reqBadge, r.urgency === 'critical' ? styles.badgeCrit : styles.badgeHigh]}>
                  <Text style={[styles.reqBadgeText, { color: r.urgency === 'critical' ? COLORS.red : COLORS.amber }]}>{r.urgency.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.reqHospital}>{r.units} units · {r.time}</Text>
              <View style={styles.reqResponded}>
                <MaterialIcons name="check-circle" size={14} color={COLORS.green} />
                <Text style={styles.reqRespondedText}>{r.accepted?.length || 0} donor(s) responded</Text>
              </View>
              {r.accepted?.length > 0 && (
                <View style={styles.acceptedDonors}>
                  <Text style={styles.acceptedLabel}>Responding Donors:</Text>
                  {r.accepted.map((name, i) => <Text key={i} style={styles.acceptedName}>• {name}</Text>)}
                </View>
              )}
            </View>
          )) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="inbox" size={48} color={COLORS.text3} />
              <Text style={styles.emptyText}>No requests posted yet</Text>
              <Text style={styles.emptySubtext}>Tap "Post Emergency" to create one</Text>
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Available Donors Nearby</Text></View>
        <View style={styles.listPad}>
          {nearbyDonors.map(d => {
            const initials = d.name.split(' ').map(w => w[0]).join('');
            return (
              <View key={d.id} style={styles.donorRow}>
                <View style={styles.donorAvatar}><Text style={styles.donorInitials}>{initials}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.donorName}>{d.name}</Text>
                  <Text style={styles.donorMeta}>{d.blood} · {d.distance} km</Text>
                </View>
                <TouchableOpacity style={styles.donorReqBtn} onPress={() => handleSendRequest(d)}>
                  <MaterialIcons name="send" size={14} color={COLORS.blue} />
                  <Text style={styles.donorReqText}>Request</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} activeOpacity={0.85} onPress={() => setShowModal(true)}>
        <MaterialIcons name="campaign" size={26} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🚨 Post Emergency Request</Text>
            <Text style={styles.modalSub}>Alert will be sent to all matching donors within 10km</Text>

            <Text style={styles.label}>BLOOD GROUP *</Text>
            <View style={styles.modalBloodGrid}>
              {BLOOD_GROUPS.map(g => (
                <TouchableOpacity key={g} style={[styles.modalChip, blood === g && styles.modalChipActive]} onPress={() => setBlood(g)}>
                  <Text style={[styles.modalChipText, blood === g && styles.modalChipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>URGENCY</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {['critical', 'high'].map(u => (
                <TouchableOpacity key={u} style={[styles.urgChip, urgency === u && (u === 'critical' ? styles.urgCritActive : styles.urgHighActive)]} onPress={() => setUrgency(u)}>
                  <Text style={[styles.urgText, urgency === u && { color: u === 'critical' ? COLORS.red : COLORS.amber }]}>{u.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>UNITS REQUIRED</Text>
            <TextInput style={styles.modalInput} value={units} onChangeText={setUnits} keyboardType="number-pad" />

            <Text style={styles.label}>CONTACT PERSON *</Text>
            <TextInput style={styles.modalInput} value={contact} onChangeText={setContact} placeholder="Doctor / Staff name" placeholderTextColor={COLORS.text3} />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.postBtn} onPress={handlePostRequest} activeOpacity={0.85}>
                <MaterialIcons name="campaign" size={18} color="#fff" />
                <Text style={styles.postText}>Send Alert</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12, gap: 12 },
  hospBadge: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.blueLight, justifyContent: 'center', alignItems: 'center' },
  hospName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  hospCode: { fontSize: 11, color: COLORS.text2, marginTop: 1 },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.surface2, justifyContent: 'center', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  statNum: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 10, color: COLORS.text2, marginTop: 2, textAlign: 'center' },
  quickActions: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 20 },
  actionCard: { flex: 1, padding: 16, borderRadius: RADIUS.md, backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  actionIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  actionDesc: { fontSize: 11, color: COLORS.text2, marginTop: 2 },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 20 },
  bloodItem: { width: '22%', alignItems: 'center', paddingVertical: 12, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  bloodGroup: { fontSize: 16, fontWeight: '800', color: COLORS.red },
  bloodCount: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  bloodLabel: { fontSize: 9, color: COLORS.text3 },
  listPad: { paddingHorizontal: 16, marginBottom: 16 },
  reqCard: { padding: 14, borderRadius: RADIUS.sm, backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  reqCardUrgent: { borderLeftWidth: 3, borderLeftColor: COLORS.red },
  reqTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reqBlood: { fontSize: 22, fontWeight: '900', color: COLORS.red },
  reqBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeCrit: { backgroundColor: 'rgba(220,20,60,0.15)' },
  badgeHigh: { backgroundColor: COLORS.amberLight },
  reqBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  reqHospital: { fontSize: 12, color: COLORS.text2, marginBottom: 6 },
  reqResponded: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reqRespondedText: { fontSize: 12, color: COLORS.green, fontWeight: '500' },
  acceptedDonors: { marginTop: 10, padding: 10, backgroundColor: COLORS.surface, borderRadius: RADIUS.sm },
  acceptedLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text2, marginBottom: 4 },
  acceptedName: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, fontWeight: '600', color: COLORS.text2, marginTop: 12 },
  emptySubtext: { fontSize: 12, color: COLORS.text3, marginTop: 4 },
  donorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  donorAvatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.red, justifyContent: 'center', alignItems: 'center' },
  donorInitials: { fontSize: 16, fontWeight: '700', color: '#fff' },
  donorName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  donorMeta: { fontSize: 12, color: COLORS.text2, marginTop: 2 },
  donorReqBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.blueLight },
  donorReqText: { fontSize: 12, fontWeight: '700', color: COLORS.blue },
  fab: { position: 'absolute', bottom: 24, right: 16, width: 56, height: 56, borderRadius: 18, backgroundColor: COLORS.blue, alignItems: 'center', justifyContent: 'center', elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: COLORS.bg2, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, borderRadius: 4, backgroundColor: COLORS.surface2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  modalSub: { fontSize: 12, color: COLORS.text2, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.text2, letterSpacing: 1, marginBottom: 8, marginTop: 14 },
  modalBloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalChip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  modalChipActive: { backgroundColor: 'rgba(220,20,60,0.12)', borderColor: COLORS.red },
  modalChipText: { fontSize: 15, fontWeight: '800', color: COLORS.text3 },
  modalChipTextActive: { color: COLORS.red },
  urgChip: { flex: 1, paddingVertical: 10, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  urgCritActive: { backgroundColor: 'rgba(220,20,60,0.12)', borderColor: COLORS.red },
  urgHighActive: { backgroundColor: COLORS.amberLight, borderColor: COLORS.amber },
  urgText: { fontSize: 12, fontWeight: '700', color: COLORS.text3 },
  modalInput: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: 12, fontSize: 14, color: COLORS.text },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '600', color: COLORS.text2 },
  postBtn: { flex: 2, paddingVertical: 14, borderRadius: RADIUS.full, backgroundColor: COLORS.red, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  postText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
