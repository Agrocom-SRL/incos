/**
 * Detalle de tipo de discapacidad — orquestación UI (ficha sd-profile).
 * Gemelo simplificado de `academico/hooks/state/useMateriaDetallePage.js`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { mapDiscapacidadDetail } from '@application-configuracion/complementarios/mappers';
import {
  DISCAPACIDAD_LIST_PATH,
  discapacidadEditarPath,
} from '@application-configuracion/complementarios/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/complementarios/config/navigation';

const initialsFromNombre = (nombre) => (nombre || '?').trim().slice(0, 2).toUpperCase();

export const useDiscapacidadDetallePage = () => {
  const { id } = useParams();
  const discapacidadId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidId = !Number.isFinite(discapacidadId) || discapacidadId < 1;

  const returnListPath = resolveReturnListPath(location, DISCAPACIDAD_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [discapacidad, setDiscapacidad] = useState(null);
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
      const result = await useCasesFactory.obtenerDiscapacidadPorId().ejecutar(discapacidadId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el tipo de discapacidad');
      }
      // El objeto mapeado ya incluye cantidadEstudiantes/cantidadDocentes/cantidadPersonal
      // ("Uso en el sistema"); se exponen junto al resto de campos vía `discapacidad`.
      setDiscapacidad(mapDiscapacidadDetail(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el tipo de discapacidad');
      setDiscapacidad(null);
    } finally {
      setLoading(false);
    }
  }, [isInvalidId, discapacidadId]);

  useEffect(() => {
    load();
  }, [load]);

  const avatarInitials = useMemo(
    () => initialsFromNombre(discapacidad?.nombre),
    [discapacidad?.nombre],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Complementarios', href: returnListPath },
      { title: 'Discapacidad' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!discapacidad?.id) return;
    navigate(discapacidadEditarPath(discapacidad.id), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [discapacidad?.id, navigate, returnListPath, menuSidebarKey]);

  return {
    discapacidad,
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
