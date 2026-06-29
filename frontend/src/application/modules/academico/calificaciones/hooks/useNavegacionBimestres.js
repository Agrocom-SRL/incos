import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  bimestreConsolidadoPath,
  cuadernoBimestrePath,
} from '../utils/calificacionesPaths.js';

/**
 * Navegación ◀ ▶ entre bimestres (consolidado histórico vs cuaderno vigente / reabierto).
 */
export function useNavegacionBimestres(
  asignacionId,
  bimestreActivo,
  bimestreVigente,
  { bimestresCalendario = [] } = {},
) {
  const navigate = useNavigate();
  const n = Number(bimestreActivo) || 1;
  const vigente = Number(bimestreVigente) || 1;

  const metaReabierto = (num) =>
    Boolean(
      (bimestresCalendario ?? []).find((b) => Number(b.numero) === Number(num))?.reabierto,
    );

  const puedeAnterior = n > 1;
  const puedeSiguiente = n < 4 && (n < vigente || metaReabierto(n + 1));

  const irABimestre = useCallback(
    (destino) => {
      const d = Number(destino);
      if (!asignacionId || !Number.isFinite(d) || d < 1 || d > 4) return;
      const reabierto = Boolean(
        (bimestresCalendario ?? []).find((b) => Number(b.numero) === d)?.reabierto,
      );
      if (d < vigente && !reabierto) {
        navigate(bimestreConsolidadoPath(asignacionId, d));
        return;
      }
      if (d === vigente || reabierto) {
        navigate(cuadernoBimestrePath(asignacionId, d));
      }
    },
    [asignacionId, navigate, vigente, bimestresCalendario],
  );

  const irAnterior = useCallback(() => {
    if (puedeAnterior) irABimestre(n - 1);
  }, [irABimestre, n, puedeAnterior]);

  const irSiguiente = useCallback(() => {
    if (puedeSiguiente) irABimestre(n + 1);
  }, [irABimestre, n, puedeSiguiente]);

  return useMemo(
    () => ({
      bimestreActivo: n,
      bimestreVigente: vigente,
      puedeAnterior,
      puedeSiguiente,
      irABimestre,
      irAnterior,
      irSiguiente,
    }),
    [n, vigente, puedeAnterior, puedeSiguiente, irABimestre, irAnterior, irSiguiente],
  );
}
