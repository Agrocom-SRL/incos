/**
 * Hook de pantalla: ficha de un pago de aporte (Finanzas).
 *
 * Espejo de `useDocenteDetail`: orquesta la ficha sobre el contexto del provider.
 * Genera breadcrumbs y handlers (volver, generar recibo PDF, eliminar cuota) con
 * feedback de usuario; devuelve props listas para la página "dumb". La página NO
 * hace fetch ni orquesta: todo vive aquí + en el provider.
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import dayjs from 'dayjs';
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
    actualizarCuota,
    actualizandoCuota,
    generarRecibo,
    reciboCuotaId,
    descargandoRecibo,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
  } = usePagosDetailContext();

  /** Cuota seleccionada para edición (null = modal cerrado). */
  const [cuotaEnEdicion, setCuotaEnEdicion] = useState(null);

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

  /** Abre el modal de edición con la cuota seleccionada. */
  const abrirEditarCuota = useCallback((cuota) => {
    if (!cuota?.id) return;
    setCuotaEnEdicion(cuota);
  }, []);

  /** Cierra el modal de edición (descarta la cuota seleccionada). */
  const cerrarEditarCuota = useCallback(() => {
    setCuotaEnEdicion(null);
  }, []);

  /**
   * Guarda la edición de la cuota. Arma el payload con los nombres EXACTOS del
   * backend (validator `updatePaymentCuotaValidator`) y, tras guardar, cierra el
   * modal y refresca la ficha para recalcular saldo/estado.
   */
  const guardarEditarCuota = useCallback(
    async (values) => {
      const cuotaId = cuotaEnEdicion?.id;
      if (!cuotaId) return;

      const monto = Number(values.monto);
      if (!Number.isFinite(monto) || monto < 0) {
        message.error('Indique un monto válido para la cuota');
        return;
      }

      const payload = {
        amount: monto,
        payment_method_id: Number(values.metodoPagoId),
        payment_account_id: values.cuentaPagoId ? Number(values.cuentaPagoId) : null,
        payment_date: values.fechaPago ? dayjs(values.fechaPago).format('YYYY-MM-DD') : null,
        transaction_number: (values.numeroTransaccion || '').trim() || null,
        codigo_comprobante: (values.codigoComprobante || '').trim() || null,
        descripcion: (values.descripcion || '').trim() || null,
      };

      const result = await actualizarCuota(cuotaId, payload);
      if (result?.success) {
        message.success('Cuota actualizada correctamente');
        setCuotaEnEdicion(null);
        await refetch();
      } else {
        message.error(result?.error || 'No se pudo actualizar la cuota', DURACION_MENSAJE_ERROR);
      }
    },
    [cuotaEnEdicion, actualizarCuota, refetch, message],
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
    // Edición de cuota (modal dentro de la ficha)
    cuotaEnEdicion,
    abrirEditarCuota,
    cerrarEditarCuota,
    guardarEditarCuota,
    actualizandoCuota,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
  };
};
