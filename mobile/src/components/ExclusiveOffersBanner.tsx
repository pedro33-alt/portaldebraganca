import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ExclusiveOffersBanner() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Ícone de fundo transparente decorativo (Marca d'água) */}
      <View style={styles.watermarkContainer}>
        <Ionicons name="bag-handle-outline" size={110} color="rgba(255, 255, 255, 0.05)" />
      </View>

      {/* Ícone dourado de etiqueta / desconto */}
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="tag-outline" size={28} color="#FFFFFF" />
      </View>

      {/* Textos */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Ofertas exclusivas{"\n"}para moradores!</Text>
        <Text style={styles.subtitle}>Descontos especiais dos nossos anunciantes parceiros.</Text>
      </View>

      {/* Botão Dourado */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/advertisers')}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Ver ofertas</Text>
        <Ionicons name="chevron-forward" size={14} color="#0E3B2E" style={{ marginLeft: 2 }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#0E3B2E', // Verde escuro premium
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#0E3B2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  watermarkContainer: {
    position: 'absolute',
    right: 30,
    bottom: -20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#D4AF37', // Dourado
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  subtitle: {
    color: '#D1D5DB',
    fontSize: 10,
    marginTop: 3,
    lineHeight: 13,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37', // Dourado
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: '#0E3B2E', // Texto verde escuro
    fontSize: 12,
    fontWeight: '800',
  },
});
