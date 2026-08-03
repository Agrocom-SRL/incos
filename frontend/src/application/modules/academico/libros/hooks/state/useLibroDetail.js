/**
 * Estado de pantalla — Ficha del libro de registro (P2 · LibroDetailPage).
 *
 * Carga la cabecera + folios (`useLibroDetalleApi`), orquesta el modal
 * "Generar folios de paralelo" (`useParalelosLibroApi` + `useGenerarFolios`), el
 * cierre/reapertura del libro (`useEditarLibroApi`) y la exportación a Excel
 * (`useExportLibroExcel`). Toda la orquestación vive aquí; la página solo compone.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { LIBROS_LIST_PATH, folioPreviewPath } from '../../utils/librosPaths';
import { createLibrosBreadcrumbItems } from '../../utils/librosBreadcrumbs';
import { createFoliosTableColumns } from '@academico/libros/config/foliosTableColumns';
import { useLibroDetalleApi } from '../api/useLibroDetalleApi';
import { useParalelosLibroApi } from '../api/useParalelosLibroApi';
import { useGenerarFolios } from '../api/useGenerarFolios';
import { useEditarLibroApi } from '../api/useEditarLibroApi';
import { useExportLibroExcel } from '../api/useExportLibroExcel';

export const useLibroDetail = () => {
  const { id } = useParams();
  const libroId = Number(id);
  const isInvalidId = !Number.isFinite(libroId) || libroId < 1;
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const { libro, loading, error, fetch: fetchLibro } = useLibroDetalleApi();
  const {
    paralelos,
    loading: loadingParalelos,
    fetch: fetchParalelos,
  } = useParalelosLibroApi();
  const { generarFolios, loading: generando } = useGenerarFolios();
  const { editarLibro, loading: actualizando } = useEditarLibroApi();
  const { exportar, loading: exportando } = useExportLibroExcel();

  const [modalGenerarOpen, setModalGenerarOpen] = useState(false);

  const load = useCallback(async () => {
    if (isInvalidId) return;
    await fetchLibro(libroId);
  }, [fetchLibro, libroId, isInvalidId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleVolver = useCallback(() => navigate(LIBROS_LIST_PATH), [navigate]);

  const abrirModalGenerar = useCallback(async () => {
    setModalGenerarOpen(true);
    await fetchParalelos(libroId);
  }, [fetchParalelos, libroId]);

  const cerrarModalGenerar = useCallback(() => setModalGenerarOpen(false), []);

  const handleGenerarFolios = useCallback(
    async (paraleloGestionId) => {
      const result = await generarFolios(libroId, { paraleloGestionId });
      if (result.success) {
        notification.success({
          title: 'Folios generados',
          description: `Se generaron ${result.data?.length ?? 0} folio(s) para el paralelo elegido.`,
        });
        await Promise.all([load(), fetchParalelos(libroId)]);
      } else {
        notification.error({
          title: 'No se pudieron generar los folios',
          description: result.error,
        });
      }
      return result;
    },
    [generarFolios, libroId, notification, load, fetchParalelos],
  );

  const handleCerrarLibro = useCallback(async () => {
    const result = await editarLibro(libroId, { estado: 'CERRADO' });
    if (result.success) {
      notification.success({ title: 'Libro cerrado', description: 'El libro de registro quedó cerrado.' });
      await load();
    } else {
      notification.error({ title: 'No se pudo cerrar el libro', description: result.error });
    }
    return result;
  }, [editarLibro, libroId, notification, load]);

  const handleReabrirLibro = useCallback(async () => {
    const result = await editarLibro(libroId, { estado: 'ABIERTO' });
    if (result.success) {
      notification.success({ title: 'Libro reabierto', description: 'El libro de registro quedó abierto.' });
      await load();
    } else {
      notification.error({ title: 'No se pudo reabrir el libro', description: result.error });
    }
    return result;
  }, [editarLibro, libroId, notification, load]);

  const handleExportar = useCallback(async () => {
    const result = await exportar(libroId);
    if (result.success) {
      notification.success({
        title: 'Libro exportado',
        description: 'La descarga del libro en Excel se inició correctamente.',
      });
    } else {
      notification.error({ title: 'No se pudo exportar el libro', description: result.error });
    }
    return result;
  }, [exportar, libroId, notification]);

  const tableColumns = useMemo(
    () =>
      createFoliosTableColumns({
        onView: (record) => navigate(folioPreviewPath(libroId, record.id)),
      }),
    [navigate, libroId],
  );

  const breadcrumbItems = useMemo(
    () =>
      createLibrosBreadcrumbItems('ACA-LIBROS-DETALLE', 'ACA-LIBROS', libro?.libroLabel ?? null, {
        id: libroId,
      }),
    [libro, libroId],
  );

  return {
    libro,
    loading,
    error,
    isInvalidId,
    breadcrumbItems,
    tableColumns,
    handleVolver,
    refetch: load,

    modalGenerarOpen,
    abrirModalGenerar,
    cerrarModalGenerar,
    paralelos,
    loadingParalelos,
    handleGenerarFolios,
    generando,

    handleCerrarLibro,
    handleReabrirLibro,
    actualizando,

    handleExportar,
    exportando,
  };
};

export default useLibroDetail;
