import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface NewsItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  date: string;
  imageUrl: string;
}

export default function LatestNewsSection() {
  const router = useRouter();

  const newsList: NewsItem[] = [
    {
      id: '1',
      category: 'HISTÓRIA & SEDE',
      title: 'Casa Sede da Fazenda Santa Petronila',
      summary: 'A histórica casa sede foi preservada e transformada no centro de convivência e lazer dos moradores.',
      date: '18 de ago. de 2026',
      imageUrl: 'https://yata.s3-object.locaweb.com.br/9352aae294fc6baecb7ca73ffe02235a1603662f1414062d39979dd432c27d71',
    },
    {
      id: '2',
      category: 'MEIO AMBIENTE',
      title: 'Preservação dos 4 Lagos e da Fauna Local',
      summary: 'Nosso compromisso com a natureza mantém os 4 lagos limpos e a rica fauna silvestre protegida.',
      date: '14 de ago. de 2026',
      imageUrl: 'https://yata.s3-object.locaweb.com.br/11fcf3e2c9e9597676fec76f5ff707830600e27c80cabd421996f07a471f156a',
    },
    {
      id: '3',
      category: 'CONVIVÊNCIA',
      title: 'Domingo da Família na Alameda Principal',
      summary: 'Aos domingos, a rua principal é fechada para caminhadas, passeios e brincadeiras das crianças.',
      date: '10 de ago. de 2026',
      imageUrl: 'https://yata.s3-object.locaweb.com.br/36ad4caac07d52d7888f785ded8283ee8be0b4fae6c6ca111c1430f1cb633729',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header com título e "Ver todas" */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Últimas notícias</Text>
        <TouchableOpacity
          onPress={() => router.push('/news')}
          style={styles.seeAllButton}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Ver todas</Text>
          <Ionicons name="chevron-forward" size={14} color="#6B7280" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>

      {/* Lista de notícias em formato de cards horizontais */}
      <View style={styles.list}>
        {newsList.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push('/news')}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.content}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.summary} numberOfLines={2}>
                {item.summary}
              </Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  category: {
    color: '#2E7D32', // Verde institucional
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  summary: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 15,
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
