import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import BottomNavigation from '@/components/BottomNavigation';

import { API_BASE } from '../config';

export interface MagazineEdition {
  id: string;
  title: string;
  edition_number: number;
  publication_date: string;
  cover_image_url: string;
  pdf_url: string;
  description: string;
}

export default function MagazineScreen() {
  const router = useRouter();
  const [magazines, setMagazines] = useState<MagazineEdition[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMagazines = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/magazines`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMagazines(data);
      }
    } catch (err) {
      console.error('Erro ao buscar revistas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMagazines();
  }, []);

  const handleOpenPdf = async (pdfUrl: string, title: string) => {
    if (!pdfUrl) {
      Alert.alert('Aviso', 'Link do arquivo PDF não encontrado.');
      return;
    }
    try {
      // Abre o PDF diretamente em leitor nativo e seguro em tela cheia
      await WebBrowser.openBrowserAsync(pdfUrl);
    } catch (err) {
      Linking.openURL(pdfUrl).catch(() => {
        Alert.alert('Leitor Digital', `Abrindo PDF da ${title}...`);
      });
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
        <Text style={styles.headerTitle}>Revista do Condomínio</Text>
        <TouchableOpacity onPress={fetchMagazines} style={styles.backButton}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroBox}>
          <Text style={styles.heroBadge}>EDITORIAL EXCLUSIVO</Text>
          <Text style={styles.heroTitle}>Publicações & Entrevistas</Text>
          <Text style={styles.heroSubtitle}>
            Acompanhe as edições oficiais do Residencial Portal de Bragança em PDF interativo.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0E3B2E" />
            <Text style={styles.loadingText}>Carregando acervo de revistas...</Text>
          </View>
        ) : magazines.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="book-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Nenhuma edição publicada no momento.</Text>
          </View>
        ) : (
          magazines.map((mag) => (
            <View key={mag.id} style={styles.magazineCard}>
              <Image
                source={{
                  uri: mag.cover_image_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
                }}
                style={styles.coverImage}
              />

              <View style={styles.cardBody}>
                <View style={styles.editionBadge}>
                  <Text style={styles.editionBadgeText}>EDIÇÃO #{mag.edition_number}</Text>
                </View>

                <Text style={styles.magTitle}>{mag.title}</Text>
                <Text style={styles.magDate}>
                  📅 {mag.publication_date ? new Date(mag.publication_date).toLocaleDateString('pt-BR') : 'Recente'}
                </Text>

                {mag.description && (
                  <Text style={styles.magDesc} numberOfLines={3}>
                    {mag.description}
                  </Text>
                )}

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.readBtn}
                    onPress={() => handleOpenPdf(mag.pdf_url, mag.title)}
                  >
                    <Ionicons name="book-outline" size={16} color="#0E3B2E" />
                    <Text style={styles.readBtnText}>📖 Ler Revista em PDF</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.downloadBtn}
                    onPress={() => {
                      Linking.openURL(mag.pdf_url).catch(() => {
                        Alert.alert('Download', 'Baixando PDF...');
                      });
                    }}
                  >
                    <Ionicons name="download-outline" size={16} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      <BottomNavigation activeTab="magazine" />
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
  heroBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  heroBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  heroSubtitle: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 17,
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
  magazineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  coverImage: {
    width: '100%',
    height: 220,
  },
  cardBody: {
    padding: 16,
  },
  editionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  editionBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  magTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  magDate: {
    fontSize: 11.5,
    color: '#6B7280',
    marginBottom: 8,
  },
  magDesc: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  readBtn: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  readBtnText: {
    color: '#0E3B2E',
    fontSize: 13,
    fontWeight: '900',
  },
  downloadBtn: {
    width: 46,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

