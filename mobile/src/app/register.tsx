import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [block, setBlock] = useState('Bloco A');
  const [unitNumber, setUnitNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !unitNumber) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas digitadas não coincidem.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Senha Fraca', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    const res = await register({
      name,
      email,
      phone,
      block,
      unit_number: unitNumber,
      password
    });
    setLoading(false);

    if (res.success) {
      Alert.alert('Conta Criada!', 'Seu cadastro de morador foi realizado com sucesso.');
      router.replace('/');
    } else {
      Alert.alert('Erro no Cadastro', res.error || 'Não foi possível cadastrar.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E3B2E" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Conta de Morador</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.formCard}>
            <Text style={styles.cardHeading}>Cadastro de Morador</Text>
            <Text style={styles.cardSub}>Informe seus dados para acessar o aplicativo do residencial</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NOME COMPLETO *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Carlos Silva"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-MAIL *</Text>
              <TextInput
                style={styles.input}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>TELEFONE / WHATSAPP</Text>
              <TextInput
                style={styles.input}
                placeholder="(11) 98765-4321"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>BLOCO / ALAMEDA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Bloco A"
                  placeholderTextColor="#9CA3AF"
                  value={block}
                  onChangeText={setBlock}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>UNIDADE / APTO *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="101"
                  placeholderTextColor="#9CA3AF"
                  value={unitNumber}
                  onChangeText={setUnitNumber}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CRIAR SENHA (MÍNIMO 6 DÍGITOS) *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CONFIRMAR SENHA *</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0E3B2E" />
              ) : (
                <Text style={styles.submitBtnText}>Finalizar Cadastro →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backToLogin} onPress={() => router.back()}>
              <Text style={styles.backToLoginText}>Já tem uma conta? <Text style={{ color: '#0E3B2E', fontWeight: '800' }}>Fazer Login</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  cardSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roleOptionActive: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D4AF37',
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  roleOptionTextActive: {
    color: '#B45309',
    fontWeight: '800',
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
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  submitBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#0E3B2E',
    fontSize: 14,
    fontWeight: '900',
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: 14,
  },
  backToLoginText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
