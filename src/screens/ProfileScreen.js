import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { useApp } from '../utils/AppContext';
import { useAlert } from '../components/CustomAlert';

export default function ProfileScreen({ navigation }) {
  const { user, toggleAvailability, logoutDonor } = useApp();
  const { showAlert, showToast } = useAlert();

  if (!user) return <View style={styles.container}><Text style={{ color: COLORS.text, textAlign: 'center', marginTop: 100 }}>Please register first</Text></View>;

  const initials = user.name.split(' ').map(w => w[0]).join('');
  
  const handleLogout = () => {
    showAlert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => { logoutDonor(); navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] }); } },
    ]);
  };

  const handleToggle = () => {
    toggleAvailability();
    showToast(user.available ? 'Marked as unavailable' : 'Marked as available ✅');
  };

  const showHistory = () => {
    showAlert('Donation History', 'Blood Group: ' + user.blood + '\nTotal Donations: 1\nLast Donation: ' + user.lastDonation + '\n\nThank you for saving lives! 🩸', [{ text: 'Close' }]);
  };

  const showAbout = () => {
    showAlert('About Rakta-Seva Connect', 'Version: 1.0.0 (Build 42)\nDeveloped by: DeepMind Team\n\nA world-class emergency blood donor network connecting hospitals and donors in the golden hour.', [{ text: 'Awesome!' }]);
  };

  const menuItems = [
    { icon: 'water-drop', label: `Blood Group: ${user.blood}`, color: 'rgba(220,20,60,0.12)', iconColor: COLORS.red, onPress: () => showToast(`Blood Group: ${user.blood}`) },
    { icon: 'phone', label: `Phone: ${user.phone}`, color: COLORS.greenLight, iconColor: COLORS.green, onPress: () => showToast(`Phone: ${user.phone}`) },
    { icon: 'location-on', label: `Location: ${user.city}`, color: COLORS.amberLight, iconColor: COLORS.amber, onPress: () => showToast(`Location: ${user.city}`) },
    { icon: 'event', label: `Last Donation: ${user.lastDonation}`, color: COLORS.blueLight, iconColor: COLORS.blue, onPress: () => showToast(`Last Donation: ${user.lastDonation}`) },
    { icon: 'history', label: 'Donation History', color: COLORS.blueLight, iconColor: COLORS.blue, onPress: showHistory },
    { icon: 'security', label: 'Privacy Settings', color: COLORS.greenLight, iconColor: COLORS.green, onPress: () => showToast('Privacy settings updated') },
    { icon: 'info', label: 'About Rakta-Seva', color: 'rgba(220,20,60,0.12)', iconColor: COLORS.red, onPress: showAbout },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.blood}>Blood Group: {user.blood}</Text>
        </View>
        <View style={styles.toggleCard}>
          <View>
            <Text style={styles.toggleLabel}>Available to Donate</Text>
            <Text style={styles.toggleSub}>Auto-disabled for 90 days post donation</Text>
          </View>
          <TouchableOpacity style={[styles.toggle, user.available && styles.toggleOn]} onPress={handleToggle} activeOpacity={0.8}>
            <View style={[styles.toggleThumb, user.available && styles.toggleThumbOn]} />
          </TouchableOpacity>
        </View>
        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.6} onPress={item.onPress}>
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}><MaterialIcons name={item.icon} size={20} color={item.iconColor} /></View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.text3} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.6} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(220,20,60,0.12)' }]}><MaterialIcons name="logout" size={20} color={COLORS.red} /></View>
            <Text style={[styles.menuLabel, { color: COLORS.red }]}>Log Out</Text>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.text3} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  profileHeader: { alignItems: 'center', paddingTop: 60, paddingBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 24, backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  blood: { fontSize: 14, fontWeight: '600', color: COLORS.red, marginTop: 4 },
  toggleCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, padding: 16, backgroundColor: COLORS.bg2, borderRadius: RADIUS.sm, marginBottom: 16 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  toggleSub: { fontSize: 11, color: COLORS.text2, marginTop: 2 },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: COLORS.surface2, justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn: { backgroundColor: COLORS.red },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  toggleThumbOn: { alignSelf: 'flex-end' },
  menu: { paddingHorizontal: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, gap: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, color: COLORS.text },
});
