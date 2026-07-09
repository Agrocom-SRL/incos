/**
 * Hook de pantalla: ficha de detalle de un BANCO autorizado (Config. de pagos ·
 * Finanzas).
 *
 * Sin GET /:id: resuelve el registro por `id` desde el catálogo ya cargado en
 * `ConfigPagosContext` (catálogo corto, sin paginación — mismo criterio que
 * `useConfigPagosCatalogsApi`). La edición vive en su propia página
 * (`BancoFormPage`/`useBancoForm`, navegación completa, ya no Drawer). El
 * toggle activo/inactivo vive solo en el listado (`EstadoTogglePill`); esta
 * ficha es de solo lectura + Editar/Eliminar (con confirmación vía
 * `useDeleteItem`, mismo patrón que `TableActions`). También resuelve la
 * navegación cruzada (cuentas de este banco) desde el mismo catálogo en memoria.
 */

import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { useDeleteItem } from '@application/utils/useDeleteItem';
import { CONFIGURACION_PATH } from '@application-finanzas/config/paths';

/** Tab de origen en "Config. de pagos" (ver `configPagosTabs.js`, TAB_BANCOS='bancos'). */
const BANCOS_TAB_PATH = `${CONFIGURACION_PATH}?tab=bancos`;

export const useBancoDetailPage = () => {
  const { id } = useParams();
  const bancoId = Number(id);
  const navigate = useNavigate();
  const isInvalidId = !Number.isFinite(bancoId) || bancoId < 1;

  const { bancos, metodos, cuentas, loading, error, refetch, eliminarBanco } =
    useConfigPagosContext();

  const banco = useMemo(
    () => (isInvalidId ? null : (bancos.find((b) => b.id === bancoId) ?? null)),
    [bancos, bancoId, isInvalidId],
  );

  const metodoNombre = useMemo(() => {
    const metodo = metodos.find((m) => m.id === banco?.metodoPagoId);
    return metodo?.nombre ?? null;
  }, [metodos, banco?.metodoPagoId]);

  // Navegación cruzada: cuentas de pago que pertenecen a este banco.
  const cuentasDelBanco = useMemo(
    () => (banco ? cuentas.filter((c) => c.bancoId === banco.id) : []),
    [cuentas, banco],
  );

  const handleVolver = useCallback(() => navigate(BANCOS_TAB_PATH), [navigate]);

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
    cuentasDelBanco,
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

export default useBancoDetailPage;
