/**
 * Detalle de idioma — orquestación UI (ficha sd-profile).
 * Gemelo de `useDiscapacidadDetallePage.js`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { mapIdiomaDetail } from '@application-configuracion/complementarios/mappers';
import {
  IDIOMAS_LIST_PATH,
  idiomaEditarPath,
} from '@application-configuracion/complementarios/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/complementarios/config/navigation';

const initialsFromNombre = (nombre) => (nombre || '?').trim().slice(0, 2).toUpperCase();

export const useIdiomaDetallePage = () => {
  const { id } = useParams();
  const idiomaId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidId = !Number.isFinite(idiomaId) || idiomaId < 1;

  const returnListPath = resolveReturnListPath(location, IDIOMAS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [idioma, setIdioma] = useState(null);
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
      const result = await useCasesFactory.obtenerIdiomaPorId().ejecutar(idiomaId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el idioma');
      }
      setIdioma(mapIdiomaDetail(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el idioma');
      setIdioma(null);
    } finally {
      setLoading(false);
    }
  }, [isInvalidId, idiomaId]);

  useEffect(() => {
    load();
  }, [load]);

  const avatarInitials = useMemo(() => initialsFromNombre(idioma?.nombre), [idioma?.nombre]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Complementarios', href: returnListPath },
      { title: 'Idiomas' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!idioma?.id) return;
    navigate(idiomaEditarPath(idioma.id), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [idioma?.id, navigate, returnListPath, menuSidebarKey]);

  return {
    idioma,
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
