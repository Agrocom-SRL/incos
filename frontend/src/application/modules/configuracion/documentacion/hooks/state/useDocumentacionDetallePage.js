/**
 * Detalle de un documento — orquestación UI (ficha sd-profile), pantalla única
 * para los 9 tipos. Gemelo de `actividades/hooks/state/useActividadDetallePage.js`.
 *
 * Si el documento es de SEGUNDO ORDEN (tiene `documentoPadreId`), resuelve el
 * nombre del documento base al que reemplaza con un `GET /:id` adicional
 * (mismo permiso DETALLE de la página; fallo no fatal — se muestra `#id`).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCasesFactory } from '@container';
import { mapDocumentacionDetail } from '@application-configuracion/documentacion/mappers';
import {
  DOCUMENTACION_BASE,
  documentacionEditarPath,
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/documentacion/config/paths';
import { getTipoDocumentoLabel } from '@application-configuracion/documentacion/config/tipos';

const initialsFromNombre = (nombre) => (nombre || '?').trim().slice(0, 2).toUpperCase();

export const useDocumentacionDetallePage = () => {
  const { id } = useParams();
  const documentacionId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const isInvalidId = !Number.isFinite(documentacionId) || documentacionId < 1;

  const returnListPath = resolveReturnListPath(location, DOCUMENTACION_BASE);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [documento, setDocumento] = useState(null);
  const [documentoPadreNombre, setDocumentoPadreNombre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (isInvalidId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setDocumentoPadreNombre(null);
    try {
      const result = await useCasesFactory.obtenerDocumentacionPorId().ejecutar(documentacionId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el documento');
      }
      const detalle = mapDocumentacionDetail(result.data);
      setDocumento(detalle);
      if (detalle?.documentoPadreId) {
        const padreResult = await useCasesFactory
          .obtenerDocumentacionPorId()
          .ejecutar(detalle.documentoPadreId);
        const padre = padreResult?.success ? mapDocumentacionDetail(padreResult.data) : null;
        setDocumentoPadreNombre(padre?.nombre ?? null);
      }
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
  const tipoLabel = useMemo(
    () => getTipoDocumentoLabel(documento?.tipoDocumento),
    [documento?.tipoDocumento],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Documentación', href: returnListPath },
      { title: 'Detalle de documento' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!documento?.id) return;
    navigate(documentacionEditarPath(documento.id), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [documento?.id, navigate, returnListPath, menuSidebarKey]);

  return {
    documento,
    documentoPadreNombre,
    tipoLabel,
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
