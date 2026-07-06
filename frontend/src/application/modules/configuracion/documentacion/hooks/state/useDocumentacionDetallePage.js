/**
 * Detalle de un documento — orquestación UI (ficha sd-profile), parametrizada
 * por `tipoConfig`. Gemelo de `academico/hooks/state/useMateriaDetallePage.js`.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { mapDocumentacionDetail } from '@application-configuracion/documentacion/mappers';
import {
  documentacionListPath,
  documentacionEditarPath,
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/documentacion/config/paths';

const initialsFromNombre = (nombre) => (nombre || '?').trim().slice(0, 2).toUpperCase();

export const useDocumentacionDetallePage = (tipoConfig) => {
  const { tipoKey, label } = tipoConfig ?? {};
  const { id } = useParams();
  const documentacionId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidId = !Number.isFinite(documentacionId) || documentacionId < 1;

  const listPath = documentacionListPath(tipoKey);
  const returnListPath = resolveReturnListPath(location, listPath);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [documento, setDocumento] = useState(null);
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
      const result = await useCasesFactory.obtenerDocumentacionPorId().ejecutar(documentacionId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el documento');
      }
      setDocumento(mapDocumentacionDetail(result.data));
    } catch (e) {
      setError(e?.message || 'Error al cargar el documento');
      setDocumento(null);
    } finally {
      setLoading(false);
    }
  }, [isInvalidId, documentacionId]);

  useEffect(() => {
    load();
  }, [load]);

  const avatarInitials = useMemo(() => initialsFromNombre(documento?.nombre), [documento?.nombre]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Documentación', href: returnListPath },
      { title: label },
    ],
    [returnListPath, label],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!documento?.id) return;
    navigate(documentacionEditarPath(tipoKey, documento.id), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [documento?.id, navigate, returnListPath, menuSidebarKey, tipoKey]);

  return {
    documento,
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
