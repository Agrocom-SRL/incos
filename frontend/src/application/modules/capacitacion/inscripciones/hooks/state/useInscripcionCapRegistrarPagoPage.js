/**
 * Hook de pantalla: "Registrar pago" de una inscripción de capacitación
 * (CAP · CREAR pago), como página propia (sin modal ni drawer).
 *
 * Consume el MISMO contexto que la ficha (`InscripcionCapacitacionDetailProvider`,
 * ensamblado por el connector) para no duplicar el fetch de la inscripción ni la
 * mutación de pago. El estado propio del flujo (método de pago elegido, reglas
 * derivadas) vivía antes en `useInscripcionCapacitacionDetailPage`; se traslada
 * aquí porque es estado de "registrar pago", no de la ficha.
 *
 * Submit con payload EXACTO del backend (`registerPagoCapacitacionValidator`) y,
 * en éxito, refetch de la ficha + navegación de vuelta al detalle.
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
  inscripcionCapDetallePath,
} from '@application-capacitacion/config/paths';

export const useInscripcionCapRegistrarPagoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const {
    inscripcionId,
    inscripcion,
    loading,
    error: fichaError,
    refetch,
    registrarPago,
    registrandoPago,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
  } = useInscripcionCapacitacionDetailContext();

  const [metodoPagoId, setMetodoPagoId] = useState(null);
  const [formError, setFormError] = useState(null);

  const returnListPath = location.state?.returnListPath || INSCRIPCIONES_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_INSCRIPCIONES_MENU_KEY;
  const isInvalidInscripcionId = !inscripcionId;
  const detallePath = inscripcionId ? inscripcionCapDetallePath(inscripcionId) : returnListPath;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Inscripciones', href: returnListPath },
      { title: 'Detalle de inscripción', href: detallePath },
      { title: 'Registrar pago' },
    ],
    [returnListPath, detallePath],
  );

  const handleVolver = useCallback(() => {
    navigate(detallePath, { state: { returnListPath, menuSidebarKey } });
  }, [navigate, detallePath, returnListPath, menuSidebarKey]);

  /** Al cambiar de método, limpia la cuenta (deja de aplicar). */
  const handleMetodoPagoChange = useCallback(
    (value) => {
      setMetodoPagoId(value);
      form.setFieldsValue({ cuentaPagoId: undefined });
    },
    [form],
  );

  // Reglas derivadas del método (compartidas con Finanzas; cuenta visible/requerida).
  const metodoCodigo = useMemo(
    () => findMetodoCodigo(metodosPago, metodoPagoId),
    [metodosPago, metodoPagoId],
  );
  const reglasMetodo = useMemo(() => buildReglasMetodo(metodoCodigo), [metodoCodigo]);

  const saldo = inscripcion?.saldo ?? 0;

  /** Submit: POST /:id/pagos + feedback + refetch de la ficha + volver al detalle. */
  const handleSubmit = useCallback(async () => {
    setFormError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToPagoPayload(values);
      if (!Number.isFinite(payload.monto) || payload.monto <= 0) {
        throw new Error('Indique un monto válido para el pago');
      }
      const result = await registrarPago(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo registrar el pago');
      }
      notification.success({
        title: 'Pago registrado',
        description: 'El pago se registró correctamente.',
      });
      await refetch();
      navigate(detallePath, { replace: true, state: { returnListPath, menuSidebarKey } });
    } catch (e) {
      if (e?.errorFields) {
        setFormError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo registrar el pago';
        setFormError(msg);
        notification.error({ title: 'Error al registrar el pago', description: msg });
      }
    }
  }, [
    form,
    registrarPago,
    notification,
    refetch,
    navigate,
    detallePath,
    returnListPath,
    menuSidebarKey,
  ]);

  return {
    inscripcion,
    loading,
    error: formError || fichaError,
    isInvalidInscripcionId,
    pageTitle: 'Registrar pago',
    breadcrumbItems,
    handleVolver,
    handleSubmit,
    submitLoading: registrandoPago,
    form,
    metodoPagoId,
    reglasMetodo,
    handleMetodoPagoChange,
    saldo,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
  };
};
