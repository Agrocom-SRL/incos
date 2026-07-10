/**
 * Hook de pantalla: ficha de detalle de una beca o descuento del catálogo
 * maestro. Gemelo de `configuracion/complementarios/hooks/state/useDiscapacidadDetallePage.js`.
 *
 * Resuelve el registro por `id` desde el catálogo ya cargado en
 * `BecaDescuentoContext` (mismo criterio que el resto del feature: sin
 * segunda estrategia de carga vía GET /:id, aunque el repositorio ya lo
 * soporta). Expone eliminar (con confirmación, `useDeleteItem`) y navegar al
 * listado de becas asignadas de estudiantes filtrado por esta beca
 * (`handleVerAsignaciones`, sección "Estudiantes con esta beca" de la ficha).
 */

import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBecaDescuentoContext } from '@application-finanzas/becas-descuentos/hooks/context/useBecaDescuentoContext';
import { useDeleteItem } from '@application/utils/useDeleteItem';
import { CONFIGURACION_PATH, becaDescuentoEditarPath } from '@application-finanzas/config/paths';

/** Tab de origen en "Config. de pagos" (ver `configPagosTabs.js`, TAB_BECAS_DESCUENTOS). */
const BECAS_TAB_PATH = `${CONFIGURACION_PATH}?tab=becas-descuentos`;

/**
 * Listado de becas asignadas a estudiantes (módulo Matrícula, legacy
 * `estudiantes/`), filtrable por `scholarshipId` (ver
 * `ListStudentScholarshipsController.buildFilters`).
 */
const ESTUDIANTES_BECAS_LISTAR_PATH = '/estudiantes/becas/listar';

const initialsFromNombre = (nombre) => (nombre || '?').trim().slice(0, 2).toUpperCase();

export const useBecaDescuentoDetallePage = () => {
  const { id } = useParams();
  const becaId = Number(id);
  const navigate = useNavigate();
  const isInvalidId = !Number.isFinite(becaId) || becaId < 1;

  const { becasDescuentos, loading, error, refetch, eliminar } = useBecaDescuentoContext();

  const beca = useMemo(
    () => (isInvalidId ? null : (becasDescuentos.find((b) => b.id === becaId) ?? null)),
    [becasDescuentos, becaId, isInvalidId],
  );

  const avatarInitials = useMemo(() => initialsFromNombre(beca?.nombre), [beca?.nombre]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Finanzas', href: '/finanzas' },
      { title: 'Config. de pagos', href: BECAS_TAB_PATH },
      { title: 'Beca o descuento' },
    ],
    [],
  );

  const handleVolver = useCallback(() => navigate(BECAS_TAB_PATH), [navigate]);

  const handleEditar = useCallback(() => {
    if (!beca?.id) return;
    navigate(becaDescuentoEditarPath(beca.id));
  }, [beca, navigate]);

  /** Navega al listado de becas asignadas de estudiantes, filtrado por esta beca. */
  const handleVerAsignaciones = useCallback(() => {
    if (!beca?.id) return;
    navigate(`${ESTUDIANTES_BECAS_LISTAR_PATH}?scholarshipId=${beca.id}`);
  }, [beca, navigate]);

  const { deleteItem, loading: eliminando } = useDeleteItem({
    deleteFn: eliminar,
    itemName: beca?.nombre ? `la beca o descuento ${beca.nombre}` : 'esta beca o descuento',
    onSuccess: handleVolver,
  });
  const handleEliminar = useCallback(() => deleteItem(becaId), [deleteItem, becaId]);

  return {
    beca,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    eliminando,
    handleVolver,
    handleEditar,
    handleEliminar,
    handleVerAsignaciones,
    refetch,
  };
};

export default useBecaDescuentoDetallePage;
