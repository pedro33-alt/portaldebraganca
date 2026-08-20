import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function DocumentsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Regulamentos', 'Atas', 'Financeiro'];

  const documents = [
    {
      id: 'doc-1',
      title: 'Regulamento Interno do Condomínio',
      category: 'Regulamentos',
      date: '01/08/2026',
      size: '2.4 MB',
      description: 'Direitos, deveres, regras de uso das áreas de lazer e normas de convivência.'
    },
    {
      id: 'doc-2',
      title: 'Ata da Assembleia Geral Extraordinária (AGE)',
      category: 'Atas',
      date: '28/07/2026',
      size: '1.1 MB',
      description: 'Aprovação das obras de revitalização das áreas verdes e novos procedimentos da portaria.'
    },
    {
      id: 'doc-3',
      title: 'Prestação de Contas & Balancete - Junho 2026',
      category: 'Financeiro',
      date: '15/07/2026',
      size: '850 KB',
      description: 'Relatório financeiro detalhado de despesas ordinárias e fundo de reserva.'
    }
  ];

  const filtered = selectedCategory === 'Todos'
    ? documents
    : documents.filter(d => d.category === selectedCategory);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documentos & PDFs</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* CATEGORIAS */}
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBtn, selectedCategory === cat && styles.catBtnActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.catBtnText, selectedCategory === cat && styles.catBtnTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filtered.map((doc) => (
          <View key={doc.id} style={styles.docCard}>
            <View style={styles.docIconBox}>
              <Text style={styles.docIcon}>📄</Text>
            </View>

            <View style={styles.docInfo}>
              <View style={styles.badgeRow}>
                <View style={styles.catBadge}>
                  <Text style={styles.catBadgeText}>{doc.category}</Text>
                </View>
                <Text style={styles.docDate}>{doc.date} • {doc.size}</Text>
              </View>

              <Text style={styles.docTitle}>{doc.title}</Text>
              <Text style={styles.docDesc}>{doc.description}</Text>

              <TouchableOpacity
                style={styles.downloadBtn}
                onPress={() => Alert.alert('Download PDF', `Abrindo arquivo: ${doc.title} (${doc.size})...`)}
              >
                <Text style={styles.downloadBtnText}>📥 Visualizar / Baixar PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F2C59',
  },
  header: {
    backgroundColor: '#0F2C59',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  categoryRow: {
    flexDirection: 'row',
    backgroundColor: '#0F2C59',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  catBtnActive: {
    backgroundColor: '#D4AF37',
  },
  catBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  catBtnTextActive: {
    color: '#0F2C59',
    fontWeight: '800',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  docIcon: {
    fontSize: 22,
  },
  docInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  catBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  docDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  docDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  downloadBtn: {
    backgroundColor: '#0F2C59',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
