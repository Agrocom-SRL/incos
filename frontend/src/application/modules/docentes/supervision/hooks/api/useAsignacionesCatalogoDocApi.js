/**
 * Hook de API: catálogo de cursos (asignaciones docentes vigentes) para el
 * selector "curso observado" del formulario de ficha de seguimiento (módulo
 * DOC · Supervisión docente).
 *
 * REUTILIZA `GET /asignaciones-docentes` (catálogo del plan: no se crean
 * catálogos nuevos), mismo criterio que `useAsignacionesCatalogoTutApi`.
 * Degrada con gracia si el rol no tiene ninguno de los permisos que abren la
 * ruta (`institucional.horarios.asignacion-docente` LISTAR / `docentes.asignar`
 * EDITAR): sin catálogo, el select queda deshabilitado con aviso.
 *
 * OJO contrato: este endpoint responde en snake_case (`materia_nombre`,
 * `paralelo_nombre`, `docente_nombre`, `docente_id`, `vigente`…) — la ruta
 * fuerza `{ snakeCase: true }` en el use case (ver
 * `ListAsignacionesDocentesController`), a diferencia del resto de la API.
 */

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@api-client';
import { ASIGNACIONES_DOCENTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

const mapAsignacion = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.id == null) return null;
  const materia = raw.materia_nombre ?? null;
  const paralelo = raw.paralelo_nombre ?? null;
  const docente = raw.docente_nombre ?? null;
  return {
    id: raw.id,
    docenteId: raw.docente_id ?? null,
    docenteNombre: docente,
    label:
      [[raw.materia_sigla, materia].filter(Boolean).join(' '), paralelo, docente]
        .filter(Boolean)
        .join(' · ') || `Curso ${raw.id}`,
  };
};

export const useAsignacionesCatalogoDocApi = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disponible, setDisponible] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      let result;
      try {
        result = handleSuccessResponse(
          await apiClient.get(ASIGNACIONES_DOCENTES_ENDPOINTS.BASE, {
            params: { vigente: 'true', limit: 1000 },
          }),
        );
      } catch (error) {
        result = handleErrorResponse(error, 'No se pudo cargar el catálogo de cursos');
      }
      if (!activo) return;
      const raw = result.success
        ? (result.data?.asignaciones ?? result.data?.asignacionesDocentes ?? result.data)
        : null;
      if (result.success && Array.isArray(raw)) {
        setAsignaciones(raw.map(mapAsignacion).filter(Boolean));
        setDisponible(true);
      } else {
        setAsignaciones([]);
        setDisponible(false);
      }
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  const options = useMemo(
    () => asignaciones.map((a) => ({ value: a.id, label: a.label })),
    [asignaciones],
  );

  const asignacionById = useMemo(() => {
    const map = {};
    for (const a of asignaciones) map[a.id] = a;
    return map;
  }, [asignaciones]);

  return useMemo(
    () => ({ asignaciones, options, asignacionById, loading, disponible }),
    [asignaciones, options, asignacionById, loading, disponible],
  );
};
