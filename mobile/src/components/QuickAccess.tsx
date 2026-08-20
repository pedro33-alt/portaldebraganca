import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface QuickAccessItem {
  id: string;
  title: string;
  iconType: 'ionicons' | 'material' | 'feather' | 'fa5';
  iconName: string;
  route: string;
}

export default function QuickAccess() {
  const router = useRouter();

  const items: QuickAccessItem[] = [
    {
      id: 'notices',
      title: 'Avisos',
      iconType: 'ionicons',
      iconName: 'megaphone-outline',
      route: '/notices',
    },
    {
      id: 'news',
      title: 'Notícias',
      iconType: 'ionicons',
      iconName: 'newspaper-outline',
      route: '/news',
    },
    {
      id: 'advertisers',
      title: 'Anunciantes',
      iconType: 'ionicons',
      iconName: 'storefront-outline',
      route: '/advertisers',
    },
    {
      id: 'magazine',
      title: 'Revista',
      iconType: 'ionicons',
      iconName: 'book-outline',
      route: '/magazine',
    },
  ];

  const renderIcon = (item: QuickAccessItem) => {
    const iconColor = '#0E3B2E';
    const iconSize = 28;

    if (item.iconType === 'ionicons') {
      return <Ionicons name={item.iconName as any} size={iconSize} color={iconColor} />;
    }
    if (item.iconType === 'material') {
      return <MaterialCommunityIcons name={item.iconName as any} size={iconSize} color={iconColor} />;
    }
    return <Ionicons name="apps-outline" size={iconSize} color={iconColor} />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Acesso rápido</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>{renderIcon(item)}</View>
            <Text style={styles.cardTitle}>{item.title}</Text>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});
