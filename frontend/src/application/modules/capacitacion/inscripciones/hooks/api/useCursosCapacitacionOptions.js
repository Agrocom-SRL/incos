/**
 * Hook de API: cursos disponibles para inscribir (módulo CAP).
 *
 * Carga el listado de cursos ACTIVOS al montar (sin incluirInactivos: los
 * desactivados no se ofertan) y lo expone como DTOs del mapper de cursos.
 * El cupo es informativo (decisión §6.9 del plan): no se filtra por cupo.
 */

import { useEffect, useMemo, useState } from 'react';
import cursoCapacitacionRepository from '@implementations/CursoCapacitacionRepository';
import { mapCursosCapacitacionList } from '@application-capacitacion/cursos/mappers/cursoCapacitacionMapper';

/** Límite alto: el universo de cursos es pequeño y se elige en un Select. */
const CATALOG_PARAMS = { params: { page: 1, limit: 500 } };

export const useCursosCapacitacionOptions = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    cursoCapacitacionRepository.obtenerTodos(CATALOG_PARAMS).then((result) => {
      if (!activo) return;
      if (!result?.success) {
        setError(result?.error || 'No se pudieron cargar los cursos disponibles');
        setLoading(false);
        return;
      }
      setCursos(mapCursosCapacitacionList(result.data));
      setLoading(false);
    });
    return () => {
      activo = false;
    };
  }, []);

  return useMemo(() => ({ cursos, loading, error }), [cursos, loading, error]);
};
