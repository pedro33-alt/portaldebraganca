import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface HeroBannerProps {
  onPressAction?: () => void;
}

export default function HeroBanner({ onPressAction }: HeroBannerProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://yata.s3-object.locaweb.com.br/ddfce81eb289717347358bbcd1ef3710dc0ddab48e705876a139158f70832a8e',
        }}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(10,35,25,0.92)']}
          style={styles.gradient}
        >
          {/* Tag / Badge */}
          <View style={styles.tagBadge}>
            <Text style={styles.tagText}>AVISO IMPORTANTE</Text>
          </View>

          {/* Título Principal */}
          <Text style={styles.title}>Manutenção na rede de água</Text>

          {/* Subtítulo / Descrição */}
          <Text style={styles.subtitle}>
            Amanhã, das 08h às 12h.{"\n"}Saiba mais na seção de avisos.
          </Text>

          {/* Botão de Ação */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onPressAction}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>Ver aviso</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          {/* Indicadores de Carrossel */}
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </LinearGradient>
      </ImageBackground>
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
    backgroundColor: '#388E3C', // Verde destaque para aviso
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
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
