/**
 * Detalle de apoderado / tipo de parentesco — orquestación UI (ficha sd-profile).
 * Gemelo de `useDiscapacidadDetallePage.js`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { mapApoderadoDetail } from '@application-configuracion/complementarios/mappers';
import {
  APODERADOS_LIST_PATH,
  apoderadoEditarPath,
} from '@application-configuracion/complementarios/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/complementarios/config/navigation';

const initialsFromNombre = (nombre) => (nombre || '?').trim().slice(0, 2).toUpperCase();

export const useApoderadoDetallePage = () => {
  const { id } = useParams();
  const apoderadoId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidId = !Number.isFinite(apoderadoId) || apoderadoId < 1;

  const returnListPath = resolveReturnListPath(location, APODERADOS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [apoderado, setApoderado] = useState(null);
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
      const result = await useCasesFactory.obtenerTipoParentescoPorId().ejecutar(apoderadoId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el apoderado');
      }
      // El objeto mapeado ya incluye cantidadEstudiantes/cantidadDocentes/cantidadPersonal
      // ("Uso en el sistema"); se exponen junto al resto de campos vía `apoderado`.
      setApoderado(mapApoderadoDetail(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el apoderado');
      setApoderado(null);
    } finally {
      setLoading(false);
    }
  }, [isInvalidId, apoderadoId]);

  useEffect(() => {
    load();
  }, [load]);

  const avatarInitials = useMemo(
    () => initialsFromNombre(apoderado?.nombre),
    [apoderado?.nombre],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Complementarios', href: returnListPath },
      { title: 'Apoderados' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!apoderado?.id) return;
    navigate(apoderadoEditarPath(apoderado.id), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [apoderado?.id, navigate, returnListPath, menuSidebarKey]);

  return {
    apoderado,
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
