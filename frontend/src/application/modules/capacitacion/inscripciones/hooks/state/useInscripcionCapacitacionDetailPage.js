/**
 * Hook de pantalla: ficha de una inscripción de capacitación (CAP · DETALLE).
 *
 * Espejo de `usePagosDetailPage`: breadcrumbs, volver y el modal "Registrar
 * pago" (permiso capacitacion.pago CREAR): reglas por método de pago
 * compartidas con Finanzas, submit con payload EXACTO del backend
 * (`registerPagoCapacitacionValidator`) y refetch de la ficha.
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useInscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext';
import { mapFormValuesToPagoPayload } from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';
import {
  buildReglasMetodo,
  findMetodoCodigo,
} from '@finanzas/pagos/config/registrarFormConfig';
import {
  INSCRIPCIONES_CAP_LIST_PATH,
  CAP_INSCRIPCIONES_MENU_KEY,
} from '@application-capacitacion/config/paths';

const DURACION_MENSAJE_ERROR = 8;

export const useInscripcionCapacitacionDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [pagoForm] = Form.useForm();

  const {
    inscripcionId,
    inscripcion,
    loading,
    error,
    refetch,
    registrarPago,
    registrandoPago,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
  } = useInscripcionCapacitacionDetailContext();

  /** Modal "Registrar pago" abierto/cerrado + método elegido (campos condicionales). */
  const [pagoModalOpen, setPagoModalOpen] = useState(false);
  const [metodoPagoId, setMetodoPagoId] = useState(null);

  const returnListPath = location.state?.returnListPath || INSCRIPCIONES_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_INSCRIPCIONES_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Inscripciones', href: returnListPath },
      { title: 'Detalle de inscripción' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const abrirRegistrarPago = useCallback(() => {
    setMetodoPagoId(null);
    pagoForm.resetFields();
    setPagoModalOpen(true);
  }, [pagoForm]);

  const cerrarRegistrarPago = useCallback(() => {
    setPagoModalOpen(false);
  }, []);

  /** Al cambiar de método, limpia la cuenta (deja de aplicar). */
  const handleMetodoPagoChange = useCallback(
    (value) => {
      setMetodoPagoId(value);
      pagoForm.setFieldsValue({ cuentaPagoId: undefined });
    },
    [pagoForm],
  );

  // Reglas derivadas del método (compartidas con Finanzas; cuenta visible/requerida).
  const metodoCodigo = useMemo(
    () => findMetodoCodigo(metodosPago, metodoPagoId),
    [metodosPago, metodoPagoId],
  );
  const reglasMetodo = useMemo(() => buildReglasMetodo(metodoCodigo), [metodoCodigo]);

  const saldo = inscripcion?.saldo ?? 0;

  /** Submit del modal: POST /:id/pagos + feedback + refetch de la ficha. */
  const handleRegistrarPago = useCallback(
    async (values) => {
      const payload = mapFormValuesToPagoPayload(values);
      if (!Number.isFinite(payload.monto) || payload.monto <= 0) {
        message.error('Indique un monto válido para el pago');
        return;
      }
      const result = await registrarPago(payload);
      if (!result?.success) {
        message.error(result?.error || 'No se pudo registrar el pago', DURACION_MENSAJE_ERROR);
        return;
      }
      message.success('Pago registrado correctamente');
      setPagoModalOpen(false);
      await refetch();
    },
    [registrarPago, message, refetch],
  );

  return {
    inscripcionId,
    inscripcion,
    loading,
    error,
    refetch,
    breadcrumbItems,
    handleVolver,
    // Modal de pago
    pagoForm,
    pagoModalOpen,
    abrirRegistrarPago,
    cerrarRegistrarPago,
    metodoPagoId,
    reglasMetodo,
    handleMetodoPagoChange,
    handleRegistrarPago,
    registrandoPago,
    saldo,
    // Catálogos de pago
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
  };
};
