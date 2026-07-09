/**
 * Hook de pantalla: ficha de detalle de un MÉTODO de pago (Config. de pagos ·
 * Finanzas). Catálogo fijo (EFECTIVO/QR/TRANSFERENCIA/DEPOSITO): sin eliminar.
 *
 * Sin GET /:id: resuelve el registro por `id` desde el catálogo ya cargado en
 * `ConfigPagosContext`. La edición del nombre vive en su propia página
 * (`MetodoFormPage`/`useMetodoForm`, navegación completa, ya no Drawer).
 * Expone también el toggle activo/inactivo (movido de la tabla a la ficha).
 */

import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { CONFIGURACION_PATH } from '@application-finanzas/config/paths';

/** Tab de origen en "Config. de pagos" (ver `configPagosTabs.js`, TAB_METODOS='metodos'). */
const METODOS_TAB_PATH = `${CONFIGURACION_PATH}?tab=metodos`;

export const useMetodoDetailPage = () => {
  const { id } = useParams();
  const metodoId = Number(id);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const isInvalidId = !Number.isFinite(metodoId) || metodoId < 1;

  const { metodos, loading, error, refetch, saving, cambiarEstadoMetodo } =
    useConfigPagosContext();

  const metodo = useMemo(
    () => (isInvalidId ? null : (metodos.find((m) => m.id === metodoId) ?? null)),
    [metodos, metodoId, isInvalidId],
  );

  const handleVolver = useCallback(() => navigate(METODOS_TAB_PATH), [navigate]);

  const handleToggleActivo = useCallback(async () => {
    if (!metodo) return;
    const activo = !metodo.activo;
    // PATCH /:id/estado (acción ACTIVAR), mismo endpoint que el toggle del listado.
    const resultado = await cambiarEstadoMetodo(metodo.id, activo);
    if (resultado?.success) {
      message.success(activo ? 'Método activado' : 'Método desactivado');
      await refetch();
    } else {
      message.error(resultado?.error || 'No se pudo guardar. Reintentar.');
    }
  }, [metodo, cambiarEstadoMetodo, message, refetch]);

  const avatarInitials = useMemo(
    () => (metodo?.nombre || '?').trim().slice(0, 2).toUpperCase(),
    [metodo?.nombre],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Finanzas', href: '/finanzas' },
      { title: 'Config. de pagos', href: METODOS_TAB_PATH },
      { title: 'Método de pago' },
    ],
    [],
  );

  return {
    metodo,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    saving,
    handleToggleActivo,
    handleVolver,
    refetch,
  };
};

export default useMetodoDetailPage;
