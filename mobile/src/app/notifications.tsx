import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/context/AuthContext';

import { API_BASE } from '../config';

export interface AppNotification {
  id: string;
  condominium_id: string;
  title: string;
  body: string;
  type: 'aviso' | 'noticia' | 'manutencao' | 'comunicado' | 'revista' | 'promocao';
  reference_id?: string;
  deep_link?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user, token } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'aviso' | 'promocao'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/notifications`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notif: AppNotification) => {
    if (!notif.is_read) {
      try {
        await fetch(`${API_BASE}/notifications/${notif.id}/read`, { method: 'PATCH' });
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch (e) {}
    }

    // DEEP LINKING INTELIGENTE: Navegar para o conteúdo correspondente
    switch (notif.type) {
      case 'noticia':
        if (notif.reference_id) router.push(`/news/${notif.reference_id}` as any);
        else router.push('/news' as any);
        break;
      case 'aviso':
      case 'manutencao':
      case 'comunicado':
        if (notif.reference_id) router.push(`/notices/${notif.reference_id}` as any);
        else router.push('/notices' as any);
        break;
      case 'revista':
        router.push('/magazine' as any);
        break;
      case 'promocao':
        if (notif.reference_id) router.push(`/advertisers/${notif.reference_id}` as any);
        else router.push('/advertisers' as any);
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`${API_BASE}/notifications/read-all`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      Alert.alert('Pronto!', 'Todas as notificações foram marcadas como lidas.');
    } catch (err) {
      Alert.alert('Erro', 'Falha ao atualizar notificações.');
    }
  };

  const getTypeStyle = (type: AppNotification['type']) => {
    switch (type) {
      case 'aviso':
      case 'manutencao':
        return {
          icon: 'alert-circle',
          iconColor: '#DC2626',
          bgIcon: '#FEE2E2',
          badgeText: type === 'manutencao' ? '🛠️ MANUTENÇÃO' : '🚨 AVISO',
          badgeBg: '#FEE2E2',
          badgeColor: '#B91C1C'
        };
      case 'noticia':
        return {
          icon: 'newspaper',
          iconColor: '#2563EB',
          bgIcon: '#EFF6FF',
          badgeText: '📰 NOTÍCIA',
          badgeBg: '#EFF6FF',
          badgeColor: '#1D4ED8'
        };
      case 'revista':
        return {
          icon: 'book',
          iconColor: '#D97706',
          bgIcon: '#FFFBEB',
          badgeText: '📁 REVISTA DIGITAL',
          badgeBg: '#FFFBEB',
          badgeColor: '#B45309'
        };
      case 'promocao':
        return {
          icon: 'pricetag',
          iconColor: '#059669',
          bgIcon: '#ECFDF5',
          badgeText: '🎁 OFERTA CLUBE DING',
          badgeBg: '#ECFDF5',
          badgeColor: '#047857'
        };
      default:
        return {
          icon: 'notifications',
          iconColor: '#0E3B2E',
          bgIcon: '#E8F5E9',
          badgeText: '📋 COMUNICADO',
          badgeBg: '#E8F5E9',
          badgeColor: '#2E7D32'
        };
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'aviso') return n.type === 'aviso' || n.type === 'manutencao';
    if (filter === 'promocao') return n.type === 'promocao';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E3B2E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Central de Notificações</Text>
        <TouchableOpacity onPress={fetchNotifications} style={styles.backButton}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Top Banner de Ações Rápidas */}
      <View style={styles.actionsBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.unreadCountText}>
            {unreadCount === 0 ? 'Tudo lido ✅' : `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}`}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllAsRead}>
            <Ionicons name="checkmark-done-outline" size={15} color="#D4AF37" />
            <Text style={styles.markAllBtnText}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros por Categoria */}
      <View style={styles.filterChipsRow}>
        {[
          { key: 'all', label: 'Todas' },
          { key: 'unread', label: `Não Lidas (${unreadCount})` },
          { key: 'aviso', label: 'Avisos' },
          { key: 'promocao', label: 'Ofertas' },
        ].map(item => (
          <TouchableOpacity
            key={item.key}
            style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
            onPress={() => setFilter(item.key as any)}
          >
            <Text style={[styles.filterChipText, filter === item.key && styles.filterChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0E3B2E" />
            <Text style={styles.loadingText}>Carregando notificações...</Text>
          </View>
        ) : filteredNotifs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Nenhuma notificação encontrada.</Text>
          </View>
        ) : (
          filteredNotifs.map(item => {
            const styleConfig = getTypeStyle(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.notifCard, !item.is_read && styles.unreadNotifCard]}
                onPress={() => handleMarkAsRead(item)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.iconCircle, { backgroundColor: styleConfig.bgIcon }]}>
                    <Ionicons name={styleConfig.icon as any} size={20} color={styleConfig.iconColor} />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.typeBadge, { backgroundColor: styleConfig.badgeBg }]}>
                        <Text style={[styles.typeBadgeText, { color: styleConfig.badgeColor }]}>
                          {styleConfig.badgeText}
                        </Text>
                      </View>

                      {!item.is_read && (
                        <View style={styles.unreadDotBadge}>
                          <View style={styles.unreadDot} />
                          <Text style={styles.unreadDotText}>NOVA</Text>
                        </View>
                      )}
                    </View>

                    <Text style={[styles.notifTitle, !item.is_read && styles.unreadTitle]}>
                      {item.title}
                    </Text>
                    <Text style={styles.notifBody} numberOfLines={2}>
                      {item.body}
                    </Text>

                    <View style={styles.cardFooter}>
                      <Text style={styles.notifDate}>
                        🕒 {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text style={styles.openDetailsText}>Abrir conteúdo →</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      <BottomNavigation activeTab="menu" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E3B2E',
  },
  header: {
    backgroundColor: '#0E3B2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  actionsBar: {
    backgroundColor: '#0E3B2E',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  unreadCountText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  markAllBtnText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800',
  },
  filterChipsRow: {
    flexDirection: 'row',
    backgroundColor: '#0E3B2E',
    paddingHorizontal: 18,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  filterChipActive: {
    backgroundColor: '#D4AF37',
  },
  filterChipText: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#0E3B2E',
    fontWeight: '900',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 13,
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: '#9CA3AF',
    fontSize: 13,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  unreadNotifCard: {
    borderColor: '#D4AF37',
    backgroundColor: '#FFFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  cardHeaderRow: {
    flexDirection: 'row',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  unreadDotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  unreadDotText: {
    color: '#1D4ED8',
    fontSize: 9,
    fontWeight: '900',
  },
  notifTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#374151',
    marginTop: 2,
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#111827',
    fontWeight: '900',
  },
  notifBody: {
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  notifDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  openDetailsText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0E3B2E',
  },
});

