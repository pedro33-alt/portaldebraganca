import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#0E3B2E',         // Verde escuro institucional / sofisticado
    primaryDark: '#09291F',     // Verde ultra escuro para degradês e contraste
    primaryLight: '#1B5E46',    // Verde médio para badges e tags
    secondary: '#D4AF37',       // Dourado clássico
    gold: '#D4AF37',            // Dourado
    goldLight: '#F3C642',       // Dourado luminoso
    goldBg: '#FBF5E6',          // Fundo dourado suave
    accent: '#2563EB',
    text: '#111827',            // Texto principal escuro
    textSecondary: '#4B5563',   // Texto secundário cinza médio
    textMuted: '#9CA3AF',       // Texto sutil / datas
    textOnPrimary: '#FFFFFF',   // Texto sobre fundo verde
    background: '#F8F9FA',      // Off-white / fundo limpo do app
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF2F6',
    border: '#E5E7EB',          // Bordas sutis
    card: '#FFFFFF',            // Cards brancos com elevação suave
    cardBorder: '#F0F2F5',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    tagGreenBg: '#E8F5E9',      // Fundo de tags verdes
    tagGreenText: '#2E7D32',    // Texto de tags verdes
  },
  dark: {
    primary: '#0E3B2E',
    primaryDark: '#071F17',
    primaryLight: '#1B5E46',
    secondary: '#D4AF37',
    gold: '#D4AF37',
    goldLight: '#F3C642',
    goldBg: '#2A2312',
    accent: '#60A5FA',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
    background: '#0B1511',
    backgroundElement: '#13231D',
    backgroundSelected: '#1C332A',
    border: '#1F3A30',
    card: '#13231D',
    cardBorder: '#1A3329',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    tagGreenBg: '#1B382B',
    tagGreenText: '#81C784',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
