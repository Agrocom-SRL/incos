/**
 * Sombras por modo — elevación (Material como lenguaje).
 * Light: tinte verde de marca. Dark: negro puro con mayor opacidad.
 * Componentes consumen var(--shadow-*).
 */
export const shadows = {
  light: {
    sm: '0 1px 2px rgba(0, 72, 48, 0.06)',
    base: '0 2px 8px rgba(0, 72, 48, 0.09), 0 1px 2px rgba(0, 72, 48, 0.05)',
    md: '0 10px 28px rgba(0, 72, 48, 0.14), 0 3px 8px rgba(0, 72, 48, 0.08)',
    lg: '0 16px 44px rgba(0, 72, 48, 0.18)',
  },
  dark: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    base: '0 2px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 8px 24px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3)',
    lg: '0 12px 40px rgba(0, 0, 0, 0.6)',
  },
};

export default shadows;
