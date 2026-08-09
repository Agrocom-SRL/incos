/**
 * Badge cruzado Centralizador → Nivelación (sentido inverso de
 * `CentralizadorLibroBadge.jsx`/`useCentralizadorParalelo.js` con `libro`).
 * `GET /calificaciones/centralizador` NO embebe el conteo de pendientes de
 * nivelación (no se toca el backend en esta fase) — este hook hace una
 * llamada propia a `listarNivelacionesPendientesPorParalelo` y resuelve el
 * conteo del `paraleloGestionId` pedido. Se exporta desde Nivelación (dueña
 * del dato) para que Centralizador lo consuma sin reconstruir la lógica,
 * mismo patrón que Centralizador ya importa `LIBROS_PERMISOS` de Libros.
 */

import { useCallback, useEffect, useState } from 'react';
import { useCasesFactory } from '@container';

/**
 * @param {number|null} paraleloGestionId
 * @returns {{ totalPendientes: number, loading: boolean }}
 */
export const useNivelacionPendientesBadge = (paraleloGestionId) => {
  const [totalPendientes, setTotalPendientes] = useState(0);
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async (pgId) => {
    if (pgId == null) {
      setTotalPendientes(0);
      return;
    }
    setLoading(true);
    try {
      const result = await useCasesFactory.listarNivelacionesPendientesPorParalelo().ejecutar();
      const fila = (result?.success ? result.data : [])?.find((p) => p.paraleloGestionId === pgId);
      setTotalPendientes(fila?.totalPendientes ?? 0);
    } catch {
      setTotalPendientes(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar(paraleloGestionId);
  }, [cargar, paraleloGestionId]);

  return { totalPendientes, loading };
};

export default useNivelacionPendientesBadge;
