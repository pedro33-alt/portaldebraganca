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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '@/components/BottomNavigation';

import { API_BASE } from '../config';

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'importante' | 'urgente';
  is_pinned: boolean;
  expires_at?: string;
  created_at: string;
}

export default function NoticesScreen() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'urgente' | 'importante' | 'normal'>('todos');

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/notices`);
      const data = await res.json();
      if (Array.isArray(data)) setNotices(data);
    } catch (err) {
      console.error('Erro ao carregar avisos no mobile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = selectedFilter === 'todos'
    ? notices
    : notices.filter((n) => n.priority === selectedFilter);

  const getPriorityBadge = (priority: Notice['priority']) => {
    switch (priority) {
      case 'urgente':
        return {
          label: '🚨 URGENTE',
          bg: '#FEE2E2',
          color: '#B91C1C',
        };
      case 'importante':
        return {
          label: '⚠️ IMPORTANTE',
          bg: '#FEF3C7',
          color: '#D97706',
        };
      default:
        return {
          label: '🟢 NORMAL',
          bg: '#E8F5E9',
          color: '#2E7D32',
        };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E3B2E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mural de Avisos</Text>
        <TouchableOpacity onPress={fetchNotices} style={styles.backButton}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filtros por Prioridade */}
      <View style={styles.filterBar}>
        {(['todos', 'urgente', 'importante', 'normal'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedFilter === filter && styles.filterChipTextActive,
              ]}
            >
              {filter.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0E3B2E" />
            <Text style={styles.loadingText}>Carregando avisos do condomínio...</Text>
          </View>
        ) : filteredNotices.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="notifications-off-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Nenhum aviso encontrado para este filtro.</Text>
          </View>
        ) : (
          filteredNotices.map((item) => {
            const badge = getPriorityBadge(item.priority);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, item.is_pinned && styles.pinnedCard]}
                onPress={() => router.push(`/notices/${item.id}` as any)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.priorityBadge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.priorityText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                  {item.is_pinned && (
                    <View style={styles.pinTag}>
                      <Ionicons name="pin" size={12} color="#D4AF37" />
                      <Text style={styles.pinText}>Fixado</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardContent} numberOfLines={3}>
                  {item.content}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.dateInfo}>
                    <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                    <Text style={styles.dateText}>
                      Publicado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                  <Text style={styles.readMoreText}>Ler detalhes →</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 20 }} />
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
    fontSize: 18,
    fontWeight: '800',
  },
  filterBar: {
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
    fontWeight: '800',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pinnedCard: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFDF5',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pinTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pinText: {
    fontSize: 10,
    color: '#B45309',
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E3B2E',
  },
});

