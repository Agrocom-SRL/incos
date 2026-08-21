/**
 * Estado de pantalla — Ficha del libro de registro (P2 · LibroDetailPage).
 *
 * Carga la cabecera + folios (`useLibroDetalleApi`), la generación de todos
 * los folios de la gestión del libro (`useGenerarFoliosGestion`, disparada
 * directo desde el botón, sin modal de confirmación), el cierre/reapertura
 * del libro (`useEditarLibroApi`) y la exportación a Excel
 * (`useExportLibroExcel`). Toda la orquestación vive aquí; la página solo
 * compone.
 *
 * Cierre con notas pendientes: "Cerrar libro" intenta el cierre normal; si el
 * backend responde 409 CONFLICT con `details.pendientes`, el desglose abre el
 * modal `CerrarLibroPendientesModal` (por paralelo → estudiantes → materias
 * sin nota y docente). "Cerrar de todos modos" reintenta con
 * `{ forzarCierre: true, motivo }`: los pendientes quedan asentados como
 * ABANDONO (NP en el libro) y el cierre deja auditoría en el backend.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { LIBROS_LIST_PATH, folioPreviewPath } from '../../utils/librosPaths';
import { createLibrosBreadcrumbItems } from '../../utils/librosBreadcrumbs';
import { mapCierrePendientes } from '../../mappers';
import { createFoliosTableColumns } from '@academico/libros/config/foliosTableColumns';
import { useLibroDetalleApi } from '../api/useLibroDetalleApi';
import { useGenerarFoliosGestion } from '../api/useGenerarFoliosGestion';
import { useEditarLibroApi } from '../api/useEditarLibroApi';
import { useExportLibroExcel } from '../api/useExportLibroExcel';

/** Texto de la notificación de cierre exitoso según lo que se asentó. */
const describirCierre = (cierre) => {
  const partes = ['El libro de registro quedó cerrado.'];
  if (cierre?.pendientesAsentados > 0) {
    partes.push(
      `${cierre.pendientesAsentados} estudiante(s) sin notas quedaron asentados como Abandono.`,
    );
  }
  if (cierre?.filasSincronizadas > 0) {
    partes.push(
      `${cierre.filasSincronizadas} fila(s) se actualizaron con las notas cargadas después de generar los folios.`,
    );
  }
  return partes.join(' ');
};

export const useLibroDetail = () => {
  const { id } = useParams();
  const libroId = Number(id);
  const isInvalidId = !Number.isFinite(libroId) || libroId < 1;
  const navigate = useNavigate();
  const { notification } = App.useApp();

  const { libro, loading, error, fetch: fetchLibro } = useLibroDetalleApi();
  const { generarFoliosGestion, loading: generandoTodosFolios } = useGenerarFoliosGestion();
  const { editarLibro, loading: actualizando } = useEditarLibroApi();
  const { exportar, loading: exportando } = useExportLibroExcel();

  /** Desglose del 409 (forma de UI, `mapCierrePendientes`); null = modal cerrado. */
  const [cierrePendientes, setCierrePendientes] = useState(null);

  const load = useCallback(async () => {
    if (isInvalidId) return;
    await fetchLibro(libroId);
  }, [fetchLibro, libroId, isInvalidId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleVolver = useCallback(() => navigate(LIBROS_LIST_PATH), [navigate]);

  const handleGenerarTodosFolios = useCallback(async () => {
    if (!libro?.gestionId) return { success: false };
    const result = await generarFoliosGestion(libro.gestionId);
    if (result.success) {
      const anulados = result.data?.foliosAnulados ?? 0;
      const omitidos = result.data?.omitidos?.length ?? 0;
      const detalle = [
        anulados > 0
          ? `Se reajustó la numeración: ${anulados} folio(s) anterior(es) se anularon.`
          : null,
        `Se generaron ${result.data?.foliosCreados ?? 0} folio(s) en ${result.data?.paralelosGenerados ?? 0} paralelo(s).`,
        omitidos > 0 ? `${omitidos} paralelo(s) sin estudiantes matriculados se omitieron.` : null,
      ]
        .filter(Boolean)
        .join(' ');

      notification.success({ title: 'Folios de la gestión generados', description: detalle });
      await load();
    } else {
      notification.error({
        title: 'No se pudieron generar los folios de la gestión',
        description: result.error,
      });
    }
    return result;
  }, [generarFoliosGestion, libro, notification, load]);

  const handleCerrarLibro = useCallback(async () => {
    const result = await editarLibro(libroId, { estado: 'CERRADO' });
    if (result.success) {
      notification.success({ title: 'Libro cerrado', description: describirCierre(result.cierre) });
      await load();
      return result;
    }

    const pendientes =
      result.errorDetails?.code === 'CONFLICT'
        ? mapCierrePendientes(result.errorDetails?.details)
        : null;
    if (pendientes) {
      setCierrePendientes(pendientes);
      return result;
    }

    notification.error({ title: 'No se pudo cerrar el libro', description: result.error });
    return result;
  }, [editarLibro, libroId, notification, load]);

  const handleConfirmarCierreForzado = useCallback(
    async (motivo) => {
      const result = await editarLibro(libroId, { estado: 'CERRADO', forzarCierre: true, motivo });
      if (result.success) {
        setCierrePendientes(null);
        notification.success({ title: 'Libro cerrado', description: describirCierre(result.cierre) });
        await load();
      } else {
        notification.error({ title: 'No se pudo cerrar el libro', description: result.error });
      }
      return result;
    },
    [editarLibro, libroId, notification, load],
  );

  const handleCancelarCierreForzado = useCallback(() => setCierrePendientes(null), []);

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

  const handleExportar = useCallback(
    async (carreraId = null) => {
      const result = await exportar(libroId, carreraId);
      if (result.success) {
        notification.success({
          title: 'Libro exportado',
          description: 'La descarga del libro en Excel se inició correctamente.',
        });
      } else {
        notification.error({ title: 'No se pudo exportar el libro', description: result.error });
      }
      return result;
    },
    [exportar, libroId, notification],
  );

  const tableColumns = useMemo(
    () =>
      createFoliosTableColumns({
        onView: (record) => navigate(folioPreviewPath(libroId, record.id)),
        libroEstado: libro?.estado,
      }),
    [navigate, libroId, libro?.estado],
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

    handleGenerarTodosFolios,
    generandoTodosFolios,

    handleCerrarLibro,
    handleReabrirLibro,
    actualizando,

    cierrePendientes,
    handleConfirmarCierreForzado,
    handleCancelarCierreForzado,

    handleExportar,
    exportando,
  };
};

export default useLibroDetail;
