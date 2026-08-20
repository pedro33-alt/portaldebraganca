import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { API_BASE } from '../config';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async () => {
    if (!email) {
      Alert.alert('Atenção', 'Informe seu e-mail cadastrado.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        if (data.demo_code) {
          setCode(data.demo_code);
          Alert.alert(
            'Código Enviado!',
            `O código de recuperação de teste é: ${data.demo_code}`
          );
        } else {
          Alert.alert('Código Enviado!', 'Verifique a caixa de entrada do seu e-mail.');
        }
        setStep('reset');
      } else {
        Alert.alert('Erro', data.error || 'Não foi possível enviar o código.');
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) {
      Alert.alert('Atenção', 'Informe o código e a nova senha.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas digitadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword })
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        Alert.alert('Sucesso! 🎉', 'Sua senha foi redefinida. Faça login com a nova senha.');
        router.replace('/login' as any);
      } else {
        Alert.alert('Erro', data.error || 'Código inválido ou expirado.');
      }
    } catch (err) {
      setLoading(false);
      Alert.alert('Erro', 'Falha na conexão com o servidor.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E3B2E" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recuperar Senha</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {step === 'request' ? (
            <>
              <Text style={styles.title}>Esqueceu sua senha?</Text>
              <Text style={styles.sub}>
                Digite seu e-mail cadastrado para enviarmos um código de 6 dígitos para redefinição.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-MAIL CADASTRADO</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ex: morador@portalbraganca.com.br"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={handleRequestCode}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0E3B2E" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Enviar Código de Recuperação →</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Definir Nova Senha</Text>
              <Text style={styles.sub}>
                Insira o código enviado para <Text style={{ fontWeight: '800', color: '#111827' }}>{email}</Text> e digite sua nova senha.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CÓDIGO DE 6 DÍGITOS</Text>
                <TextInput
                  style={[styles.input, { letterSpacing: 4, textAlign: 'center', fontSize: 18, fontWeight: '900' }]}
                  placeholder="123456"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={setCode}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>NOVA SENHA</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONFIRMAR NOVA SENHA</Text>
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
                style={styles.btnPrimary}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0E3B2E" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Salvar Nova Senha →</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep('request')}>
                <Text style={styles.btnSecondaryText}>Reenviar código</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
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
  content: {
    padding: 18,
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  sub: {
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 14,
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
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  btnPrimary: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  btnPrimaryText: {
    color: '#0E3B2E',
    fontSize: 14,
    fontWeight: '900',
  },
  btnSecondary: {
    alignItems: 'center',
    marginTop: 12,
  },
  btnSecondaryText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
});

