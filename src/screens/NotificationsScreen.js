import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../utils/theme';
import { useApp } from '../utils/AppContext';

export default function NotificationsScreen({ navigation }) {
  const { notifications, markAllRead } = useApp();
  const iconMap = { emergency: 'warning', success: 'check-circle', info: 'info' };
  const colorMap = {
    emergency: { bg: 'rgba(220,20,60,0.12)', color: COLORS.red },
    success: { bg: COLORS.greenLight, color: COLORS.green },
    info: { bg: COLORS.blueLight, color: COLORS.blue },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.h2}>Notifications</Text>
          <Text style={styles.sub}>{notifications.filter(n => n.unread).length} unread alerts</Text>
        </View>
        <TouchableOpacity style={styles.markBtn} onPress={markAllRead}>
          <Text style={styles.markText}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        {notifications.map(n => (
          <View key={n.id} style={[styles.item, n.unread && styles.itemUnread]}>
            <View style={[styles.iconWrap, { backgroundColor: colorMap[n.type]?.bg }]}>
              <MaterialIcons name={iconMap[n.type]} size={20} color={colorMap[n.type]?.color} />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.desc}>{n.desc}</Text>
              <Text style={styles.time}>{n.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 50, paddingBottom: 12 },
  backBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.surface2, justifyContent: 'center', alignItems: 'center' },
  h2: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.text2, marginTop: 2 },
  markBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  markText: { fontSize: 11, fontWeight: '600', color: COLORS.text2 },
  item: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: RADIUS.sm, backgroundColor: COLORS.bg2, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  itemUnread: { borderLeftWidth: 3, borderLeftColor: COLORS.red, backgroundColor: 'rgba(220,20,60,0.04)' },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  title: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  desc: { fontSize: 12, color: COLORS.text2 },
  time: { fontSize: 10, color: COLORS.text3, marginTop: 4 },
});
