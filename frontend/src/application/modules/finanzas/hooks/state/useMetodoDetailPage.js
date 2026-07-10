/**
 * Hook de pantalla: ficha de detalle de un MÉTODO de pago (Config. de pagos ·
 * Finanzas). Catálogo fijo (EFECTIVO/QR/TRANSFERENCIA/DEPOSITO): sin eliminar.
 *
 * Sin GET /:id: resuelve el registro por `id` desde el catálogo ya cargado en
 * `ConfigPagosContext`. La edición del nombre vive en su propia página
 * (`MetodoFormPage`/`useMetodoForm`, navegación completa, ya no Drawer). El
 * toggle activo/inactivo vive solo en el listado (`EstadoTogglePill`); esta
 * ficha es de solo lectura + Editar. También resuelve la navegación cruzada
 * (bancos y cuentas que usan este método) desde el mismo catálogo en memoria.
 */

import { useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConfigPagosContext } from '@application-finanzas/hooks/context/useConfigPagosContext';
import { CONFIGURACION_PATH } from '@application-finanzas/config/paths';

/** Tab de origen en "Config. de pagos" (ver `configPagosTabs.js`, TAB_METODOS='metodos'). */
const METODOS_TAB_PATH = `${CONFIGURACION_PATH}?tab=metodos`;

export const useMetodoDetailPage = () => {
  const { id } = useParams();
  const metodoId = Number(id);
  const navigate = useNavigate();
  const isInvalidId = !Number.isFinite(metodoId) || metodoId < 1;

  const { metodos, bancos, cuentas, loading, error, refetch } = useConfigPagosContext();

  const metodo = useMemo(
    () => (isInvalidId ? null : (metodos.find((m) => m.id === metodoId) ?? null)),
    [metodos, metodoId, isInvalidId],
  );

  // Navegación cruzada: bancos y cuentas que usan este método de pago.
  const bancosDelMetodo = useMemo(
    () => (metodo ? bancos.filter((b) => b.metodoPagoId === metodo.id) : []),
    [bancos, metodo],
  );
  const cuentasDelMetodo = useMemo(
    () => (metodo ? cuentas.filter((c) => c.metodoPagoId === metodo.id) : []),
    [cuentas, metodo],
  );

  const handleVolver = useCallback(() => navigate(METODOS_TAB_PATH), [navigate]);

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
    bancosDelMetodo,
    cuentasDelMetodo,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    breadcrumbItems,
    handleVolver,
    refetch,
  };
};

export default useMetodoDetailPage;
