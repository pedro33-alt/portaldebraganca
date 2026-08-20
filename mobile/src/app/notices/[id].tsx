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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Notice } from '../notices';

import { API_BASE } from '../../config';

export default function NoticeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/notices/${id}`);
        if (res.ok) {
          const data = await res.json();
          setNotice(data);
        }
      } catch (err) {
        console.error('Erro ao buscar detalhe do aviso:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, [id]);

  const getPriorityBadge = (priority?: Notice['priority']) => {
    switch (priority) {
      case 'urgente':
        return { label: '🚨 AVISO URGENTE', bg: '#EF4444', color: '#FFFFFF' };
      case 'importante':
        return { label: '⚠️ AVISO IMPORTANTE', bg: '#F59E0B', color: '#FFFFFF' };
      default:
        return { label: '🟢 COMUNICADO NORMAL', bg: '#10B981', color: '#FFFFFF' };
    }
  };

  const badge = getPriorityBadge(notice?.priority);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E3B2E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhe do Aviso</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0E3B2E" />
            <Text style={styles.loadingText}>Carregando aviso...</Text>
          </View>
        ) : !notice ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Aviso não encontrado.</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {/* Tag de Prioridade */}
            <View style={[styles.priorityBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.priorityText, { color: badge.color }]}>{badge.label}</Text>
            </View>

            <Text style={styles.title}>{notice.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  Publicado em: {new Date(notice.created_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              {notice.expires_at && (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color="#D97706" />
                  <Text style={styles.metaText}>
                    Válido até: {new Date(notice.expires_at).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <Text style={styles.bodyText}>{notice.content}</Text>

            <View style={styles.signatureBox}>
              <Text style={styles.signatureTitle}>Atenciosamente,</Text>
              <Text style={styles.signatureName}>Administração do Residencial Portal de Bragança</Text>
              <Text style={styles.signatureSub}>Plataforma Portal Bragança</Text>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
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
  errorBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 26,
  },
  metaRow: {
    gap: 6,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  bodyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 24,
  },
  signatureBox: {
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0E3B2E',
  },
  signatureTitle: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  signatureName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0E3B2E',
  },
  signatureSub: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '700',
  },
});
