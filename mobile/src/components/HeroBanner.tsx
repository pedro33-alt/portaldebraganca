import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_BASE } from '../config';

const { width } = Dimensions.get('window');
const CAROUSEL_WIDTH = width - 36; // marginHorizontal 18 * 2

interface BannerItem {
  id: string;
  tag?: string;
  tagColor?: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
}

interface HeroBannerProps {
  onPressAction?: () => void;
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'default-welcome',
    tag: 'BEM-VINDO',
    tagColor: '#D4AF37',
    title: 'Portal de Bragança em Suas Mãos',
    subtitle: 'Acesse notícias, avisos da portaria, revista digital e Clube DING.',
    image_url: 'https://yata.s3-object.locaweb.com.br/9352aae294fc6baecb7ca73ffe02235a1603662f1414062d39979dd432c27d71',
    link_url: '/notices',
  },
  {
    id: 'default-notice',
    tag: 'AVISO IMPORTANTE',
    tagColor: '#B91C1C',
    title: 'Manutenção na rede de água',
    subtitle: 'Amanhã, das 08h às 12h.\nSaiba mais na seção de avisos.',
    image_url: 'https://yata.s3-object.locaweb.com.br/ddfce81eb289717347358bbcd1ef3710dc0ddab48e705876a139158f70832a8e',
    link_url: '/notices',
  },
  {
    id: 'default-nature',
    tag: 'MEIO AMBIENTE',
    tagColor: '#2E7D32',
    title: 'Preservação dos 4 Lagos e Fauna',
    subtitle: 'Nosso compromisso com a natureza e o patrimônio do condomínio.',
    image_url: 'https://yata.s3-object.locaweb.com.br/11fcf3e2c9e9597676fec76f5ff707830600e27c80cabd421996f07a471f156a',
    link_url: '/news',
  },
  {
    id: 'default-magazine',
    tag: 'REVISTA DIGITAL',
    tagColor: '#0E3B2E',
    title: 'Nova Edição da Revista Portal',
    subtitle: 'Confira as novidades, entrevistas e conquistas da comunidade.',
    image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800',
    link_url: '/magazines',
  },
  {
    id: 'default-ding',
    tag: 'CLUBE DING',
    tagColor: '#2563EB',
    title: 'Descontos Exclusivos em Comércios',
    subtitle: 'Aproveite benefícios e ofertas preparadas para os moradores.',
    image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
    link_url: '/advertisers',
  },
];

export default function HeroBanner({ onPressAction }: HeroBannerProps) {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [banners, setBanners] = useState<BannerItem[]>(DEFAULT_BANNERS);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_BASE}/banners`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const apiBanners: BannerItem[] = data.map((b: any, idx: number) => ({
            id: b.id || `api-${idx}`,
            tag: b.tag || 'DESTAQUE',
            tagColor: b.tagColor || '#D4AF37',
            title: b.title,
            subtitle: b.subtitle || b.description || 'Confira os detalhes desta publicação.',
            image_url: b.image_url || DEFAULT_BANNERS[0].image_url,
            link_url: b.link_url || '/notices',
          }));

          if (apiBanners.length < 2) {
            setBanners([...apiBanners, ...DEFAULT_BANNERS.slice(1)]);
          } else {
            setBanners(apiBanners);
          }
        } else {
          setBanners(DEFAULT_BANNERS);
        }
      } catch (err) {
        console.error('Erro ao buscar banners:', err);
        setBanners(DEFAULT_BANNERS);
      }
    };
    fetchBanners();
  }, []);

  // Timer para rotação automática a cada 5s se houver múltiplos banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const nextSlide = (prev + 1) % banners.length;
        scrollViewRef.current?.scrollTo({
          x: nextSlide * CAROUSEL_WIDTH,
          animated: true,
        });
        return nextSlide;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / CAROUSEL_WIDTH);
    if (slide !== activeSlide && slide >= 0 && slide < banners.length) {
      setActiveSlide(slide);
    }
  };

  const scrollToIndex = (index: number) => {
    setActiveSlide(index);
    scrollViewRef.current?.scrollTo({
      x: index * CAROUSEL_WIDTH,
      animated: true,
    });
  };

  if (banners.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CAROUSEL_WIDTH}
        snapToAlignment="center"
      >
        {banners.map((banner) => (
          <View key={banner.id} style={{ width: CAROUSEL_WIDTH }}>
            <ImageBackground
              source={{ uri: banner.image_url }}
              style={styles.imageBackground}
              imageStyle={styles.imageStyle}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.65)', 'rgba(10,35,25,0.95)']}
                style={styles.gradient}
              >
                {banner.tag && (
                  <View style={[styles.tagBadge, { backgroundColor: banner.tagColor || '#D4AF37' }]}>
                    <Text style={styles.tagText}>{banner.tag}</Text>
                  </View>
                )}

                <Text style={styles.title} numberOfLines={2}>
                  {banner.title}
                </Text>

                {banner.subtitle && (
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {banner.subtitle}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    if (banner.link_url) {
                      router.push(banner.link_url as any);
                    } else if (onPressAction) {
                      onPressAction();
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionButtonText}>Ver mais</Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </LinearGradient>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>

      {/* Indicadores de Carrossel Interativos */}
      {banners.length > 1 && (
        <View style={styles.dotsContainer}>
          {banners.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => scrollToIndex(index)}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[styles.dot, activeSlide === index && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    marginTop: -8,
    backgroundColor: '#0E3B2E',
  },
  imageBackground: {
    width: '100%',
    height: 220,
  },
  imageStyle: {
    borderRadius: 20,
  },
  gradient: {
    flex: 1,
    padding: 18,
    justifyContent: 'flex-end',
    borderRadius: 20,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 25,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#E2E8F0',
    lineHeight: 17,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    width: 18,
    backgroundColor: '#FFFFFF',
  },
});

