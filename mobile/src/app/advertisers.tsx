import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNavigation from '@/components/BottomNavigation';

import { API_BASE } from '../config';

export interface Advertiser {
  id: string;
  name: string;
  category: string;
  plan: 'basico' | 'intermediario' | 'premium';
  logo_url: string;
  banner?: string;
  banner_url?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  website_url?: string;
  address?: string;
  is_active: boolean;
  promotions?: Array<{
    id: string;
    title: string;
    coupon_code: string;
    discount_percentage: number;
  }>;
}

export default function AdvertisersScreen() {
  const router = useRouter();
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Gastronomia', 'Arquitetura e Decoração', 'Pets', 'Saúde & Beleza', 'Serviços Gerais'];

  const fetchAdvertisers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/advertisers`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Apenas anunciantes ativos
        setAdvertisers(data.filter((a) => a.is_active !== false));
      }
    } catch (err) {
      console.error('Erro ao buscar anunciantes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisers();
  }, []);

  const handleOpenWhatsapp = (phone?: string, name?: string) => {
    if (!phone) {
      Alert.alert('Aviso', 'Número de WhatsApp não informado.');
      return;
    }
    const cleanNumber = phone.replace(/\D/g, '');
    const url = `whatsapp://send?phone=${cleanNumber}&text=Olá! Sou morador do Residencial Portal de Bragança e encontrei vocês no Portal Bragança.`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp', `Iniciando conversa com ${name} pelo número (${phone})...`);
    });
  };

  const handleCall = (phone?: string) => {
    if (!phone) {
      Alert.alert('Aviso', 'Telefone não informado.');
      return;
    }
    const cleanNumber = phone.replace(/\D/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Ligar', `Discando para ${phone}...`);
    });
  };

  // Filtragem
  const filtered = advertisers.filter((adv) => {
    const matchesCat = selectedCategory === 'Todos' || adv.category === selectedCategory;
    const matchesSearch =
      adv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      adv.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const premiumAdvertisers = filtered.filter((a) => a.plan === 'premium');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E3B2E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Guia & Parceiros DING</Text>
        <TouchableOpacity onPress={fetchAdvertisers} style={styles.backButton}>
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por loja, restaurante ou serviço..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categorias */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, selectedCategory === cat && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[styles.catChipText, selectedCategory === cat && styles.catChipTextActive]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0E3B2E" />
            <Text style={styles.loadingText}>Carregando parceiros e ofertas...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="storefront-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Nenhum anunciante encontrado para esta busca.</Text>
          </View>
        ) : (
          <>
            {/* EMPRESAS PREMIUM EM DESTAQUE */}
            {premiumAdvertisers.length > 0 && selectedCategory === 'Todos' && searchQuery === '' && (
              <View style={styles.featuredSection}>
                <View style={styles.sectionHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.sectionHeading}>Destaques VIP</Text>
                    <View style={styles.vipBadge}>
                      <Text style={styles.vipBadgeText}>👑 PREMIUM</Text>
                    </View>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
                  {premiumAdvertisers.map((adv) => (
                    <TouchableOpacity
                      key={adv.id}
                      style={styles.featuredCard}
                      onPress={() => router.push(`/advertisers/${adv.id}` as any)}
                      activeOpacity={0.88}
                    >
                      <Image
                        source={{
                          uri: adv.banner_url || adv.banner || 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600',
                        }}
                        style={styles.featuredBanner}
                      />
                      <View style={styles.featuredBody}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <Image
                            source={{
                              uri: adv.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
                            }}
                            style={styles.featuredLogo}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.featuredName} numberOfLines={1}>{adv.name}</Text>
                            <Text style={styles.featuredCat}>{adv.category}</Text>
                          </View>
                        </View>

                        {adv.promotions && adv.promotions.length > 0 && (
                          <View style={styles.miniOfferPill}>
                            <Text style={styles.miniOfferText}>
                              🎁 {adv.promotions[0].discount_percentage}% OFF • Cupom {adv.promotions[0].coupon_code}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* LISTAGEM GERAL DE ANUNCIANTES */}
            <Text style={[styles.sectionHeading, { marginBottom: 12, marginTop: 8 }]}>
              Todos os Anunciantes ({filtered.length})
            </Text>

            {filtered.map((adv) => {
              const isPremium = adv.plan === 'premium';
              const isIntermediario = adv.plan === 'intermediario';

              return (
                <TouchableOpacity
                  key={adv.id}
                  style={[styles.advCard, isPremium && styles.premiumCardBorder]}
                  onPress={() => router.push(`/advertisers/${adv.id}` as any)}
                  activeOpacity={0.85}
                >
                  {/* Banner de Imagem (apenas para Intermediário e Premium) */}
                  {(isPremium || isIntermediario) && (adv.banner_url || adv.banner) && (
                    <Image
                      source={{ uri: adv.banner_url || adv.banner }}
                      style={styles.advBanner}
                    />
                  )}

                  <View style={styles.advBody}>
                    <View style={styles.cardHeader}>
                      <Image
                        source={{
                          uri: adv.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
                        }}
                        style={styles.advLogo}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <View
                            style={[
                              styles.planBadge,
                              {
                                backgroundColor: isPremium ? '#FFFBEB' : isIntermediario ? '#ECFDF5' : '#F3F4F6',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.planBadgeText,
                                {
                                  color: isPremium ? '#B45309' : isIntermediario ? '#059669' : '#6B7280',
                                },
                              ]}
                            >
                              {isPremium ? '👑 PREMIUM' : isIntermediario ? '⭐ DESTAQUE' : 'PARCEIRO'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.advName}>{adv.name}</Text>
                        <Text style={styles.advCategory}>{adv.category}</Text>
                      </View>
                    </View>

                    {adv.description && (
                      <Text style={styles.advDesc} numberOfLines={2}>
                        {adv.description}
                      </Text>
                    )}

                    {adv.address && (
                      <Text style={styles.advAddress} numberOfLines={1}>
                        📍 {adv.address}
                      </Text>
                    )}

                    {/* Oferta / Cupom de Desconto */}
                    {adv.promotions && adv.promotions.length > 0 && (
                      <View style={styles.offerBox}>
                        <Text style={styles.offerHeader}>🎁 OFERTA EXCLUSIVA MORADOR:</Text>
                        <Text style={styles.offerTitle}>{adv.promotions[0].title}</Text>
                        <View style={styles.couponRow}>
                          <Text style={styles.couponCode}>CUPOM: {adv.promotions[0].coupon_code}</Text>
                          <Text style={styles.couponCopy}>Toque para ver detalhes →</Text>
                        </View>
                      </View>
                    )}

                    {/* Botões Rápidos de Ação */}
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.whatsappBtn}
                        onPress={() => handleOpenWhatsapp(adv.whatsapp, adv.name)}
                      >
                        <MaterialCommunityIcons name="whatsapp" size={16} color="#FFFFFF" />
                        <Text style={styles.whatsappBtnText}>WhatsApp</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.callBtn}
                        onPress={() => handleCall(adv.phone)}
                      >
                        <Ionicons name="call-outline" size={15} color="#374151" />
                        <Text style={styles.callBtnText}>Ligar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Menu Inferior */}
      <BottomNavigation activeTab="advertisers" />
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
  searchBarWrapper: {
    backgroundColor: '#0E3B2E',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  categoriesWrapper: {
    backgroundColor: '#0E3B2E',
    paddingBottom: 12,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#D4AF37',
  },
  catChipText: {
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '700',
  },
  catChipTextActive: {
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
  featuredSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  vipBadge: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vipBadgeText: {
    color: '#B45309',
    fontSize: 9,
    fontWeight: '900',
  },
  featuredScroll: {
    marginHorizontal: -4,
  },
  featuredCard: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredBanner: {
    width: '100%',
    height: 110,
  },
  featuredBody: {
    padding: 12,
  },
  featuredLogo: {
    width: 38,
    height: 38,
    borderRadius: 8,
  },
  featuredName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  featuredCat: {
    fontSize: 11,
    color: '#6B7280',
  },
  miniOfferPill: {
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
    padding: 6,
    marginTop: 8,
  },
  miniOfferText: {
    fontSize: 10.5,
    color: '#B45309',
    fontWeight: '700',
  },
  advCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  premiumCardBorder: {
    borderColor: '#FDE68A',
  },
  advBanner: {
    width: '100%',
    height: 130,
  },
  advBody: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  advLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  advName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  advCategory: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  advDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
    marginBottom: 6,
  },
  advAddress: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 10,
  },
  offerBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  offerHeader: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  offerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 6,
  },
  couponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  couponCode: {
    backgroundColor: '#D4AF37',
    color: '#0E3B2E',
    fontWeight: '900',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  couponCopy: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  whatsappBtn: {
    flex: 1.2,
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  callBtnText: {
    color: '#374151',
    fontWeight: '700',
    fontSize: 12,
  },
});

