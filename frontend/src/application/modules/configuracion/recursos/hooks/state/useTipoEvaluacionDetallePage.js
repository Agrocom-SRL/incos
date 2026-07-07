/**
 * Detalle de tipo de evaluación — orquestación UI (ficha sd-profile).
 * Gemelo de `useIdiomaDetallePage.js`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { mapTipoEvaluacionDetail } from '@application-configuracion/recursos/mappers';
import {
  TIPOS_EVALUACION_LIST_PATH,
  tipoEvaluacionEditarPath,
} from '@application-configuracion/recursos/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/recursos/config/navigation';

const initialsFromNombre = (nombre) => (nombre || '?').trim().slice(0, 2).toUpperCase();

export const useTipoEvaluacionDetallePage = () => {
  const { id } = useParams();
  const tipoEvaluacionId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidId = !Number.isFinite(tipoEvaluacionId) || tipoEvaluacionId < 1;

  const returnListPath = resolveReturnListPath(location, TIPOS_EVALUACION_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [tipoEvaluacion, setTipoEvaluacion] = useState(null);
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
      const result = await useCasesFactory.obtenerTipoEvaluacionPorId().ejecutar(tipoEvaluacionId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el tipo de evaluación');
      }
      setTipoEvaluacion(mapTipoEvaluacionDetail(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el tipo de evaluación');
      setTipoEvaluacion(null);
    } finally {
      setLoading(false);
    }
  }, [isInvalidId, tipoEvaluacionId]);

  useEffect(() => {
    load();
  }, [load]);

  const avatarInitials = useMemo(() => initialsFromNombre(tipoEvaluacion?.nombre), [tipoEvaluacion?.nombre]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Recursos académicos', href: returnListPath },
      { title: 'Tipos de evaluación' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!tipoEvaluacion?.id) return;
    navigate(tipoEvaluacionEditarPath(tipoEvaluacion.id), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [tipoEvaluacion?.id, navigate, returnListPath, menuSidebarKey]);

  return {
    tipoEvaluacion,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch: load,
  };
};
