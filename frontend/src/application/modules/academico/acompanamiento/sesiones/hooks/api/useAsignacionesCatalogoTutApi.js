/**
 * Hook de API: catálogo de cursos (asignaciones docentes, vista 130) para el
 * selector del formulario de sesión de refuerzo (módulo TUT).
 *
 * REUTILIZA `GET /asignaciones-docentes` (catálogo del plan: no se crean
 * catálogos nuevos). Degrada con gracia si el rol no tiene el permiso del
 * dominio INST (mismo criterio que `useAulasCatalogoCapApi`).
 */

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@api-client';
import { ASIGNACIONES_DOCENTES_ENDPOINTS } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

const mapAsignacion = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.id == null) return null;
  const materia = raw.materiaNombre ?? raw.materia ?? null;
  const paralelo = raw.paraleloNombre ?? raw.paraleloCodigo ?? null;
  const docente = raw.docenteNombre ?? null;
  return {
    id: raw.id,
    materiaId: raw.materiaId ?? null,
    docenteNombre: docente,
    label:
      [[materia, paralelo].filter(Boolean).join(' · '), docente].filter(Boolean).join(' — ') ||
      `Curso ${raw.id}`,
  };
};

export const useAsignacionesCatalogoTutApi = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disponible, setDisponible] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      let result;
      try {
        result = handleSuccessResponse(await apiClient.get(ASIGNACIONES_DOCENTES_ENDPOINTS.BASE));
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
