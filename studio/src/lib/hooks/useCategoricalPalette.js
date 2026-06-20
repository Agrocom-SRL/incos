/**
 * useCategoricalPalette() — devuelve la paleta categórica (array de hex) del modo
 * de tema activo. Base para gráficos futuros que necesiten los colores reales en JS
 * (no como CSS var). Para teñir DOM, prefiere `var(--cat-N)` directamente en CSS.
 *
 * Lee el modo del ThemeProvider existente (no reimplementa detección de tema).
 */
import { useTheme } from '@ds/theme/useTheme';
import { categoricalFor } from '@ds/tokens';

export function useCategoricalPalette() {
  const { mode } = useTheme();
  return categoricalFor(mode);
}

export default useCategoricalPalette;
