/**
 * Estado y datos derivados del detalle de docente (capa aplicación, sin UI).
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useGetDocenteById } from '@application-docentes/hooks/api';

export const useDocenteDetail = (docenteIdRaw) => {
  const docenteId = docenteIdRaw != null ? Number(docenteIdRaw) : NaN;
  const navigate = useNavigate();
  const location = useLocation();
  const returnListPath = location.state?.returnListPath || '/docentes/listar';

  const { docente, loading, error, getDocenteById, refetch } = useGetDocenteById();

  useEffect(() => {
    if (Number.isFinite(docenteId) && docenteId > 0) {
      getDocenteById(docenteId);
    }
  }, [docenteId, getDocenteById]);

  const profile = docente?.profile ?? {};
  const assignments = docente?.assignments ?? [];
  const courseSchedules = docente?.courseSchedules ?? [];
  const access = docente?.access ?? { tieneAcceso: false };

  const nombreCompleto = profile.nombreCompleto || 'Docente';
  const iniciales = useMemo(() => {
    const parts = String(nombreCompleto)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'D';
  }, [nombreCompleto]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Docentes', href: returnListPath },
      { title: 'Ficha del docente' },
    ],
    [returnListPath]
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey: location.state?.menuSidebarKey ?? 'DOC-LIST' } });
  }, [navigate, returnListPath, location.state?.menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!Number.isFinite(docenteId) || docenteId < 1) return;
    navigate(`/docentes/${docenteId}/editar`, {
      state: { menuSidebarKey: 'DOC-LIST', returnListPath },
    });
  }, [navigate, docenteId, returnListPath]);

  const handleAsignacionAcademica = useCallback(
    (options = {}) => {
      if (!Number.isFinite(docenteId) || docenteId < 1) return;
      const focus = options.focus === 'horarios' ? 'horarios' : 'cursos';
      navigate(`/docentes/${docenteId}/asignaciones`, {
        state: {
          menuSidebarKey: location.state?.menuSidebarKey ?? 'DOC-LIST',
          returnListPath: `/docentes/${docenteId}`,
          docenteId,
          docenteNombre: nombreCompleto,
          asignacionFocus: focus,
        },
      });
    },
    [navigate, docenteId, location.state?.menuSidebarKey, nombreCompleto]
  );

  const refetchWithDocenteId = useCallback(async () => {
    if (!Number.isFinite(docenteId) || docenteId <= 0) return;
    await refetch(docenteId);
  }, [docenteId, refetch]);

  return {
    docenteId: Number.isFinite(docenteId) && docenteId > 0 ? docenteId : null,
    loading,
    error,
    refetch: refetchWithDocenteId,
    profile,
    assignments,
    courseSchedules,
    access,
    nombreCompleto,
    iniciales,
    breadcrumbItems,
    returnListPath,
    handleVolver,
    handleEditar,
    handleAsignacionAcademica,
  };
};
