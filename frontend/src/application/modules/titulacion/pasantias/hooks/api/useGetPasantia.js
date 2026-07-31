/**
 * Hook de API: ficha de un trámite de pasantía (módulo TUT · P2).
 *
 * GET /pasantias/:id — ficha de la vista 168 (identidad + puesto + contrato +
 * contacto de la empresa + agregados de satélites).
 * `dataKey` ('pasantia') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import pasantiaRepository from '@implementations/PasantiaRepository';
import { mapPasantiaDetail } from '@application-titulacion/pasantias/mappers/pasantiaMapper';

/** Clave de datos = dataFieldName del backend (contrato P2/P3/P4/P6). */
export const PASANTIA_DATA_KEY = 'pasantia';

export const useGetPasantia = () => {
  const [pasantia, setPasantia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (id) => {
    if (id == null || id === '') {
      setError('Se requiere el ID del trámite');
      return { success: false, error: 'Se requiere el ID del trámite' };
    }
    setLoading(true);
    setError(null);
    const result = await pasantiaRepository.obtenerPorId(id);
    if (!result?.success) {
      const msg = result?.error || 'No se pudo cargar el trámite de pasantía';
      setPasantia(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapPasantiaDetail(result.data?.[PASANTIA_DATA_KEY] ?? result.data);
    setPasantia(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  return useMemo(
    () => ({ pasantia, loading, error, cargar, refetch: cargar }),
    [pasantia, loading, error, cargar],
  );
};
