/**
 * Tema INCOS aislado para la vista Matrícula v2 (no modifica el tema global de la app).
 */

export const incosColors = {
  brand: {
    50: '#eef7f1',
    100: '#d4ebdc',
    500: '#157347',
    600: '#0e6038',
    700: '#0a4f2d',
  },
  semantic: {
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#1d4e89',
  },
  neutral: {
    bg: '#f8fafc',
    surface: '#ffffff',
    border: '#eef0f2',
    muted: '#6b7280',
    text: '#0f172a',
  },
  careers: {
    'contaduria-general': '#0d6e3d',
    'sistemas-informaticos': '#1d4e89',
    administracion: '#7a4cb8',
    marketing: '#c7522a',
    secretariado: '#0a8a96',
    electronica: '#a16207',
  },
};

export const incosTheme = {
  token: {
    colorPrimary: incosColors.brand[600],
    colorSuccess: incosColors.semantic.success,
    colorWarning: incosColors.semantic.warning,
    colorError: incosColors.semantic.danger,
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  components: {
    Table: {
      headerBg: '#fafbfc',
      headerColor: incosColors.neutral.muted,
      headerSplitColor: 'transparent',
      rowHoverBg: incosColors.brand[50],
    },
    Button: {
      primaryShadow: 'none',
    },
  },
};

export default incosTheme;
