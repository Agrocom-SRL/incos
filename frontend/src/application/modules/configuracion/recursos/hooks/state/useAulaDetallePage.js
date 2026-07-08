/**
 * Detalle de aula — orquestación UI (ficha sd-profile).
 * Gemelo de `useIdiomaDetallePage.js`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { mapAulaDetail } from '@application-configuracion/recursos/mappers';
import { AULAS_LIST_PATH, aulaEditarPath } from '@application-configuracion/recursos/config/paths';
import {
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/recursos/config/navigation';

const initialsFromNombre = (nombre) => (nombre || '?').trim().slice(0, 2).toUpperCase();

export const useAulaDetallePage = () => {
  const { id } = useParams();
  const aulaId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidId = !Number.isFinite(aulaId) || aulaId < 1;

  const returnListPath = resolveReturnListPath(location, AULAS_LIST_PATH);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [aula, setAula] = useState(null);
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
      const result = await useCasesFactory.obtenerAulaPorId().ejecutar(aulaId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el aula');
      }
      setAula(mapAulaDetail(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el aula');
      setAula(null);
    } finally {
      setLoading(false);
    }
  }, [isInvalidId, aulaId]);

  useEffect(() => {
    load();
  }, [load]);

  const avatarInitials = useMemo(() => initialsFromNombre(aula?.nombre), [aula?.nombre]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Recursos académicos', href: returnListPath },
      { title: 'Aulas' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!aula?.id) return;
    navigate(aulaEditarPath(aula.id), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [aula?.id, navigate, returnListPath, menuSidebarKey]);

  return {
    aula,
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
