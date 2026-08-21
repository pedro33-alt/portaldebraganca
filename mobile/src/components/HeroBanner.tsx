import React, { useState, useRef } from 'react';
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

const { width } = Dimensions.get('window');
const CAROUSEL_WIDTH = width - 36; // marginHorizontal 18 * 2

interface BannerItem {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  subtitle: string;
  image: string;
  route: string;
}

const BANNERS: BannerItem[] = [
  {
    id: '1',
    tag: 'AVISO IMPORTANTE',
    tagColor: '#B91C1C',
    title: 'Manutenção na rede de água',
    subtitle: 'Amanhã, das 08h às 12h.\nSaiba mais na seção de avisos.',
    image: 'https://yata.s3-object.locaweb.com.br/ddfce81eb289717347358bbcd1ef3710dc0ddab48e705876a139158f70832a8e',
    route: '/notices',
  },
  {
    id: '2',
    tag: 'NOVIDADE',
    tagColor: '#D4AF37',
    title: 'Nova Área Gourmet Liberada',
    subtitle: 'Agende agora seu churrasco.\nVeja as fotos da inauguração.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    route: '/reservations',
  },
  {
    id: '3',
    tag: 'CLUBE DE VANTAGENS',
    tagColor: '#388E3C',
    title: 'Desconto no PetShop Cão Feliz',
    subtitle: '20% OFF para moradores.\nApresente o app.',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&q=80',
    route: '/advertisers',
  }
];

interface HeroBannerProps {
  onPressAction?: () => void;
}

export default function HeroBanner({ onPressAction }: HeroBannerProps) {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / CAROUSEL_WIDTH);
    if (slide !== activeSlide && slide >= 0 && slide < BANNERS.length) {
      setActiveSlide(slide);
    }
  };

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
        {BANNERS.map((banner) => (
          <View key={banner.id} style={{ width: CAROUSEL_WIDTH }}>
            <ImageBackground
              source={{ uri: banner.image }}
              style={styles.imageBackground}
              imageStyle={styles.imageStyle}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(10,35,25,0.95)']}
                style={styles.gradient}
              >
                <View style={[styles.tagBadge, { backgroundColor: banner.tagColor }]}>
                  <Text style={styles.tagText}>{banner.tag}</Text>
                </View>

                <Text style={styles.title}>{banner.title}</Text>
                <Text style={styles.subtitle}>{banner.subtitle}</Text>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(banner.route as any)}
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

      {/* Indicadores de Carrossel */}
      <View style={styles.dotsContainer}>
        {BANNERS.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeSlide === index && styles.activeDot]}
          />
        ))}
      </View>
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
