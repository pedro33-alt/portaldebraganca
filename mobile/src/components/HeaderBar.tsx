import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { API_BASE } from '../config';

interface HeaderBarProps {
  notificationCount?: number;
  avatarUrl?: string;
  onPressNotification?: () => void;
  onPressAvatar?: () => void;
}

export default function HeaderBar({
  notificationCount,
  avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
  onPressNotification,
  onPressAvatar,
}: HeaderBarProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(notificationCount !== undefined ? notificationCount : 0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch(`${API_BASE}/notifications/unread-count`);
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unread_count || 0);
        }
      } catch (e) {}
    };
    fetchUnread();
  }, []);

  return (
    <View style={styles.header}>
      {/* Lado Esquerdo: Logo & Nome */}
      <View style={styles.brandContainer}>
        <View style={styles.logoIconWrapper}>
          <Image
            source={{ uri: 'https://yata.s3-object.locaweb.com.br/7ffa955f0926123efc96099986ef2fd836e7f10cad485d19b0b3ef7cdcddff91' }}
            style={{ width: 38, height: 38, resizeMode: 'contain' }}
          />
        </View>

        <View style={styles.brandTexts}>
          <Text style={styles.brandSubtitleSmall}>RESIDENCIAL</Text>
          <Text style={styles.brandName}>PORTAL DE BRAGANÇA</Text>
          <Text style={styles.brandSlogan}>O lugar onde nossa vida acontece</Text>
        </View>
      </View>

      {/* Lado Direito: Notificação & Avatar */}
      <View style={styles.rightActions}>
        {/* Botão de Notificações com Badge */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={onPressNotification || (() => router.push('/notifications' as any))}
          activeOpacity={0.75}
        >
          <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Avatar do Usuário */}
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onPressAvatar || (() => router.push('/profile' as any))}
          activeOpacity={0.85}
        >
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0E3B2E',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoIconWrapper: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandTexts: {
    justifyContent: 'center',
  },
  brandSubtitleSmall: {
    color: '#D4AF37',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: -1,
  },
  brandSlogan: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 9.5,
    fontStyle: 'italic',
    marginTop: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0E3B2E',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  avatarButton: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
});

