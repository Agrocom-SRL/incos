/**
 * Detalle de carrera — página completa (patrón PoliticaInstitucional + sd-profile).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { mapCarreraDetail } from '@application-configuracion/academico/mappers';
import {
  CARRERAS_LIST_PATH,
  carreraEditarPath,
  planDetallePath,
} from '@application-configuracion/academico/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/academico/config/academicoNavigation';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import { usePlanesEstudiosApi } from '../api/usePlanesEstudiosApi';

const initialsFromCarrera = (c) => {
  const src = (c?.codigo || c?.nombre || '?').trim();
  return src.slice(0, 2).toUpperCase();
};

export const useCarreraDetallePage = () => {
  const { id } = useParams();
  const carreraId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidId = !Number.isFinite(carreraId) || carreraId < 1;

  const returnListPath = resolveReturnListPath(location, CARRERAS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [carrera, setCarrera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { planes, loading: loadingPlanes } = usePlanesEstudiosApi({
    carreraId: isInvalidId ? undefined : carreraId,
    autoFetch: !isInvalidId,
  });

  const load = useCallback(async () => {
    if (isInvalidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.obtenerCarreraPorId().ejecutar(carreraId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar la carrera');
      }
      setCarrera(mapCarreraDetail(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar la carrera');
      setCarrera(null);
    } finally {
      setLoading(false);
    }
  }, [carreraId, isInvalidId]);

  useEffect(() => {
    load();
  }, [load]);

  const planesOrdenados = useMemo(() => {
    const list = [...(planes || [])];
    return list.sort((a, b) => {
      const va = a.vigente ? 1 : 0;
      const vb = b.vigente ? 1 : 0;
      if (va !== vb) return vb - va;
      return (a.nombre_plan || '').localeCompare(b.nombre_plan || '');
    });
  }, [planes]);

  const planVigente = useMemo(
    () => planesOrdenados.find((p) => p.vigente) ?? null,
    [planesOrdenados],
  );

  const avatarInitials = useMemo(() => initialsFromCarrera(carrera), [carrera]);
  const avatarColor = sanitizeDocenteColorHex(carrera?.colorHex) ?? null;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Académico', href: returnListPath },
      { title: 'Carreras', href: returnListPath },
      { title: carrera?.nombre || 'Detalle de carrera' },
    ],
    [carrera?.nombre, returnListPath],
  );

  const navState = useMemo(
    () => ({ returnListPath, menuSidebarKey }),
    [returnListPath, menuSidebarKey],
  );

  const handleVolver = useCallback(() => {
    navigate(
      returnListPath,
      menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined,
    );
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!carrera?.id) return;
    navigate(carreraEditarPath(carrera.id), { state: navState });
  }, [carrera?.id, navigate, navState]);

  const handleVerPlan = useCallback(
    (planId) => {
      navigate(planDetallePath(planId), { state: navState });
    },
    [navigate, navState],
  );

  return {
    carrera,
    loading,
    error,
    isInvalidId,
    planes: planesOrdenados,
    loadingPlanes,
    planVigente,
    avatarInitials,
    avatarColor,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    handleVerPlan,
    refetch: load,
  };
};
