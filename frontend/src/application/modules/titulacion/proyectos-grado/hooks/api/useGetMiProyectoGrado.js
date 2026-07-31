/**
 * Hook de API: proyecto del estudiante autenticado (módulo TIT · T4).
 *
 * GET /proyectos-grado/mi-proyecto — el backend resuelve el estudiante por
 * token (resolveEstudianteIdForUsuario). Un 404 NO es error de pantalla: el
 * estudiante simplemente aún no registró proyecto (`sinProyecto`).
 * `dataKey` ('proyectoGrado') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapProyectoGradoDetail } from '@application-titulacion/proyectos-grado/mappers/proyectoGradoMapper';
import { PROYECTO_GRADO_DATA_KEY } from './useGetProyectoGrado';

export const useGetMiProyectoGrado = () => {
  const [proyecto, setProyecto] = useState(null);
  const [sinProyecto, setSinProyecto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSinProyecto(false);
    const result = await proyectoGradoRepository.obtenerMiProyecto();
    if (result?.success) {
      const raw = result.data?.[PROYECTO_GRADO_DATA_KEY] ?? result.data;
      const mapped = mapProyectoGradoDetail(raw);
      setProyecto(mapped);
      setSinProyecto(mapped == null);
    } else {
      setProyecto(null);
      // Sin proyecto registrado (404/NOT_FOUND) → estado vacío, no error.
      const code = result?.errorDetails?.code;
      if (code === 'NOT_FOUND' || /no.*(tiene|existe|encontr)/i.test(result?.error || '')) {
        setSinProyecto(true);
      } else {
        setError(result?.error || 'No se pudo cargar su proyecto de grado');
      }
    }
    setLoading(false);
    return result;
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return useMemo(
    () => ({ proyecto, sinProyecto, loading, error, refetch: cargar }),
    [proyecto, sinProyecto, loading, error, cargar],
  );
};
