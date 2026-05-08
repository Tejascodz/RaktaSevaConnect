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

  const formatTime = (notification) => {
    if (notification.time) return notification.time;
    if (notification.createdAt?.toDate) {
      const date = notification.createdAt.toDate();
      const now = new Date();
      const diff = now - date;
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins} min ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
      const days = Math.floor(hrs / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    return 'Recently';
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
        <TouchableOpacity style={styles.markBtn} onPress={() => markAllRead?.()}>
          <Text style={styles.markText}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        {notifications.length > 0 ? notifications.map(n => (
          <View key={n.id} style={[styles.item, n.unread && styles.itemUnread]}>
            <View style={[styles.iconWrap, { backgroundColor: colorMap[n.type]?.bg || COLORS.blueLight }]}>
              <MaterialIcons name={iconMap[n.type] || 'info'} size={20} color={colorMap[n.type]?.color || COLORS.blue} />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.desc}>{n.desc}</Text>
              <Text style={styles.time}>{formatTime(n)}</Text>
            </View>
          </View>
        )) : (
          <View style={styles.empty}>
            <MaterialIcons name="notifications-none" size={64} color={COLORS.text3} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySub}>You'll be notified when there are blood requests</Text>
          </View>
        )}
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
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  emptySub: { fontSize: 13, color: COLORS.text2, marginTop: 6, textAlign: 'center' },
});
