import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE } from '../config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'morador' | 'sindico' | 'porteiro' | 'admin_condo' | 'admin_ding' | 'anunciante';
  condominium_id?: string;
  unit_id?: string;
  avatar_url?: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone: string, avatar_url?: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar sessão persistente do AsyncStorage
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@portal_token');
        const storedUser = await AsyncStorage.getItem('@portal_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // Usuário padrão de demonstração se não houver sessão gravada
          const defaultUser: User = {
            id: '20000000-0000-0000-0000-000000000001',
            name: 'Carlos Silva',
            email: 'morador@portalbraganca.com.br',
            role: 'morador',
            condominium_id: '00000000-0000-0000-0000-000000000001',
            unit_id: 'Bloco A • Apto 101',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
          };
          setUser(defaultUser);
        }
      } catch (err) {
        console.error('Erro ao carregar sessão:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao realizar login' };
      }

      setUser(data.user);
      setToken(data.token);

      await AsyncStorage.setItem('@portal_token', data.token);
      await AsyncStorage.setItem('@portal_user', JSON.stringify(data.user));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'Não foi possível conectar ao servidor.' };
    }
  };

  const register = async (userData: any) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Erro ao cadastrar' };
      }

      setUser(data.user);
      setToken(data.token);

      await AsyncStorage.setItem('@portal_token', data.token);
      await AsyncStorage.setItem('@portal_user', JSON.stringify(data.user));

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erro de conexão com o servidor.' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@portal_token');
      await AsyncStorage.removeItem('@portal_user');
      setUser(null);
      setToken(null);
    } catch (err) {
      console.error('Erro no logout:', err);
    }
  };

  const updateProfile = async (name: string, phone: string, avatar_url?: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
          'x-mock-user-id': user?.id || ''
        },
        body: JSON.stringify({ name, phone, avatar_url })
      });

      if (res.ok) {
        const updatedUser = {
          ...user!,
          name,
          avatar_url: avatar_url || user?.avatar_url
        };
        setUser(updatedUser);
        await AsyncStorage.setItem('@portal_user', JSON.stringify(updatedUser));
        return { success: true };
      }
      return { success: false, error: 'Erro ao atualizar perfil' };
    } catch (err) {
      return { success: false, error: 'Erro de conexão' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

