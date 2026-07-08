/**
 * Detalle de estado civil — orquestación UI (ficha sd-profile).
 * Gemelo de `useIdiomaDetallePage.js`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { mapEstadoCivilDetail } from '@application-configuracion/complementarios/mappers';
import {
  ESTADOS_CIVILES_LIST_PATH,
  estadoCivilEditarPath,
} from '@application-configuracion/complementarios/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/complementarios/config/navigation';

const initialsFromNombre = (nombre) => (nombre || '?').trim().slice(0, 2).toUpperCase();

export const useEstadoCivilDetallePage = () => {
  const { id } = useParams();
  const estadoCivilId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidId = !Number.isFinite(estadoCivilId) || estadoCivilId < 1;

  const returnListPath = resolveReturnListPath(location, ESTADOS_CIVILES_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [estadoCivil, setEstadoCivil] = useState(null);
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
      const result = await useCasesFactory.obtenerEstadoCivilPorId().ejecutar(estadoCivilId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el estado civil');
      }
      setEstadoCivil(mapEstadoCivilDetail(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el estado civil');
      setEstadoCivil(null);
    } finally {
      setLoading(false);
    }
  }, [isInvalidId, estadoCivilId]);

  useEffect(() => {
    load();
  }, [load]);

  const avatarInitials = useMemo(() => initialsFromNombre(estadoCivil?.nombre), [estadoCivil?.nombre]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Complementarios', href: returnListPath },
      { title: 'Estados civiles' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!estadoCivil?.id) return;
    navigate(estadoCivilEditarPath(estadoCivil.id), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [estadoCivil?.id, navigate, returnListPath, menuSidebarKey]);

  return {
    estadoCivil,
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
