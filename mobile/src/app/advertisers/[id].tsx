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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Advertiser } from '../advertisers';

import { API_BASE } from '../../config';

export default function AdvertiserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [adv, setAdv] = useState<Advertiser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAdvDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/advertisers/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAdv(data);
        }
      } catch (err) {
        console.error('Erro ao buscar anunciante:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvDetail();
  }, [id]);

  const handleOpenWhatsapp = () => {
    if (!adv?.whatsapp) {
      Alert.alert('Aviso', 'WhatsApp não cadastrado.');
      return;
    }
    const cleanNumber = adv.whatsapp.replace(/\D/g, '');
    const url = `whatsapp://send?phone=${cleanNumber}&text=Olá! Sou morador do Residencial Portal de Bragança e encontrei a ${adv.name} no Portal Bragança.`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp', `Iniciando atendimento via WhatsApp (${adv.whatsapp})...`);
    });
  };

  const handleCall = () => {
    if (!adv?.phone) {
      Alert.alert('Aviso', 'Telefone não cadastrado.');
      return;
    }
    const cleanNumber = adv.phone.replace(/\D/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Ligar', `Discando para ${adv.phone}...`);
    });
  };

  const handleOpenInstagram = () => {
    if (!adv?.instagram) {
      Alert.alert('Aviso', 'Instagram não cadastrado.');
      return;
    }
    const cleanUser = adv.instagram.replace('@', '');
    Linking.openURL(`https://instagram.com/${cleanUser}`).catch(() => {
      Alert.alert('Instagram', `Abrindo perfil @${cleanUser}...`);
    });
  };

  const handleOpenWebsite = () => {
    if (!adv?.website_url) {
      Alert.alert('Aviso', 'Website não cadastrado.');
      return;
    }
    Linking.openURL(adv.website_url).catch(() => {
      Alert.alert('Website', `Abrindo ${adv.website_url}...`);
    });
  };

  const isPremium = adv?.plan === 'premium';
  const isIntermediario = adv?.plan === 'intermediario';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E3B2E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {adv?.name || 'Detalhes do Parceiro'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#0E3B2E" />
            <Text style={styles.loadingText}>Carregando perfil do anunciante...</Text>
          </View>
        ) : !adv ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Anunciante não encontrado.</Text>
          </View>
        ) : (
          <View style={styles.mainCard}>
            {/* Banner de Capa */}
            <Image
              source={{
                uri: adv.banner_url || adv.banner || 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1000',
              }}
              style={styles.coverBanner}
            />

            <View style={styles.profileHeader}>
              <Image
                source={{
                  uri: adv.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200',
                }}
                style={styles.logo}
              />
              <View style={styles.profileInfo}>
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>
                    {isPremium ? '👑 PLANO PREMIUM VIP' : isIntermediario ? '⭐ PARCEIRO DESTAQUE' : 'PARCEIRO OFICIAL'}
                  </Text>
                </View>
                <Text style={styles.advName}>{adv.name}</Text>
                <Text style={styles.advCategory}>{adv.category}</Text>
              </View>
            </View>

            {/* BOTÕES DE CONTATO DIRETO */}
            <View style={styles.contactBar}>
              <TouchableOpacity style={styles.contactBtn} onPress={handleOpenWhatsapp}>
                <View style={[styles.contactIconCircle, { backgroundColor: '#10B981' }]}>
                  <MaterialCommunityIcons name="whatsapp" size={20} color="#FFFFFF" />
                </View>
                <Text style={styles.contactBtnLabel}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                <View style={[styles.contactIconCircle, { backgroundColor: '#0E3B2E' }]}>
                  <Ionicons name="call" size={18} color="#FFFFFF" />
                </View>
                <Text style={styles.contactBtnLabel}>Ligar</Text>
              </TouchableOpacity>

              {adv.instagram && (
                <TouchableOpacity style={styles.contactBtn} onPress={handleOpenInstagram}>
                  <View style={[styles.contactIconCircle, { backgroundColor: '#E1306C' }]}>
                    <Ionicons name="logo-instagram" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.contactBtnLabel}>Instagram</Text>
                </TouchableOpacity>
              )}

              {adv.website_url && (
                <TouchableOpacity style={styles.contactBtn} onPress={handleOpenWebsite}>
                  <View style={[styles.contactIconCircle, { backgroundColor: '#2563EB' }]}>
                    <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.contactBtnLabel}>Site</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* OFERTAS E CUPONS DE DESCONTO */}
            {adv.promotions && adv.promotions.length > 0 && (
              <View style={styles.offersSection}>
                <Text style={styles.sectionTitle}>🎁 Descontos Exclusivos para Moradores</Text>
                {adv.promotions.map((promo) => (
                  <View key={promo.id} style={styles.promoCard}>
                    <View style={styles.promoHeader}>
                      <Text style={styles.promoDiscount}>{promo.discount_percentage}% OFF</Text>
                      <Text style={styles.promoTitle}>{promo.title}</Text>
                    </View>
                    <View style={styles.couponContainer}>
                      <View style={styles.couponBox}>
                        <Text style={styles.couponLabel}>CÓDIGO DO CUPOM:</Text>
                        <Text style={styles.couponCodeText}>{promo.coupon_code}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => Alert.alert('Cupom Copiado!', `Cupom "${promo.coupon_code}" copiado para uso no estabelecimento.`)}
                      >
                        <Text style={styles.copyBtnText}>Copiar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* INFORMAÇÕES DO ESTABELECIMENTO */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Sobre o Estabelecimento</Text>
              <Text style={styles.descText}>
                {adv.description ||
                  'Parceiro oficial credenciado no Clube DING com atendimento diferenciado e benefícios para todos os moradores do Residencial Portal de Bragança.'}
              </Text>

              {adv.address && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={18} color="#0E3B2E" />
                  <Text style={styles.infoRowText}>{adv.address}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color="#0E3B2E" />
                <Text style={styles.infoRowText}>Segunda a Sábado: 09h às 20h • Domingo: 10h às 16h</Text>
              </View>
            </View>

            {/* GALERIA DE FOTOS (PREMIUM E INTERMEDIÁRIO) */}
            {(isPremium || isIntermediario) && (
              <View style={styles.gallerySection}>
                <Text style={styles.sectionTitle}>📸 Fotos do Estabelecimento</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500' }}
                    style={styles.galleryImage}
                  />
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=500' }}
                    style={styles.galleryImage}
                  />
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500' }}
                    style={styles.galleryImage}
                  />
                </ScrollView>
              </View>
            )}
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
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
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  coverBanner: {
    width: '100%',
    height: 170,
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    marginTop: -30,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
    marginTop: 20,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  planBadgeText: {
    color: '#B45309',
    fontSize: 9.5,
    fontWeight: '900',
  },
  advName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  advCategory: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  contactBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginHorizontal: 16,
  },
  contactBtn: {
    alignItems: 'center',
    gap: 4,
  },
  contactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactBtnLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  offersSection: {
    padding: 16,
    backgroundColor: '#FFFDF5',
    borderBottomWidth: 1,
    borderColor: '#FDE68A',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  promoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  promoDiscount: {
    backgroundColor: '#D4AF37',
    color: '#0E3B2E',
    fontWeight: '900',
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    flex: 1,
  },
  couponContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 8,
  },
  couponBox: {
    gap: 2,
  },
  couponLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  couponCodeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 1,
  },
  copyBtn: {
    backgroundColor: '#0E3B2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  infoSection: {
    padding: 16,
  },
  descText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoRowText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  gallerySection: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#F3F4F6',
  },
  galleryImage: {
    width: 140,
    height: 95,
    borderRadius: 10,
    marginRight: 10,
  },
});
