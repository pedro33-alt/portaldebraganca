import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import BottomNavigation from '@/components/BottomNavigation';

import { API_BASE } from '../config';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile, token } = useAuth();

  const [pushEnabled, setPushEnabled] = useState(true);

  // Edição de Perfil
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || 'Carlos Silva');
  const [editPhone, setEditPhone] = useState('(11) 98765-4321');
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Modal Alteração de Senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Lista de Avatares para Troca Rápida
  const avatarOptions = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  ];

  const handleSelectAvatar = async (avatarUrl: string) => {
    const res = await updateProfile(user?.name || editName, editPhone, avatarUrl);
    if (res.success) {
      Alert.alert('Avatar Atualizado!', 'Sua foto de perfil foi alterada com sucesso.');
    }
  };

  const handleSaveProfile = async () => {
    if (!editName) {
      Alert.alert('Erro', 'O nome não pode ficar vazio.');
      return;
    }
    setLoadingEdit(true);
    const res = await updateProfile(editName, editPhone);
    setLoadingEdit(false);
    if (res.success) {
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } else {
      Alert.alert('Erro', res.error || 'Erro ao atualizar perfil.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Atenção', 'Informe a senha atual e a nova senha.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          'x-mock-user-email': user?.email || ''
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      });

      const data = await res.json();
      setLoadingPassword(false);

      if (res.ok) {
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Alert.alert('Senha Alterada! 🔒', 'Sua senha de acesso foi atualizada com sucesso.');
      } else {
        Alert.alert('Erro', data.error || 'Senha atual incorreta.');
      }
    } catch (err) {
      setLoadingPassword(false);
      Alert.alert('Erro', 'Falha na conexão.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Encerrar Sessão',
      'Deseja realmente sair da sua conta no aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login' as any);
          }
        }
      ]
    );
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'sindico':
        return { label: '🔑 SÍNDICO(A)', bg: '#FEF3C7', color: '#B45309' };
      case 'admin_condo':
      case 'admin_ding':
        return { label: '👑 ADMINISTRADOR', bg: '#EFF6FF', color: '#1D4ED8' };
      case 'anunciante':
        return { label: '⭐ PARCEIRO DING', bg: '#FFFBEB', color: '#B45309' };
      default:
        return { label: '🏠 MORADOR TITULAR', bg: '#ECFDF5', color: '#059669' };
    }
  };

  const roleInfo = getRoleLabel(user?.role);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E3B2E" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil & Conta</Text>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editHeaderBtn}
        >
          <Ionicons name={isEditing ? 'close' : 'create-outline'} size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* CARD PRINCIPAL DO PERFIL */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{
                uri: user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
              }}
              style={styles.avatar}
            />
            <View style={styles.cameraIconBadge}>
              <Ionicons name="camera" size={14} color="#0E3B2E" />
            </View>
          </View>

          {/* Troca Rápida de Avatar */}
          <Text style={styles.avatarPickerTitle}>Trocar Foto de Perfil:</Text>
          <View style={styles.avatarPickerRow}>
            {avatarOptions.map((av, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSelectAvatar(av)}
                style={[
                  styles.avatarOptionCircle,
                  user?.avatar_url === av && styles.avatarOptionSelected,
                ]}
              >
                <Image source={{ uri: av }} style={styles.miniAvatar} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.roleBadge, { backgroundColor: roleInfo.bg }]}>
            <Text style={[styles.roleBadgeText, { color: roleInfo.color }]}>
              {roleInfo.label}
            </Text>
          </View>

          {isEditing ? (
            <View style={styles.editBox}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NOME:</Text>
                <TextInput
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>TELEFONE / WHATSAPP:</Text>
                <TextInput
                  style={styles.input}
                  value={editPhone}
                  onChangeText={setEditPhone}
                />
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveProfile}
                disabled={loadingEdit}
              >
                {loadingEdit ? (
                  <ActivityIndicator color="#0E3B2E" />
                ) : (
                  <Text style={styles.saveBtnText}>Salvar Alterações</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.userName}>{user?.name || 'Carlos Silva'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'morador@portalbraganca.com.br'}</Text>
              <Text style={styles.userUnit}>
                {user?.unit_id || 'Bloco A • Apto 101'}
              </Text>
            </>
          )}
        </View>

        {/* CONDOMÍNIO ATIVO */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="business-outline" size={20} color="#0E3B2E" />
            <Text style={styles.sectionTitle}>Condomínio Ativo</Text>
          </View>
          <Text style={styles.condoName}>Residencial Portal de Bragança</Text>
          <Text style={styles.condoAddress}>
            Av. Salvador Markovicz, 1251 - Lagos de Santa Helena • Bragança Paulista - SP
          </Text>
        </View>

        {/* SEGURANÇA & SENHA */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#0E3B2E" />
            <Text style={styles.sectionTitle}>Segurança da Conta</Text>
          </View>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="key-outline" size={18} color="#4B5563" />
              <Text style={styles.actionRowText}>Alterar Senha de Acesso</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* PREFERÊNCIAS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="notifications-outline" size={20} color="#0E3B2E" />
            <Text style={styles.sectionTitle}>Notificações do Condomínio</Text>
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchTitle}>Alertas Push no Celular</Text>
              <Text style={styles.switchDesc}>Receba avisos urgentes, encomendas e liberação de visitantes</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            />
          </View>
        </View>

        {/* BOTÃO DE LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutBtnText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* MODAL ALTERAR SENHA */}
      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Alterar Senha</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SENHA ATUAL:</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="••••••••"
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NOVA SENHA (MÍNIMO 6 DÍGITOS):</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="••••••••"
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CONFIRMAR NOVA SENHA:</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleChangePassword}
              disabled={loadingPassword}
            >
              {loadingPassword ? (
                <ActivityIndicator color="#0E3B2E" />
              ) : (
                <Text style={styles.btnPrimaryText}>Confirmar Alteração →</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  editHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#D4AF37',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarPickerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  avatarOptionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: '#D4AF37',
  },
  miniAvatar: {
    width: '100%',
    height: '100%',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  userEmail: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 2,
  },
  userUnit: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0E3B2E',
    marginTop: 4,
  },
  editBox: {
    width: '100%',
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#111827',
  },
  saveBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#0E3B2E',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  condoName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0E3B2E',
  },
  condoAddress: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionRowText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  switchDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 13.5,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  btnPrimary: {
    backgroundColor: '#D4AF37',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  btnPrimaryText: {
    color: '#0E3B2E',
    fontSize: 13.5,
    fontWeight: '900',
  },
});

