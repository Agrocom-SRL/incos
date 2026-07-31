/**
 * Estado de pantalla — Preview del folio (P3 · FolioPreviewPage).
 *
 * Réplica en pantalla del folio físico del centralizador: carga el detalle
 * (`useFolioDetalleApi`), la edición de fila ESTADO/OBSERVACIONES
 * (`useEditarFolioEstudianteApi`, deshabilitada si el folio está FIRMADO) y las
 * transiciones de estado Imprimir/Firmar/Anular (`useCambiarEstadoFolioApi`,
 * permiso APROBAR — lo gatea la página, no este hook). Toda la orquestación
 * vive aquí; la página solo compone.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { libroDetallePath } from '../../utils/librosPaths';
import { createLibrosBreadcrumbItems } from '../../utils/librosBreadcrumbs';
import { useFolioDetalleApi } from '../api/useFolioDetalleApi';
import { useCambiarEstadoFolioApi } from '../api/useCambiarEstadoFolioApi';
import { useEditarFolioEstudianteApi } from '../api/useEditarFolioEstudianteApi';

export const useFolioPreview = () => {
  const { id, folioId } = useParams();
  const libroId = Number(id);
  const folioIdNum = Number(folioId);
  const isInvalidId =
    !Number.isFinite(libroId) || libroId < 1 || !Number.isFinite(folioIdNum) || folioIdNum < 1;
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const { folio, loading, error, fetch: fetchFolio } = useFolioDetalleApi();
  const { cambiarEstadoFolio, loading: cambiandoEstado } = useCambiarEstadoFolioApi();
  const { editarFolioEstudiante, loading: guardandoFila } = useEditarFolioEstudianteApi();

  const [filaEnEdicion, setFilaEnEdicion] = useState(null);

  const load = useCallback(async () => {
    if (isInvalidId) return;
    await fetchFolio(libroId, folioIdNum);
  }, [fetchFolio, libroId, folioIdNum, isInvalidId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleVolverAlLibro = useCallback(
    () => navigate(libroDetallePath(libroId)),
    [navigate, libroId],
  );

  const cambiarEstado = useCallback(
    async (payload) => {
      const result = await cambiarEstadoFolio(libroId, folioIdNum, payload);
      if (result.success) {
        await load();
      } else {
        notification.error({ title: 'No se pudo actualizar el folio', description: result.error });
      }
      return result;
    },
    [cambiarEstadoFolio, libroId, folioIdNum, load, notification],
  );

  const handleImprimir = useCallback(async () => {
    const result = await cambiarEstado({ estado: 'IMPRESO' });
    if (result.success) {
      notification.success({ title: 'Folio marcado como impreso' });
    }
    return result;
  }, [cambiarEstado, notification]);

  const handleFirmar = useCallback(async () => {
    const result = await cambiarEstado({ estado: 'FIRMADO' });
    if (result.success) {
      notification.success({ title: 'Folio firmado', description: 'El folio quedó FIRMADO: es inmutable.' });
    }
    return result;
  }, [cambiarEstado, notification]);

  const handleAnular = useCallback(
    async (motivo) => {
      const result = await cambiarEstado({ estado: 'ANULADO', motivo });
      if (result.success) {
        notification.success({ title: 'Folio anulado' });
      }
      return result;
    },
    [cambiarEstado, notification],
  );

  const abrirEdicionFila = useCallback((fila) => setFilaEnEdicion(fila), []);
  const cerrarEdicionFila = useCallback(() => setFilaEnEdicion(null), []);

  const handleGuardarFila = useCallback(
    async (payload) => {
      if (!filaEnEdicion?.id) return { success: false, error: 'Fila inválida' };
      const result = await editarFolioEstudiante(libroId, folioIdNum, filaEnEdicion.id, payload);
      if (result.success) {
        notification.success({ title: 'Fila actualizada' });
        setFilaEnEdicion(null);
        await load();
      } else {
        notification.error({ title: 'No se pudo actualizar la fila', description: result.error });
      }
      return result;
    },
    [editarFolioEstudiante, libroId, folioIdNum, filaEnEdicion, load, notification],
  );

  const breadcrumbItems = useMemo(
    () =>
      createLibrosBreadcrumbItems('ACA-LIBROS-FOLIO', 'ACA-LIBROS', folio?.folioLabel ?? null, {
        id: libroId,
        folioId: folioIdNum,
      }),
    [folio, libroId, folioIdNum],
  );

  return {
    libroId,
    folio,
    loading,
    error,
    isInvalidId,
    breadcrumbItems,
    handleVolverAlLibro,
    refetch: load,

    handleImprimir,
    handleFirmar,
    handleAnular,
    cambiandoEstado,

    filaEnEdicion,
    abrirEdicionFila,
    cerrarEdicionFila,
    handleGuardarFila,
    guardandoFila,
  };
};

export default useFolioPreview;
