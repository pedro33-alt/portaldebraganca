import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ReservationsScreen() {
  const router = useRouter();
  const [selectedArea, setSelectedArea] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  const [notes, setNotes] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [booked, setBooked] = useState(false);

  const areas = [
    {
      id: 'ca-1',
      name: 'Salão de Festas Gourmet',
      description: 'Espaço climatizado com churrasqueira, forno de pizza e capacidade para até 80 pessoas.',
      capacity: '80 pessoas',
      fee: 'R$ 150,00',
      image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800',
      rules: 'Horário limite: 22h. Proibido som excessivo.',
      status: 'Disponível'
    },
    {
      id: 'ca-2',
      name: 'Churrasqueira da Piscina',
      description: 'Área externa ao lado do deck da piscina com mesas, freezer e grelha.',
      capacity: '30 pessoas',
      fee: 'R$ 80,00',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      rules: 'Permitido até 20h. Limpeza inclusa na taxa.',
      status: 'Disponível'
    },
    {
      id: 'ca-3',
      name: 'Quadra de Beach Tennis / Poliesportiva',
      description: 'Quadra de areia e piso poliesportivo com iluminação noturna.',
      capacity: '20 pessoas',
      fee: 'Gratuito',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      rules: 'Uso gratuito mediante agendamento prévio.',
      status: 'Disponível'
    }
  ];

  const handleOpenBooking = (area: any) => {
    setSelectedArea(area);
    setModalVisible(true);
  };

  const handleConfirmBooking = () => {
    setModalVisible(false);
    setBooked(true);
    Alert.alert(
      'Reserva Solicitada com Sucesso! 🎉',
      `Sua solicitação para ${selectedArea?.name} no dia ${selectedDate} foi enviada para o Síndico/Administração e está com status PENDENTE.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Áreas Comuns & Reservas</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* MINHAS RESERVAS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Minhas Reservas Ativas</Text>
        </View>

        <View style={styles.activeReservationCard}>
          <View style={styles.resCardTop}>
            <Text style={styles.resAreaName}>Salão de Festas Gourmet</Text>
            <View style={styles.statusBadgeApproved}>
              <Text style={styles.statusTextApproved}>APROVADA</Text>
            </View>
          </View>
          <Text style={styles.resDate}>📅 25 de Agosto de 2026 • 18:00 às 22:00</Text>
          <Text style={styles.resUnit}>Unidade: Bloco A - Apto 101 (Carlos Silva)</Text>
        </View>

        {booked && (
          <View style={[styles.activeReservationCard, { borderColor: '#F59E0B' }]}>
            <View style={styles.resCardTop}>
              <Text style={styles.resAreaName}>{selectedArea?.name}</Text>
              <View style={[styles.statusBadgeApproved, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.statusTextApproved, { color: '#B45309' }]}>PENDENTE</Text>
              </View>
            </View>
            <Text style={styles.resDate}>📅 {selectedDate} • Horário Noturno</Text>
            <Text style={styles.resUnit}>Aguardando aprovação do síndico</Text>
          </View>
        )}

        {/* ESPAÇOS DISPONÍVEIS */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Espaços para Agendamento</Text>
        </View>

        {areas.map((area) => (
          <View key={area.id} style={styles.areaCard}>
            <Image source={{ uri: area.image }} style={styles.areaImage} />
            <View style={styles.areaInfo}>
              <View style={styles.areaTitleRow}>
                <Text style={styles.areaName}>{area.name}</Text>
                <Text style={styles.areaFee}>{area.fee}</Text>
              </View>
              <Text style={styles.areaDesc}>{area.description}</Text>
              
              <View style={styles.areaPills}>
                <Text style={styles.pillText}>👥 Capacidade: {area.capacity}</Text>
                <Text style={styles.pillText}>📋 {area.rules}</Text>
              </View>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={() => handleOpenBooking(area)}
              >
                <Text style={styles.bookButtonText}>Agendar Este Espaço</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL DE AGENDAMENTO */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reservar {selectedArea?.name}</Text>
            <Text style={styles.modalSubtitle}>Taxa de Uso: {selectedArea?.fee}</Text>

            <Text style={styles.inputLabel}>Data do Agendamento:</Text>
            <TextInput
              style={styles.input}
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="AAAA-MM-DD"
            />

            <Text style={styles.inputLabel}>Horário:</Text>
            <TextInput
              style={styles.input}
              value="18:00 às 22:00"
              editable={false}
            />

            <Text style={styles.inputLabel}>Finalidade / Observações:</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Ex: Confraternização em família, aniversário..."
              value={notes}
              onChangeText={setNotes}
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
                onPress={handleConfirmBooking}
              >
                <Text style={styles.confirmBtnText}>Confirmar Solicitação</Text>
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
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  activeReservationCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  resCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  resAreaName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusBadgeApproved: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTextApproved: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '800',
  },
  resDate: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
    marginTop: 2,
  },
  resUnit: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  areaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  areaImage: {
    width: '100%',
    height: 160,
  },
  areaInfo: {
    padding: 16,
  },
  areaTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  areaName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  areaFee: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2C59',
  },
  areaDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  areaPills: {
    gap: 4,
    marginBottom: 16,
  },
  pillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#0F2C59',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D4AF37',
    marginTop: 2,
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
