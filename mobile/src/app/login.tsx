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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (customEmail?: string, customPass?: string) => {
    const targetEmail = customEmail || email;
    const targetPass = customPass || password;

    if (!targetEmail || !targetPass) {
      Alert.alert('Atenção', 'Por favor, informe seu e-mail e senha.');
      return;
    }

    setLoading(true);
    const res = await login(targetEmail, targetPass);
    setLoading(false);

    if (res.success) {
      Alert.alert('Bem-vindo!', 'Login realizado com sucesso.');
      router.replace('/');
    } else {
      Alert.alert('Erro ao Entrar', res.error || 'Credenciais inválidas.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0E3B2E" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* TOPO / MARCA */}
          <View style={styles.brandBox}>
            <View style={styles.logoCircle}>
              <Ionicons name="business" size={36} color="#D4AF37" />
            </View>
            <Text style={styles.brandDing}>CLUBE DING</Text>
            <Text style={styles.brandTitle}>Portal Bragança</Text>
            <Text style={styles.brandSubtitle}>Residencial Portal de Bragança</Text>
          </View>

          {/* CARD DE FORMULÁRIO */}
          <View style={styles.formCard}>
            <Text style={styles.welcomeTitle}>Acesse sua conta</Text>
            <Text style={styles.welcomeSub}>Mural, avisos, notícias e benefícios exclusivos</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-MAIL DO MORADOR</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder="ex: morador@portalbraganca.com.br"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SENHA</Text>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
                <TextInput
                  style={styles.textInput}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push('/forgot-password' as any)}
            >
              <Text style={styles.forgotBtnText}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => handleLogin()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0E3B2E" />
              ) : (
                <Text style={styles.loginBtnText}>Entrar no Aplicativo →</Text>
              )}
            </TouchableOpacity>

            {/* ATALHOS DE TESTE RÁPIDO */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>💡 ATALHOS DE TESTE RÁPIDO:</Text>
              <View style={styles.demoRow}>
                <TouchableOpacity
                  style={styles.demoBtn}
                  onPress={() => {
                    setEmail('morador.teste@rosariofatima.com.br');
                    setPassword('123456');
                    handleLogin('morador.teste@rosariofatima.com.br', '123456');
                  }}
                >
                  <Text style={styles.demoBtnText}>🌹 Morador Teste (Rosário de Fátima)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoBtn}
                  onPress={() => {
                    setEmail('morador@portalbraganca.com.br');
                    setPassword('123456');
                    handleLogin('morador@portalbraganca.com.br', '123456');
                  }}
                >
                  <Text style={styles.demoBtnText}>🏠 Morador (Portal de Bragança)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoBtn}
                  onPress={() => {
                    setEmail('sindico@portalbraganca.com.br');
                    setPassword('123456');
                    handleLogin('sindico@portalbraganca.com.br', '123456');
                  }}
                >
                  <Text style={styles.demoBtnText}>🔑 Entrar como Síndica</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => router.push('/register' as any)}
            >
              <Text style={styles.registerBtnText}>
                Ainda não tem conta? <Text style={{ color: '#0E3B2E', fontWeight: '800' }}>Cadastre-se</Text>
              </Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    minHeight: '100%',
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    marginBottom: 8,
  },
  brandDing: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D4AF37',
    letterSpacing: 2,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  welcomeSub: {
    fontSize: 12.5,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    height: 48,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#111827',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 18,
  },
  forgotBtnText: {
    fontSize: 12,
    color: '#0E3B2E',
    fontWeight: '700',
  },
  loginBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  loginBtnText: {
    color: '#0E3B2E',
    fontSize: 14.5,
    fontWeight: '900',
  },
  demoSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  demoTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  demoRow: {
    gap: 6,
  },
  demoBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  demoBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#374151',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  registerBtn: {
    alignItems: 'center',
  },
  registerBtnText: {
    fontSize: 12.5,
    color: '#4B5563',
  },
});
