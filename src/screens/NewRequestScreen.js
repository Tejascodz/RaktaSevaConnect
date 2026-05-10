import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { BLOOD_GROUPS } from '../data/mockData';
import { useApp } from '../utils/AppContext';
import { useAlert } from '../components/CustomAlert';
import { validatePhone } from '../utils/AppContext';

export default function NewRequestScreen({ navigation }) {
  const { addRequest, donors, user } = useApp();
  const { showAlert, showToast } = useAlert();
  const [blood, setBlood] = useState('');
  const [units, setUnits] = useState('1');
  const [hospital, setHospital] = useState('');
  const [contact, setContact] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');

  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: false })
    ]).start();
  }, []);

  const handleSubmit = () => {
    if (!blood) { showAlert('Missing Field', 'Please select a blood group.'); return; }
    if (!hospital || hospital.trim().length < 3) { showAlert('Missing Field', 'Please enter a valid hospital name.'); return; }
    if (!contact) { showAlert('Missing Field', 'Please enter the contact person.'); return; }

    const phoneResult = validatePhone(contactPhone);
    if (!phoneResult.valid) {
      showAlert('Invalid Phone', 'Please enter a valid 10-digit emergency contact phone number.');
      return;
    }

    const matchCount = donors.filter(d => {
      if (d.blood !== blood) return false;
      const days = (Date.now() - new Date(d.lastDonation).getTime()) / (1000*60*60*24);
      return d.available && days >= 90 && d.distance <= 10;
    }).length;

    addRequest({ blood, units: parseInt(units) || 1, hospital, urgency: 'critical', contact, contactPhone: phoneResult.phone });

    showAlert(
      '🚨 Emergency Alert Sent!',
      `Alert pushed to ${matchCount} matching ${blood} donors within 10km.\n\n🏥 Hospital: ${hospital}\n💉 Units: ${units}\n📞 Contact: ${phoneResult.phone}\n\nDonors will be notified within seconds.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
    showToast(`🚨 Alert sent to ${matchCount} ${blood} donors!`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.h2}>🚨 New Emergency Request</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.urgentBanner}>
            <MaterialIcons name="campaign" size={24} color={COLORS.red} />
            <Text style={styles.urgentText}>This will send an instant alert to all matching donors within 10km radius</Text>
          </View>

          <Text style={styles.label}>BLOOD GROUP NEEDED *</Text>
          <View style={styles.bloodGrid}>
            {BLOOD_GROUPS.map(g => (
              <TouchableOpacity key={g} style={[styles.bloodChip, blood === g && styles.bloodChipActive]} onPress={() => setBlood(g)}>
                <Text style={[styles.bloodText, blood === g && styles.bloodTextActive]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>UNITS REQUIRED *</Text>
          <TextInput style={styles.input} value={units} onChangeText={setUnits} keyboardType="number-pad" placeholder="1" placeholderTextColor={COLORS.text3} />

          <Text style={styles.label}>HOSPITAL NAME *</Text>
          <TextInput style={styles.input} value={hospital} onChangeText={setHospital} placeholder="Enter hospital name" placeholderTextColor={COLORS.text3} />

          <Text style={styles.label}>CONTACT PERSON *</Text>
          <TextInput style={styles.input} value={contact} onChangeText={setContact} placeholder="Doctor / Attendant name" placeholderTextColor={COLORS.text3} />

          <Text style={styles.label}>EMERGENCY PHONE *</Text>
          <TextInput style={styles.input} value={contactPhone} onChangeText={setContactPhone} placeholder="10-digit emergency number" placeholderTextColor={COLORS.text3} keyboardType="phone-pad" maxLength={13} />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <MaterialIcons name="campaign" size={22} color="#fff" />
            <Text style={styles.submitText}>Send Emergency Alert</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.surface2, justifyContent: 'center', alignItems: 'center' },
  h2: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  urgentBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: RADIUS.sm, backgroundColor: 'rgba(220,20,60,0.12)', marginBottom: 20 },
  urgentText: { flex: 1, fontSize: 13, color: COLORS.red, fontWeight: '500', lineHeight: 18 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.text2, letterSpacing: 1, marginBottom: 8, marginTop: 18 },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, padding: 14, fontSize: 15, color: COLORS.text },
  bloodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  bloodChip: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.border },
  bloodChipActive: { backgroundColor: 'rgba(220,20,60,0.12)', borderColor: COLORS.red },
  bloodText: { fontSize: 16, fontWeight: '800', color: COLORS.text2 },
  bloodTextActive: { color: COLORS.red },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.red, borderRadius: RADIUS.full, paddingVertical: 16, marginTop: 32, elevation: 6, shadowColor: COLORS.red, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
