/**
 * Estado de pantalla — Folios anulados del libro (P2.5 · LibroAnuladosPage).
 *
 * Lista PLANA (sin tabs de carrera, a diferencia de la ficha) de los folios
 * ANULADOS del libro — reajustes de "Generar todos los folios" y anulaciones
 * puntuales quedan mezclados aquí, con su carrera y motivo visibles en la
 * tabla (`createFoliosTableColumns({ showCarrera: true, showMotivo: true })`).
 * Reutiliza `useLibroDetalleApi` (mismo GET /:id que la ficha, que ya trae
 * TODOS los folios) y filtra en el cliente — sin endpoint nuevo.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { libroDetallePath, folioPreviewPath } from '../../utils/librosPaths';
import { createLibrosBreadcrumbItems } from '../../utils/librosBreadcrumbs';
import { createFoliosTableColumns } from '@academico/libros/config/foliosTableColumns';
import { useLibroDetalleApi } from '../api/useLibroDetalleApi';

export const useLibroAnulados = () => {
  const { id } = useParams();
  const libroId = Number(id);
  const isInvalidId = !Number.isFinite(libroId) || libroId < 1;
  const navigate = useNavigate();

  const { libro, loading, error, fetch: fetchLibro } = useLibroDetalleApi();

  const load = useCallback(async () => {
    if (isInvalidId) return;
    await fetchLibro(libroId);
  }, [fetchLibro, libroId, isInvalidId]);

  useEffect(() => {
    load();
  }, [load]);

  const anulados = useMemo(
    () => (libro?.folios ?? []).filter((f) => f.estado === 'ANULADO'),
    [libro],
  );

  const handleVolver = useCallback(() => navigate(libroDetallePath(libroId)), [navigate, libroId]);

  const tableColumns = useMemo(
    () =>
      createFoliosTableColumns({
        onView: (record) => navigate(folioPreviewPath(libroId, record.id)),
        showCarrera: true,
        showMotivo: true,
        libroEstado: libro?.estado,
      }),
    [navigate, libroId, libro?.estado],
  );

  const breadcrumbItems = useMemo(
    () =>
      createLibrosBreadcrumbItems('ACA-LIBROS-ANULADOS', 'ACA-LIBROS', libro?.libroLabel ?? null, {
        id: libroId,
      }),
    [libro, libroId],
  );

  return {
    libro,
    anulados,
    loading,
    error,
    isInvalidId,
    breadcrumbItems,
    tableColumns,
    handleVolver,
    refetch: load,
  };
};

export default useLibroAnulados;
