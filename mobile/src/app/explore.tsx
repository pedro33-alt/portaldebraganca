import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomNavigation from '@/components/BottomNavigation';

export default function MenuScreen() {
  const router = useRouter();

  const menuSections = [
    {
      title: 'Serviços do Condômino',
      items: [
        {
          id: 'reservations',
          label: 'Reservas de Áreas Comuns',
          desc: 'Salão de festas, churrasqueira, quadra',
          icon: 'calendar-outline',
          route: '/reservations',
        },
        {
          id: 'visitors',
          label: 'Controle de Visitantes & Entregas',
          desc: 'Liberar convidados com QR Code e encomendas',
          icon: 'key-outline',
          route: '/visitors',
        },
        {
          id: 'occurrences',
          label: 'Registro de Ocorrências',
          desc: 'Abrir chamados e acompanhar resolução',
          icon: 'construct-outline',
          route: '/occurrences',
        },
        {
          id: 'documents',
          label: 'Atas & Documentos Oficiais',
          desc: 'Regimento interno, balancetes e atas',
          icon: 'document-text-outline',
          route: '/documents',
        },
      ],
    },
    {
      title: 'Comunicação & Conteúdo',
      items: [
        {
          id: 'notices',
          label: 'Mural de Avisos',
          desc: 'Comunicados urgentes e notificações',
          icon: 'megaphone-outline',
          route: '/notices',
        },
        {
          id: 'news',
          label: 'Notícias & Melhorias',
          desc: 'Acompanhe as novidades do condomínio',
          icon: 'newspaper-outline',
          route: '/news',
        },
        {
          id: 'magazine',
          label: 'Revista Digital Portal Bragança',
          desc: 'Edições mensais em alta definição',
          icon: 'book-outline',
          route: '/magazine',
        },
        {
          id: 'advertisers',
          label: 'Guia de Anunciantes & Ofertas',
          desc: 'Descontos exclusivos Clube DING',
          icon: 'storefront-outline',
          route: '/advertisers',
        },
      ],
    },
    {
      title: 'Conta & Informações',
      items: [
        {
          id: 'profile',
          label: 'Meu Perfil & Unidade',
          desc: 'Editar dados cadastrais e senha',
          icon: 'person-outline',
          route: '/profile',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E3B2E" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu & Serviços</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {menuSections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuRow,
                    itemIdx < section.items.length - 1 && styles.menuRowBorder,
                  ]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons name={item.icon as any} size={20} color="#0E3B2E" />
                  </View>
                  <View style={styles.menuTexts}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Text style={styles.menuDesc}>{item.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Menu Inferior */}
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
    paddingHorizontal: 18,
    paddingVertical: 16,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0E3B2E',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTexts: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  menuDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
});
