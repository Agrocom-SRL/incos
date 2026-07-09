/**
 * Hook de pantalla: ficha de detalle de un BANCO autorizado (Config. de pagos ·
 * Finanzas).
 *
 * Sin GET /:id: resuelve el registro por `id` desde el catálogo ya cargado en
 * `ConfigPagosContext` (catálogo corto, sin paginación — mismo criterio que
 * `useConfigPagosCatalogsApi`). La edición vive en su propia página
 * (`BancoFormPage`/`useBancoForm`, navegación completa, ya no Drawer). Expone
 * el toggle activo/inactivo (que se movió de la tabla a la ficha) y eliminar
 * (con confirmación vía `useDeleteItem`, mismo patrón que `TableActions`).
 */

import { useCallback, useMemo } from 'react';
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

  const { bancos, metodos, loading, error, refetch, saving, eliminarBanco, cambiarEstadoBanco } =
    useConfigPagosContext();

  const banco = useMemo(
    () => (isInvalidId ? null : (bancos.find((b) => b.id === bancoId) ?? null)),
    [bancos, bancoId, isInvalidId],
  );

  const metodoNombre = useMemo(() => {
    const metodo = metodos.find((m) => m.id === banco?.metodoPagoId);
    return metodo?.nombre ?? null;
  }, [metodos, banco?.metodoPagoId]);

  const handleVolver = useCallback(() => navigate(BANCOS_TAB_PATH), [navigate]);

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
    handleToggleActivo,
    handleEliminar,
    handleVolver,
    refetch,
  };
};

export default useBancoDetailPage;
