import React, { useState, useEffect } from 'react';
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

const FALLBACK_BANNERS: BannerItem[] = [
  {
    id: 'fallback-1',
    tag: 'AVISO IMPORTANTE',
    tagColor: '#B91C1C',
    title: 'Manutenção na rede de água',
    subtitle: 'Amanhã, das 08h às 12h.\nSaiba mais na seção de avisos.',
    image_url: 'https://yata.s3-object.locaweb.com.br/ddfce81eb289717347358bbcd1ef3710dc0ddab48e705876a139158f70832a8e',
    link_url: '/notices',
  }
];

export default function HeroBanner() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [banners, setBanners] = useState<BannerItem[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${API_BASE}/banners`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        } else {
          setBanners(FALLBACK_BANNERS);
        }
      } catch (err) {
        console.error('Erro ao buscar banners:', err);
        setBanners(FALLBACK_BANNERS);
      }
    };
    fetchBanners();
  }, []);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / CAROUSEL_WIDTH);
    if (slide !== activeSlide && slide >= 0 && slide < banners.length) {
      setActiveSlide(slide);
    }
  };

  if (banners.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CAROUSEL_WIDTH}
      >
        {banners.map((banner) => (
          <View key={banner.id} style={{ width: CAROUSEL_WIDTH }}>
            <ImageBackground
              source={{ uri: banner.image_url }}
              style={styles.imageBackground}
              imageStyle={styles.imageStyle}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(10,35,25,0.95)']}
                style={styles.gradient}
              >
                {banner.tag && (
                  <View style={[styles.tagBadge, { backgroundColor: banner.tagColor || '#D4AF37' }]}>
                    <Text style={styles.tagText}>{banner.tag}</Text>
                  </View>
                )}

                <Text style={styles.title}>{banner.title}</Text>
                
                {banner.subtitle && (
                  <Text style={styles.subtitle}>{banner.subtitle}</Text>
                )}

                {banner.link_url ? (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(banner.link_url as any)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.actionButtonText}>Ver mais</Text>
                    <Ionicons name="chevron-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ) : (
                  <View style={{ height: 20 }} />
                )}
              </LinearGradient>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>

      {/* Indicadores de Carrossel */}
      {banners.length > 1 && (
        <View style={styles.dotsContainer}>
          {banners.map((_, index) => (
            <View
              key={index}
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
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    marginBottom: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
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
