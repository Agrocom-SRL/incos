/**
 * Hook de pantalla: ficha de un pago de aporte (Finanzas).
 *
 * Espejo de `useDocenteDetail`: orquesta la ficha sobre el contexto del provider.
 * Genera breadcrumbs y handlers (volver, generar recibo PDF, eliminar cuota) con
 * feedback de usuario; devuelve props listas para la página "dumb". La página NO
 * hace fetch ni orquesta: todo vive aquí + en el provider.
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { showDeleteConfirm } from '@molecules/DeleteConfirmModal';
import { usePagosDetailContext } from '@application-finanzas/hooks/context/usePagosDetailContext';
import { PAGOS_LIST_PATH } from '@application-finanzas/config/paths';

const FIN_PAG_MENU_KEY = 'FIN-PAG';
const DURACION_MENSAJE_ERROR = 8;

/** Formatea un monto en bolivianos (Bs 1.234,50). */
const formatBolivianos = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `Bs ${safe.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatFecha = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString('es-BO', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const usePagosDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message, modal } = App.useApp();

  const {
    pagoId,
    pago,
    loading,
    error,
    refetch,
    eliminarCuota,
    generarRecibo,
    reciboCuotaId,
    descargandoRecibo,
  } = usePagosDetailContext();

  const returnListPath = location.state?.returnListPath || PAGOS_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? FIN_PAG_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Finanzas' },
      { title: 'Pagos', href: returnListPath },
      { title: 'Detalle de pago' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleGenerarRecibo = useCallback(
    async (cuota) => {
      // El recibo se genera por cuota (id) o, en su defecto, por número de recibo.
      const cuotaId = cuota?.id ?? cuota?.numeroRecibo ?? null;
      if (cuotaId == null) {
        message.warning('No se puede generar el recibo: falta el identificador de la cuota');
        return;
      }
      message.loading({ content: 'Generando recibo…', key: 'recibo-cuota' });
      const result = await generarRecibo(cuotaId);
      if (result?.success) {
        message.success({ content: 'Recibo descargado', key: 'recibo-cuota' });
      } else {
        message.error({
          content: result?.error || 'No se pudo generar el recibo',
          key: 'recibo-cuota',
          duration: DURACION_MENSAJE_ERROR,
        });
      }
    },
    [generarRecibo, message],
  );

  const handleEliminarCuota = useCallback(
    (cuota) => {
      const cuotaId = cuota?.id;
      if (!cuotaId) return;
      showDeleteConfirm({
        modal,
        itemName: 'esta cuota de pago',
        itemDetails: [
          { label: 'Recibo', value: cuota.numeroRecibo || '—' },
          { label: 'Fecha', value: formatFecha(cuota.fechaPago) },
          { label: 'Monto', value: formatBolivianos(cuota.monto) },
        ],
        onConfirm: async () => {
          const result = await eliminarCuota(cuotaId);
          if (result?.success) {
            message.success('Cuota eliminada correctamente');
            await refetch();
          } else {
            message.error(result?.error || 'No se pudo eliminar la cuota', DURACION_MENSAJE_ERROR);
          }
        },
      });
    },
    [modal, eliminarCuota, refetch, message],
  );

  return {
    pagoId,
    pago,
    loading,
    error,
    breadcrumbItems,
    returnListPath,
    reciboCuotaId,
    descargandoRecibo,
    handleVolver,
    handleGenerarRecibo,
    handleEliminarCuota,
  };
};
