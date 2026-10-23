/**
 * Hook de API: cursos disponibles para inscribir (módulo CAP).
 *
 * Carga el listado de cursos ACTIVOS al montar (sin incluirInactivos: los
 * desactivados no se ofertan) y lo expone como DTOs del mapper de cursos.
 * El cupo es informativo (decisión §6.9 del plan): no se filtra por cupo.
 *
 * Filtra por estado EFECTIVO (ya viene calculado del backend, ver
 * `resolveEstadoEfectivoCurso`) ABIERTO o EN_CURSO: el corte real es
 * `fecha_fin` — mientras el curso no haya cerrado, se puede inscribir a
 * alguien aunque ya haya iniciado. PROPUESTO (aún no abierto)/CERRADO/
 * CANCELADO no se ofrecen en el wizard. El backend valida lo mismo en
 * CreateInscripcionCapacitacionUseCase (defensa en profundidad). El filtro se
 * hace en cliente (no se manda `estado` al backend): el endpoint de listado
 * solo soporta filtrar por un único valor de estado.
 *
 * `enabled=false` no consulta (p. ej. el dashboard sin permiso sobre capacitación).
 */

import { useEffect, useMemo, useState } from 'react';
import cursoCapacitacionRepository from '@implementations/CursoCapacitacionRepository';
import { mapCursosCapacitacionList } from '@application-capacitacion/cursos/mappers/cursoCapacitacionMapper';

/** Límite alto: el universo de cursos es pequeño y se elige en un Select. */
const CATALOG_PARAMS = { params: { page: 1, limit: 500 } };

const ESTADOS_QUE_ACEPTAN_INSCRIPCION = ['ABIERTO', 'EN_CURSO'];

export const useCursosCapacitacionOptions = ({ enabled = true } = {}) => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let activo = true;
    cursoCapacitacionRepository.obtenerTodos(CATALOG_PARAMS).then((result) => {
      if (!activo) return;
      if (!result?.success) {
        setError(result?.error || 'No se pudieron cargar los cursos disponibles');
        setLoading(false);
        return;
      }
      const inscribibles = mapCursosCapacitacionList(result.data).filter((curso) =>
        ESTADOS_QUE_ACEPTAN_INSCRIPCION.includes(curso.estado)
      );
      setCursos(inscribibles);
      setLoading(false);
    });
    return () => {
      activo = false;
    };
  }, [enabled]);

  return useMemo(() => ({ cursos, loading, error }), [cursos, loading, error]);
};
