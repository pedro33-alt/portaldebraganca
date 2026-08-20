import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function OccurrencesScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Manutenção');
  const [description, setDescription] = useState('');

  const [occurrences, setOccurrences] = useState([
    {
      id: 'oc-1',
      title: 'Lâmpada queimada no corredor do 1º andar',
      category: 'Manutenção',
      description: 'A iluminação em frente ao elevador social do bloco A está piscando e apagada desde ontem.',
      status: 'em_andamento',
      statusLabel: 'EM ANDAMENTO',
      statusColor: '#D97706',
      statusBg: '#FEF3C7',
      photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
      adminResponse: 'Equipe de manutenção já agendou a troca de lâmpada para hoje às 15h.',
      createdAt: 'Hoje às 08:30',
    },
    {
      id: 'oc-2',
      title: 'Barulho excessivo na área gourmet após as 22h',
      category: 'Convivência / Barulho',
      description: 'Som alto na área da churrasqueira após o horário permitido pelo regulamento interno.',
      status: 'resolvida',
      statusLabel: 'RESOLVIDA',
      statusColor: '#059669',
      statusBg: '#ECFDF5',
      adminResponse: 'Portaria orientou os ocupantes e o som foi desligado imediatamente.',
      createdAt: '15/08 às 22:45',
    }
  ]);

  const handleCreateOccurrence = () => {
    if (!title || !description) {
      Alert.alert('Atenção', 'Preencha o título e a descrição da ocorrência.');
      return;
    }

    const newOcc = {
      id: `oc-${Date.now()}`,
      title,
      category,
      description,
      status: 'aberta',
      statusLabel: 'ABERTA',
      statusColor: '#2563EB',
      statusBg: '#EFF6FF',
      adminResponse: 'Aguardando primeira análise da administração/síndico.',
      createdAt: 'Agora mesmo',
      photo: undefined
    };

    setOccurrences([newOcc, ...occurrences]);
    setModalVisible(false);
    setTitle('');
    setDescription('');

    Alert.alert(
      'Ocorrência Registrada! 📝',
      'Sua solicitação foi enviada para a administração do condomínio. Você receberá atualizações de status por notificação.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ocorrências & Chamados</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.newOccBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.newOccIcon}>➕</Text>
          <Text style={styles.newOccText}>Abrir Nova Ocorrência</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Histórico de Acompanhamento</Text>

        {occurrences.map((occ) => (
          <View key={occ.id} style={styles.occCard}>
            <View style={styles.occHeader}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{occ.category}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: occ.statusBg }]}>
                <Text style={[styles.statusBadgeText, { color: occ.statusColor }]}>
                  {occ.statusLabel}
                </Text>
              </View>
            </View>

            <Text style={styles.occTitle}>{occ.title}</Text>
            <Text style={styles.occDesc}>{occ.description}</Text>

            {occ.photo && (
              <Image source={{ uri: occ.photo }} style={styles.occImage} />
            )}

            <View style={styles.responseBox}>
              <Text style={styles.responseTitle}>💬 Resposta da Administração:</Text>
              <Text style={styles.responseText}>{occ.adminResponse}</Text>
            </View>

            <Text style={styles.occTime}>Registrado em: {occ.createdAt}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL DE NOVA OCORRÊNCIA */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Ocorrência</Text>
            <Text style={styles.modalSubtitle}>Relate problemas para o síndico e administração</Text>

            <Text style={styles.inputLabel}>Categoria:</Text>
            <View style={styles.categoryRow}>
              {['Manutenção', 'Barulho', 'Segurança', 'Limpeza'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catOption,
                    category === cat && styles.catOptionActive
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catOptionText,
                      category === cat && styles.catOptionTextActive
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Título Resumido:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Vazamento no hall de entrada"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.inputLabel}>Descrição Detalhada:</Text>
            <TextInput
              style={[styles.input, { height: 90 }]}
              placeholder="Descreva o que está acontecendo e a localização exata..."
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleCreateOccurrence}
              >
                <Text style={styles.confirmBtnText}>Registrar Ocorrência</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  newOccBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2C59',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
    gap: 8,
  },
  newOccIcon: {
    fontSize: 16,
  },
  newOccText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },
  occCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  occHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  catBadgeText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  occTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  occDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  occImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  responseBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0F2C59',
    marginBottom: 10,
  },
  responseTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2C59',
    marginBottom: 2,
  },
  responseText: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  occTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  catOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catOptionActive: {
    backgroundColor: '#0F2C59',
    borderColor: '#0F2C59',
  },
  catOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  catOptionTextActive: {
    color: '#FFFFFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontWeight: '700',
    color: '#475569',
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0F2C59',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
