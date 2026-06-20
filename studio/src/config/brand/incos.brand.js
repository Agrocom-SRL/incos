/**
 * Configuración de marca del tenant INCOS.
 *
 * Responsabilidad ÚNICA: declarar los valores de marca personalizables por cliente
 * (white-label). Todo lo visual del sistema deriva de aquí — colores, nombre, logo,
 * idioma por defecto y banderas de features. Duplicar este archivo (otro tenant) y
 * cambiar sus valores reskinea el producto completo sin tocar componentes.
 *
 * NO contiene lógica ni estilos: solo datos.
 */

/** @typedef {{ 50:string,100:string,200:string,300:string,400:string,500:string,600:string,700:string,800:string,900:string }} ColorRamp */

export const incosBrand = {
  id: 'incos',
  name: 'INCOS Santa Cruz',
  shortName: 'INCOS', // wordmark / badge del sidebar colapsado

  /** Rampa de marca por modo (origen: REVAMP §3 — verde institucional). */
  ramp: {
    light: {
      50: '#e3f2ea',
      100: '#bfe0cf',
      200: '#8ec9ad',
      300: '#56ad86',
      400: '#1f9163',
      500: '#007848', // colorPrimary — AA ≈4.8:1 sobre blanco
      600: '#006048',
      700: '#004830',
      800: '#003a26',
      900: '#002b1c',
    },
    dark: {
      50: '#0a2218',
      100: '#103224',
      200: '#16513a',
      300: '#1f9163',
      400: '#2eae79',
      500: '#3fc48d', // más luminoso para fondo oscuro
      600: '#2eae79',
      700: '#1f9163',
      800: '#16513a',
      900: '#103224',
    },
  },

  /**
   * Acentos categóricos / de estado por modo.
   * Se usan como FONDO con texto blanco encima (chips/píldoras) y como texto/borde
   * sutil. Light = saturados con AA ≥4.5:1 sobre blanco como texto; dark = variantes
   * más luminosas para legibilidad sobre superficie oscura. Mismo set de claves por
   * modo (red, gold, sky, teal, violet, orange, pink, lime) → theming simétrico.
   */
  accents: {
    light: {
      red: '#c0282a',
      gold: '#b07e10',
      sky: '#3d6dd0',
      teal: '#0a8a96',
      violet: '#7a4cb8',
      orange: '#c2580f',
      pink: '#b03a7a',
      lime: '#5f7c0f',
    },
    dark: {
      red: '#e8625f',
      gold: '#e0a82e',
      sky: '#6f9af0',
      teal: '#33c2cf',
      violet: '#b58ce8',
      orange: '#f0905a',
      pink: '#e88cc0',
      lime: '#a8d04c',
    },
  },

  /** Familia tipográfica (auto-hospedada vía @fontsource). */
  fontFamily:
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",

  /** Idioma por defecto del tenant. */
  defaultLocale: 'es',

  /** Banderas de features (habilitar/deshabilitar por tenant). */
  features: {
    darkMode: true,
    languageSwitch: true,
  },
};

export default incosBrand;
