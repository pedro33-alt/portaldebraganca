import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

interface BottomNavProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export default function BottomNavigation({ activeTab = 'home', onSelectTab }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      id: 'home',
      label: 'Início',
      iconActive: 'home',
      iconInactive: 'home-outline',
      route: '/',
    },
    {
      id: 'news',
      label: 'Notícias',
      iconActive: 'newspaper',
      iconInactive: 'newspaper-outline',
      route: '/news',
    },
    {
      id: 'advertisers',
      label: 'Anunciantes',
      iconActive: 'storefront',
      iconInactive: 'storefront-outline',
      route: '/advertisers',
    },
    {
      id: 'magazine',
      label: 'Revista',
      iconActive: 'book',
      iconInactive: 'book-outline',
      route: '/magazine',
    },
    {
      id: 'menu',
      label: 'Menu',
      iconActive: 'menu',
      iconInactive: 'menu-outline',
      route: '/explore',
    },
  ];

  const handleTabPress = (tab: typeof tabs[0]) => {
    if (onSelectTab) {
      onSelectTab(tab.id);
    }
    if (tab.route === '/') {
      router.push('/');
    } else {
      router.push(tab.route as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        {tabs.map((tab) => {
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'home' && (pathname === '/' || pathname === '')) ||
            (tab.id === 'news' && pathname.includes('news')) ||
            (tab.id === 'advertisers' && pathname.includes('advertisers')) ||
            (tab.id === 'magazine' && pathname.includes('magazine')) ||
            (tab.id === 'menu' && pathname.includes('explore'));

          const iconName = isActive ? tab.iconActive : tab.iconInactive;
          const color = isActive ? '#0E3B2E' : '#6B7280';

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabItem}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
            >
              <Ionicons name={iconName as any} size={22} color={color} />
              <Text style={[styles.tabLabel, { color, fontWeight: isActive ? '700' : '500' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 8,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minWidth: 60,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
  },
});
