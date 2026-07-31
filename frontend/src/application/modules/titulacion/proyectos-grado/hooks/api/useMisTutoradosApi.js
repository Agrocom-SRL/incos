/**
 * Hook de API: bandeja del docente tutor autenticado (módulo TUT · T3).
 *
 * El backend resuelve el docente por token (resolveDocenteIdForUsuario);
 * NUNCA se envía docenteId desde el cliente. `dataKey` ('misTutorados')
 * coincide con el `dataFieldName` del backend (ListMisTutoradosUseCase,
 * vista 160 WHERE tutor_id).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapProyectosGradoList } from '@application-tutorias/titulacion/mappers/proyectoGradoMapper';

/** Clave de datos = dataFieldName del backend (contrato T3). */
export const MIS_TUTORADOS_DATA_KEY = 'misTutorados';

export const useMisTutoradosApi = () => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await proyectoGradoRepository.obtenerMisTutorados();
    if (result?.success) {
      const raw = result.data?.[MIS_TUTORADOS_DATA_KEY] ?? result.data;
      setProyectos(mapProyectosGradoList(raw));
    } else {
      setProyectos([]);
      setError(result?.error || 'No se pudieron cargar sus proyectos tutorados');
    }
    setLoading(false);
    return result;
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return useMemo(
    () => ({ proyectos, loading, error, refetch: cargar }),
    [proyectos, loading, error, cargar],
  );
};
