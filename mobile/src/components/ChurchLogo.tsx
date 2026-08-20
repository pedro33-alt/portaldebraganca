import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

interface ChurchLogoProps {
  size?: number;
  color?: string;
}

export default function ChurchLogo({ size = 38, color = '#D4AF37' }: ChurchLogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Ícone de Igreja / Fachada Histórica Dourada */}
      <MaterialCommunityIcons name="church" size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
