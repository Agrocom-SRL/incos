/**
 * Detalle de actividad — orquestación UI (ficha sd-profile).
 * Gemelo de `academico/hooks/state/useMateriaDetallePage.js` (catálogo simple,
 * sin tabs).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { mapActividadDetail } from '@application-configuracion/actividades/mappers';
import {
  ACTIVIDADES_BASE,
  actividadEditarPath,
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/actividades/config/paths';
import { getActividadTipoLabel } from '@application-configuracion/actividades/config/actividadTipoPill';

const initialsFromNombre = (nombre) => (nombre || '?').trim().slice(0, 2).toUpperCase();

export const useActividadDetallePage = () => {
  const { id } = useParams();
  const actividadId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidId = !Number.isFinite(actividadId) || actividadId < 1;

  const returnListPath = resolveReturnListPath(location, ACTIVIDADES_BASE);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [actividad, setActividad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (isInvalidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.obtenerActividadPorId().ejecutar(actividadId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar la actividad');
      }
      setActividad(mapActividadDetail(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar la actividad');
      setActividad(null);
    } finally {
      setLoading(false);
    }
  }, [isInvalidId, actividadId]);

  useEffect(() => {
    load();
  }, [load]);

  const tipoLabel = useMemo(() => getActividadTipoLabel(actividad?.tipo), [actividad?.tipo]);
  const avatarInitials = useMemo(() => initialsFromNombre(actividad?.nombre), [actividad?.nombre]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Actividades' },
    ],
    [],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!actividad?.id) return;
    navigate(actividadEditarPath(actividad.id), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [actividad?.id, navigate, returnListPath, menuSidebarKey]);

  return {
    actividad,
    loading,
    error,
    isInvalidId,
    tipoLabel,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch: load,
  };
};
