/**
 * Hook de pantalla: ficha de detalle de una CUENTA de pago (Config. de pagos ·
 * Finanzas).
 *
 * Sin GET /:id: resuelve el registro por `id` desde el catálogo ya cargado en
 * `ConfigPagosContext` (catálogo corto, sin paginación). La edición (incluido
 * el QR) vive en su propia página (`CuentaFormPage`/`useCuentaForm`,
 * navegación completa, ya no Drawer). El toggle activo/inactivo vive solo en
 * el listado (`EstadoTogglePill`); esta ficha es de solo lectura + Editar/
 * Eliminar (con confirmación vía `useDeleteItem`, mismo patrón que
 * `TableActions`).
 */

import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { useDeleteItem } from '@application/utils/useDeleteItem';
import { CONFIGURACION_PATH } from '@application-finanzas/config/paths';

/** Tab de origen en "Config. de pagos" (ver `configPagosTabs.js`, TAB_CUENTAS='cuentas'). */
const CUENTAS_TAB_PATH = `${CONFIGURACION_PATH}?tab=cuentas`;

export const useCuentaDetailPage = () => {
  const { id } = useParams();
  const cuentaId = Number(id);
  const navigate = useNavigate();
  const isInvalidId = !Number.isFinite(cuentaId) || cuentaId < 1;

  const { cuentas, metodos, bancos, loading, error, refetch, eliminarCuenta } =
    useConfigPagosContext();

  const cuenta = useMemo(
    () => (isInvalidId ? null : (cuentas.find((c) => c.id === cuentaId) ?? null)),
    [cuentas, cuentaId, isInvalidId],
  );

  const metodoNombre = useMemo(() => {
    const metodo = metodos.find((m) => m.id === cuenta?.metodoPagoId);
    return metodo?.nombre ?? null;
  }, [metodos, cuenta?.metodoPagoId]);

  const handleVolver = useCallback(() => navigate(CUENTAS_TAB_PATH), [navigate]);

  const { deleteItem, loading: eliminando } = useDeleteItem({
    deleteFn: eliminarCuenta,
    itemName: cuenta?.nombreTitular ? `la cuenta de ${cuenta.nombreTitular}` : 'esta cuenta',
    onSuccess: handleVolver,
  });
  const handleEliminar = useCallback(() => deleteItem(cuentaId), [deleteItem, cuentaId]);

  const avatarInitials = useMemo(
    () => (cuenta?.nombreTitular || '?').trim().slice(0, 2).toUpperCase(),
    [cuenta?.nombreTitular],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Finanzas', href: '/finanzas' },
      { title: 'Config. de pagos', href: CUENTAS_TAB_PATH },
      { title: 'Cuenta' },
    ],
    [],
  );

  return {
    cuenta,
    metodos,
    bancos,
    metodoNombre,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    eliminando,
    handleEliminar,
    handleVolver,
    refetch,
  };
};

export default useCuentaDetailPage;
