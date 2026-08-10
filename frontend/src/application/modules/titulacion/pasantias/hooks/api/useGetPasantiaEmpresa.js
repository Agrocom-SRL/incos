/**
 * Hook de API: ficha de una empresa del catálogo de pasantías (módulo TIT · P20).
 *
 * GET /pasantias/empresas/:empresaId. `dataKey` ('pasantiaEmpresa') coincide
 * con el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import pasantiaRepository from '@implementations/PasantiaRepository';
import { mapEmpresa } from '@application-titulacion/pasantias/mappers/pasantiaMapper';

/** Clave de datos = dataFieldName del backend (contrato P20/P9/P21). */
export const PASANTIA_EMPRESA_DATA_KEY = 'pasantiaEmpresa';

export const useGetPasantiaEmpresa = () => {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (empresaId) => {
    if (empresaId == null || empresaId === '') {
      setError('Se requiere el ID de la empresa');
      return { success: false, error: 'Se requiere el ID de la empresa' };
    }
    setLoading(true);
    setError(null);
    const result = await pasantiaRepository.obtenerEmpresaPorId(empresaId);
    if (!result?.success) {
      const msg = result?.error || 'No se pudo cargar la empresa de pasantía';
      setEmpresa(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapEmpresa(result.data?.[PASANTIA_EMPRESA_DATA_KEY] ?? result.data);
    setEmpresa(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  return useMemo(
    () => ({ empresa, loading, error, cargar, refetch: cargar }),
    [empresa, loading, error, cargar],
  );
};
