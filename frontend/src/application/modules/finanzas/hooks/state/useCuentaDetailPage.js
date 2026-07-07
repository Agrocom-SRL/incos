/**
 * Hook de pantalla: ficha de detalle de una CUENTA de pago (Config. de pagos ·
 * Finanzas).
 *
 * Sin GET /:id: resuelve el registro por `id` desde el catálogo ya cargado en
 * `ConfigPagosContext` (catálogo corto, sin paginación). Maneja el Drawer de
 * edición LOCAL llamando directo a `guardarCuenta` del contexto (NO reutiliza
 * `useConfigPagosPage`). Expone también el toggle activo/inactivo y eliminar
 * (con confirmación vía `useDeleteItem`, mismo patrón que `TableActions`).
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { useDeleteItem } from '@application/utils/useDeleteItem';
import { CONFIGURACION_PATH } from '@application-finanzas/config/paths';

/** Tab de origen en "Config. de pagos" (ver `configPagosTabs.js`, TAB_CUENTAS='cuentas'). */
const CUENTAS_TAB_PATH = `${CONFIGURACION_PATH}?tab=cuentas`;

export const useCuentaDetailPage = () => {
  const { id } = useParams();
  const cuentaId = Number(id);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const isInvalidId = !Number.isFinite(cuentaId) || cuentaId < 1;

  const {
    cuentas,
    metodos,
    bancos,
    loading,
    error,
    refetch,
    saving,
    guardarCuenta,
    eliminarCuenta,
  } = useConfigPagosContext();

  const cuenta = useMemo(
    () => (isInvalidId ? null : (cuentas.find((c) => c.id === cuentaId) ?? null)),
    [cuentas, cuentaId, isInvalidId],
  );

  const metodoNombre = useMemo(() => {
    const metodo = metodos.find((m) => m.id === cuenta?.metodoPagoId);
    return metodo?.nombre ?? null;
  }, [metodos, cuenta?.metodoPagoId]);

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const abrirDrawer = useCallback(() => setDrawerAbierto(true), []);
  const cerrarDrawer = useCallback(() => setDrawerAbierto(false), []);

  const handleVolver = useCallback(() => navigate(CUENTAS_TAB_PATH), [navigate]);

  const guardarCuentaSubmit = useCallback(
    async (values) => {
      const payload = {
        nombre_titular: values.nombreTitular?.trim(),
        metodo_pago_id: values.metodoPagoId ?? null,
        banco_id: values.bancoId ?? null,
        numero_cuenta: values.numeroCuenta?.trim() || null,
        numero_celular: values.numeroCelular?.trim() || null,
        activo: values.activo == null ? true : !!values.activo,
        qr: values.qr instanceof File ? values.qr : undefined,
      };
      const resultado = await guardarCuenta({ id: cuentaId, payload });
      if (resultado?.success) {
        message.success('Cuenta actualizada');
        await refetch();
        cerrarDrawer();
        return true;
      }
      message.error(resultado?.error || 'No se pudo guardar. Reintentar.');
      return false;
    },
    [guardarCuenta, cuentaId, message, refetch, cerrarDrawer],
  );

  const handleToggleActivo = useCallback(async () => {
    if (!cuenta) return;
    const activo = !cuenta.activo;
    const resultado = await guardarCuenta({ id: cuenta.id, payload: { activo } });
    if (resultado?.success) {
      message.success(activo ? 'Cuenta activada' : 'Cuenta desactivada');
      await refetch();
    } else {
      message.error(resultado?.error || 'No se pudo guardar. Reintentar.');
    }
  }, [cuenta, guardarCuenta, message, refetch]);

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
    saving,
    eliminando,
    drawerAbierto,
    abrirDrawer,
    cerrarDrawer,
    guardarCuentaSubmit,
    handleToggleActivo,
    handleEliminar,
    handleVolver,
    refetch,
  };
};

export default useCuentaDetailPage;
