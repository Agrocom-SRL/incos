/**
 * Hook de API: ficha de un proyecto de grado (módulo TIT · T6).
 *
 * GET /proyectos-grado/:id — ficha con integrantes[] y resúmenes.
 * `dataKey` ('proyectoGrado') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapProyectoGradoDetail } from '@application-titulacion/proyectos-grado/mappers/proyectoGradoMapper';

/** Clave de datos = dataFieldName del backend (contrato T4/T6). */
export const PROYECTO_GRADO_DATA_KEY = 'proyectoGrado';

export const useGetProyectoGrado = () => {
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (id) => {
    if (id == null || id === '') {
      setError('Se requiere el ID del proyecto');
      return { success: false, error: 'Se requiere el ID del proyecto' };
    }
    setLoading(true);
    setError(null);
    const result = await proyectoGradoRepository.obtenerPorId(id);
    if (!result?.success) {
      const msg = result?.error || 'No se pudo cargar el proyecto de grado';
      setProyecto(null);
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    const mapped = mapProyectoGradoDetail(result.data?.[PROYECTO_GRADO_DATA_KEY] ?? result.data);
    setProyecto(mapped);
    setLoading(false);
    return { success: true, data: mapped };
  }, []);

  return useMemo(
    () => ({ proyecto, loading, error, cargar, refetch: cargar }),
    [proyecto, loading, error, cargar],
  );
};
