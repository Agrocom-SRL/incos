/**
 * Hook de pantalla: ficha de detalle de un BANCO autorizado (Config. de pagos ·
 * Finanzas).
 *
 * Sin GET /:id: resuelve el registro por `id` desde el catálogo ya cargado en
 * `ConfigPagosContext` (catálogo corto, sin paginación — mismo criterio que
 * `useConfigPagosCatalogsApi`). Maneja el Drawer de edición LOCAL llamando
 * directo a `guardarBanco` del contexto (NO reutiliza `useConfigPagosPage`,
 * que es de la pantalla de tabs). Expone también el toggle activo/inactivo
 * (que se movió de la tabla a la ficha) y eliminar (con confirmación vía
 * `useDeleteItem`, mismo patrón que `TableActions`).
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { App } from 'antd';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { useDeleteItem } from '@application/utils/useDeleteItem';
import { CONFIGURACION_PATH } from '@application-finanzas/config/paths';

/** Tab de origen en "Config. de pagos" (ver `configPagosTabs.js`, TAB_BANCOS='bancos'). */
const BANCOS_TAB_PATH = `${CONFIGURACION_PATH}?tab=bancos`;

export const useBancoDetailPage = () => {
  const { id } = useParams();
  const bancoId = Number(id);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const isInvalidId = !Number.isFinite(bancoId) || bancoId < 1;

  const {
    bancos,
    metodos,
    loading,
    error,
    refetch,
    saving,
    guardarBanco,
    eliminarBanco,
    cambiarEstadoBanco,
  } = useConfigPagosContext();

  const banco = useMemo(
    () => (isInvalidId ? null : (bancos.find((b) => b.id === bancoId) ?? null)),
    [bancos, bancoId, isInvalidId],
  );

  const metodoNombre = useMemo(() => {
    const metodo = metodos.find((m) => m.id === banco?.metodoPagoId);
    return metodo?.nombre ?? null;
  }, [metodos, banco?.metodoPagoId]);

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const abrirDrawer = useCallback(() => setDrawerAbierto(true), []);
  const cerrarDrawer = useCallback(() => setDrawerAbierto(false), []);

  const handleVolver = useCallback(() => navigate(BANCOS_TAB_PATH), [navigate]);

  const guardarBancoSubmit = useCallback(
    async (values) => {
      const payload = {
        codigo: values.codigo?.trim(),
        nombre: values.nombre?.trim(),
        metodo_pago_id: values.metodoPagoId ?? null,
        activo: values.activo == null ? true : !!values.activo,
      };
      const resultado = await guardarBanco({ id: bancoId, payload });
      if (resultado?.success) {
        message.success('Banco actualizado');
        await refetch();
        cerrarDrawer();
        return true;
      }
      message.error(resultado?.error || 'No se pudo guardar. Reintentar.');
      return false;
    },
    [guardarBanco, bancoId, message, refetch, cerrarDrawer],
  );

  const handleToggleActivo = useCallback(async () => {
    if (!banco) return;
    const activo = !banco.activo;
    // PATCH /:id/estado (acción ACTIVAR), mismo endpoint que el toggle del listado.
    const resultado = await cambiarEstadoBanco(banco.id, activo);
    if (resultado?.success) {
      message.success(activo ? 'Banco activado' : 'Banco desactivado');
      await refetch();
    } else {
      message.error(resultado?.error || 'No se pudo guardar. Reintentar.');
    }
  }, [banco, cambiarEstadoBanco, message, refetch]);

  const { deleteItem, loading: eliminando } = useDeleteItem({
    deleteFn: eliminarBanco,
    itemName: banco?.nombre ? `el banco ${banco.nombre}` : 'este banco',
    onSuccess: handleVolver,
  });
  const handleEliminar = useCallback(() => deleteItem(bancoId), [deleteItem, bancoId]);

  const avatarInitials = useMemo(
    () => (banco?.nombre || '?').trim().slice(0, 2).toUpperCase(),
    [banco?.nombre],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Finanzas', href: '/finanzas' },
      { title: 'Config. de pagos', href: BANCOS_TAB_PATH },
      { title: 'Banco' },
    ],
    [],
  );

  return {
    banco,
    metodos,
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
    guardarBancoSubmit,
    handleToggleActivo,
    handleEliminar,
    handleVolver,
    refetch,
  };
};

export default useBancoDetailPage;
