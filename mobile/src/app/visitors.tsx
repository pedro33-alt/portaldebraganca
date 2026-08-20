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
} from 'react-native';
import { useRouter } from 'expo-router';

export default function VisitorsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'visitors' | 'deliveries'>('visitors');
  const [modalVisible, setModalVisible] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorDoc, setVisitorDoc] = useState('');
  const [visitorPlate, setVisitorPlate] = useState('');
  const [visitorList, setVisitorList] = useState([
    {
      id: 'vis-1',
      name: 'Mariana Lima',
      doc: '12.345.678-9',
      plate: 'BRA2E19',
      date: 'Hoje, 20/08 às 14:00',
      status: 'AUTORIZADO',
      code: 'QR-8812'
    },
    {
      id: 'vis-2',
      name: 'Marcos Vinicius (Eletricista)',
      doc: '98.765.432-1',
      plate: 'Eletro-Service',
      date: 'Ontem, 19/08 às 09:30',
      status: 'CONCLUÍDO',
      code: 'QR-4491'
    }
  ]);

  const deliveries = [
    {
      id: 'del-1',
      company: 'Mercado Livre',
      tracking: 'BR123456789SP',
      receivedAt: 'Hoje às 11:15',
      receivedBy: 'Roberto Santos (Porteiro)',
      status: 'AGUARDANDO RETIRADA'
    },
    {
      id: 'del-2',
      company: 'Amazon Prime',
      tracking: 'AMZ-998822',
      receivedAt: '18/08 às 15:40',
      receivedBy: 'Roberto Santos (Porteiro)',
      status: 'ENTREGUE AO MORADOR'
    }
  ];

  const handleAuthorizeVisitor = () => {
    if (!visitorName) {
      Alert.alert('Atenção', 'Digite o nome do visitante.');
      return;
    }

    const newVis = {
      id: `vis-${Date.now()}`,
      name: visitorName,
      doc: visitorDoc || 'Não informado',
      plate: visitorPlate || 'Sem veículo',
      date: 'Hoje às 18:00',
      status: 'AUTORIZADO',
      code: `QR-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setVisitorList([newVis, ...visitorList]);
    setModalVisible(false);
    setVisitorName('');
    setVisitorDoc('');
    setVisitorPlate('');

    Alert.alert(
      'Visitante Autorizado na Portaria! 🔑',
      `O visitante ${newVis.name} foi adicionado à lista da portaria com o código de acesso ${newVis.code}.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portaria & Acesso</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* ABAS: VISITANTES VS ENCOMENDAS */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'visitors' && styles.tabBtnActive]}
          onPress={() => setTab('visitors')}
        >
          <Text style={[styles.tabText, tab === 'visitors' && styles.tabTextActive]}>
            Visitantes & Convidados
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === 'deliveries' && styles.tabBtnActive]}
          onPress={() => setTab('deliveries')}
        >
          <Text style={[styles.tabText, tab === 'deliveries' && styles.tabTextActive]}>
            Encomendas (1)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'visitors' ? (
          <>
            <TouchableOpacity
              style={styles.newVisitorBtn}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.newVisitorIcon}>➕</Text>
              <Text style={styles.newVisitorText}>Liberar Novo Visitante / Prestador</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Histórico e Convites de Acesso</Text>

            {visitorList.map((vis) => (
              <View key={vis.id} style={styles.visCard}>
                <View style={styles.visCardHeader}>
                  <Text style={styles.visName}>{vis.name}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: vis.status === 'AUTORIZADO' ? '#ECFDF5' : '#F1F5F9' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: vis.status === 'AUTORIZADO' ? '#059669' : '#64748B' }
                      ]}
                    >
                      {vis.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.visDetail}>📄 Documento: {vis.doc}</Text>
                <Text style={styles.visDetail}>🚗 Veículo / Placa: {vis.plate}</Text>
                <Text style={styles.visDetail}>⏰ Horário: {vis.date}</Text>

                <View style={styles.qrRow}>
                  <Text style={styles.qrCodeText}>CÓDIGO PORTARIA: {vis.code}</Text>
                  <TouchableOpacity
                    style={styles.shareBtn}
                    onPress={() => Alert.alert('Compartilhar', `Código enviado via WhatsApp para o visitante!`)}
                  >
                    <Text style={styles.shareBtnText}>Enviar Convite 📲</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Entregas Recebidas na Portaria</Text>

            {deliveries.map((del) => (
              <View key={del.id} style={styles.delCard}>
                <View style={styles.visCardHeader}>
                  <Text style={styles.visName}>📦 {del.company}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          del.status === 'AGUARDANDO RETIRADA' ? '#FEF3C7' : '#ECFDF5'
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color:
                            del.status === 'AGUARDANDO RETIRADA' ? '#D97706' : '#059669'
                        }
                      ]}
                    >
                      {del.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.visDetail}>Rastreio: {del.tracking}</Text>
                <Text style={styles.visDetail}>Recebido em: {del.receivedAt}</Text>
                <Text style={styles.visDetail}>Por: {del.receivedBy}</Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL DE CADASTRO DE VISITANTE */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Autorizar Visitante / Prestador</Text>
            <Text style={styles.modalSubtitle}>Unidade: Bloco A - Apto 101</Text>

            <Text style={styles.inputLabel}>Nome Completo do Visitante:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: João da Silva"
              value={visitorName}
              onChangeText={setVisitorName}
            />

            <Text style={styles.inputLabel}>RG ou CPF:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 12.345.678-9"
              value={visitorDoc}
              onChangeText={setVisitorDoc}
            />

            <Text style={styles.inputLabel}>Placa do Veículo (Opcional):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: ABC-1234"
              value={visitorPlate}
              onChangeText={setVisitorPlate}
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
                onPress={handleAuthorizeVisitor}
              >
                <Text style={styles.confirmBtnText}>Gerar Acesso Portaria</Text>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F2C59',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#0F2C59',
    fontWeight: '800',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  newVisitorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2C59',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
    gap: 8,
    elevation: 3,
  },
  newVisitorIcon: {
    fontSize: 16,
  },
  newVisitorText: {
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
  visCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  delCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  visCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  visDetail: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 3,
  },
  qrRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  qrCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2C59',
  },
  shareBtn: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2C59',
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
