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
  const gestionReturnPath = location.state?.gestionReturnPath || returnListPath;

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
    navigate(gestionReturnPath, { state: { menuSidebarKey: location.state?.menuSidebarKey ?? 'DOC-LIST' } });
  }, [navigate, gestionReturnPath, location.state?.menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!Number.isFinite(docenteId) || docenteId < 1) return;
    navigate(`/docentes/${docenteId}/editar`, {
      state: { menuSidebarKey: 'DOC-LIST', returnListPath },
    });
  }, [navigate, docenteId, returnListPath]);

  const handleAsignacionAcademica = useCallback(() => {
      navigate('/institucional/oferta', {
        state: {
          menuSidebarKey: location.state?.menuSidebarKey ?? 'DOC-LIST',
          returnListPath: Number.isFinite(docenteId) && docenteId > 0 ? `/docentes/${docenteId}` : returnListPath,
        },
      });
    },
    [navigate, docenteId, location.state?.menuSidebarKey, returnListPath]
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
