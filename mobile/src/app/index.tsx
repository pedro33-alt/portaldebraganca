import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import HeaderBar from '@/components/HeaderBar';
import HeroBanner from '@/components/HeroBanner';
import QuickAccess from '@/components/QuickAccess';
import LatestNewsSection from '@/components/LatestNewsSection';
import ExclusiveOffersBanner from '@/components/ExclusiveOffersBanner';
import BottomNavigation from '@/components/BottomNavigation';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E3B2E" />

      {/* 1. CABEÇALHO COM IDENTIDADE DO RESIDENCIAL PORTAL DE BRAGANÇA */}
      <HeaderBar
        notificationCount={3}
        avatarUrl="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80"
        onPressNotification={() => router.push('/notices')}
        onPressAvatar={() => router.push('/profile')}
      />

      {/* CONTEÚDO ROLÁVEL */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Fundo verde sutil atrás do topo do banner para transição harmoniosa */}
        <View style={styles.headerBackdrop} />

        {/* 2. BANNER PRINCIPAL (CARROSSEL DE DESTAQUES E AVISOS) */}
        <HeroBanner onPressAction={() => router.push('/notices')} />

        {/* 3. ACESSO RÁPIDO (AVISOS, NOTÍCIAS, ANUNCIANTES, REVISTA) */}
        <QuickAccess />

        {/* 4. ÚLTIMAS NOTÍCIAS */}
        <LatestNewsSection />

        {/* 5. ÁREA DE OFERTAS EXCLUSIVAS PARA MORADORES (CLUBE DING) */}
        <ExclusiveOffersBanner />

        {/* Espaçamento extra no final para não tampar com o menu */}
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* 6. MENU INFERIOR NAVEGAÇÃO FIXA (5 ABAS) */}
      <BottomNavigation activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E3B2E', // Verde escuro no topo para notch e status bar
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Off-white limpo
  },
  scrollContent: {
    paddingBottom: 8,
  },
  headerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#0E3B2E',
  },
});
