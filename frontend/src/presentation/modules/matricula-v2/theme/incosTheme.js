/**
 * Tema INCOS aislado para la vista Matrícula v2 (no modifica el tema global de la app).
 *
 * ÚNICO lugar del módulo con valores literales de color. La paleta deriva de la
 * marca (logos del instituto) documentada en docs/plan/REVAMP.md §3:
 *   verde #007848 (primario) · #006048 / #004830 (oscuros) ·
 *   dorado #E0A82E · rojo #C0282A · azul #5080E0.
 * Las CSS vars (matricula-v2-theme-vars.css) y los tokens de AntD se derivan de
 * aquí; no se clonan hex sueltos en componentes ni en el ConfigProvider.
 */

export const incosColors = {
  brand: {
    50: '#e3f2ea',
    100: '#bfe0cf',
    500: '#007848',
    600: '#006048',
    700: '#004830',
  },
  semantic: {
    success: '#16a34a',
    warning: '#b07e10',
    danger: '#c0282a',
    info: '#3d6dd0',
  },
  neutral: {
    bg: '#fafcfb',
    surface: '#ffffff',
    border: '#c8d6cc',
    muted: '#566159',
    text: '#0a1f15',
  },
  /**
   * Paleta categórica única (carreras / avatares). Derivada de los acentos de
   * marca (verde · azul · dorado · rojo + tonos análogos) para que toda
   * superficie pinte las categorías igual.
   */
  categorical: [
    '#006048', // verde marca
    '#3d6dd0', // azul marca
    '#7a4cb8', // violeta
    '#c0282a', // rojo marca
    '#0a8a96', // teal
    '#b07e10', // dorado marca
    '#1f9163', // verde claro
    '#2f5fb0', // azul profundo
    '#9a3f8a', // magenta
    '#5f7c0f', // oliva
  ],
  careers: {
    'contaduria-general': '#006048',
    'sistemas-informaticos': '#3d6dd0',
    administracion: '#7a4cb8',
    marketing: '#c0282a',
    secretariado: '#0a8a96',
    electronica: '#b07e10',
  },
};

/**
 * Construye los tokens del ConfigProvider de AntD para un modo dado.
 * Centraliza claro/oscuro en un solo objeto en vez de ternarios con hex en JSX.
 * @param {'light' | 'dark'} mode
 */
export const buildIncosAntdTheme = (mode) => {
  const dark = mode === 'dark';
  return {
    token: {
      colorPrimary: incosColors.brand[600],
      colorSuccess: incosColors.semantic.success,
      colorWarning: dark ? '#e0a82e' : incosColors.semantic.warning,
      colorError: incosColors.semantic.danger,
      colorInfo: dark ? '#6f9af0' : incosColors.semantic.info,
      colorBgContainer: dark ? '#102019' : '#fafcfb',
      colorBgElevated: dark ? '#102019' : '#fafcfb',
      colorText: dark ? '#e8f0ea' : '#0a1f15',
      colorTextSecondary: dark ? '#9fb3a7' : '#566159',
      colorBorder: dark ? '#1d3528' : '#c8d6cc',
      borderRadius: 8,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      fontSize: 14,
    },
    components: {
      Table: {
        headerBg: 'transparent',
        headerColor: 'inherit',
        headerSplitColor: 'transparent',
      },
      Select: {
        optionSelectedBg: dark ? '#103224' : '#e3f2ea',
      },
      Dropdown: {
        colorBgElevated: dark ? '#102019' : '#fafcfb',
      },
      Tooltip: {
        colorBgSpotlight: dark ? '#16513a' : '#004830',
        colorTextLightSolid: dark ? '#e8f0ea' : '#f0f5f2',
        borderRadius: 8,
        fontSize: 12,
      },
      Button: {
        primaryShadow: 'none',
      },
    },
  };
};

export default buildIncosAntdTheme;
