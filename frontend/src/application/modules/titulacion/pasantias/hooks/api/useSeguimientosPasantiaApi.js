/**
 * Hook de API: seguimientos de un trámite de pasantía (módulo TUT · P15-P17).
 *
 * Lectura en orden cronológico (P15), registro (P16) y edición (P17) de la
 * hoja de seguimiento (FORMULARIO DE SEGUIMIENTO DE PASANTÍA, escala
 * ALTO/MEDIO/BAJO).
 *
 * `dataKey` de lectura ('seguimientos') y de escritura ('seguimiento')
 * coinciden con los `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import pasantiaRepository from '@implementations/PasantiaRepository';
import { mapSeguimientosList } from '@application-titulacion/pasantias/mappers/pasantiaMapper';

/** Claves de datos = dataFieldName del backend (contrato P15/P16-P17). */
export const SEGUIMIENTOS_DATA_KEY = 'seguimientos';
export const SEGUIMIENTO_DATA_KEY = 'seguimiento';

export const useSeguimientosPasantiaApi = () => {
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (pasantiaId) => {
    if (pasantiaId == null) return { success: false, error: 'Trámite inválido' };
    setLoading(true);
    setError(null);
    const result = await pasantiaRepository.obtenerSeguimientos(pasantiaId);
    if (result?.success) {
      const raw = result.data?.[SEGUIMIENTOS_DATA_KEY] ?? result.data;
      setSeguimientos(mapSeguimientosList(raw));
    } else {
      setSeguimientos([]);
      setError(result?.error || 'No se pudieron cargar los seguimientos del trámite');
    }
    setLoading(false);
    return result;
  }, []);

  /** Registra un seguimiento nuevo (P16) o edita uno existente (P17). */
  const guardarSeguimiento = useCallback(
    (pasantiaId, seguimientoId, payload) =>
      seguimientoId != null
        ? pasantiaRepository.actualizarSeguimiento(pasantiaId, seguimientoId, payload)
        : pasantiaRepository.crearSeguimiento(pasantiaId, payload),
    [],
  );

  return useMemo(
    () => ({ seguimientos, loading, error, cargar, guardarSeguimiento }),
    [seguimientos, loading, error, cargar, guardarSeguimiento],
  );
};
