/**
 * Hook de pantalla: «Editar pago» de una inscripción de capacitación (CAP ·
 * capacitacion.inscripcion EDITAR), como página propia (mismo formulario que
 * «Registrar pago», sin modal).
 *
 * Consume el contexto de la ficha (`InscripcionCapacitacionDetailProvider`). Precarga el
 * pago de la URL (`:pagoId`); el saldo del concepto descuenta el propio pago y en curso
 * externo solo se ofrece matrícula. Envía SOLO lo que cambió (`PUT …/pagos/:pagoId`) y,
 * si se eligió un archivo, adjunta/reemplaza el comprobante (opcional). No se edita un
 * pago anulado ni con la inscripción RETIRADA/ANULADA (`evaluarAccionPago`).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useInscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext';
import { extractComprobanteFile } from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';
import {
  buildPagoUpdatePayload,
  mapPagoToEditFormValues,
} from '@application-capacitacion/inscripciones/mappers/inscripcionEdicionMapper';
import {
  conceptosParaEditarPago,
  evaluarAccionPago,
  saldosParaEditarPago,
} from '@application-capacitacion/utils/pagosCapacitacion';
import { buildReglasMetodo, findMetodoCodigo } from '@finanzas/pagos/config/registrarFormConfig';
import {
  INSCRIPCIONES_CAP_LIST_PATH,
  CAP_INSCRIPCIONES_MENU_KEY,
  inscripcionCapDetallePath,
} from '@application-capacitacion/config/paths';

export const useInscripcionCapEditarPagoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pagoId } = useParams();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const {
    inscripcionId,
    inscripcion,
    loading,
    error: fichaError,
    refetch,
    actualizarPago,
    actualizandoPago,
    adjuntarComprobantePago,
    subiendoComprobante,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
  } = useInscripcionCapacitacionDetailContext();

  const [metodoPagoId, setMetodoPagoId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [inicializado, setInicializado] = useState(false);

  const returnListPath = location.state?.returnListPath || INSCRIPCIONES_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_INSCRIPCIONES_MENU_KEY;
  const isInvalidInscripcionId = !inscripcionId || !pagoId;
  const detallePath = inscripcionId ? inscripcionCapDetallePath(inscripcionId) : returnListPath;

  const pago = useMemo(
    () => (inscripcion?.pagos ?? []).find((p) => String(p.id) === String(pagoId)) ?? null,
    [inscripcion, pagoId],
  );
  const evaluacion = useMemo(
    () => (inscripcion && pago ? evaluarAccionPago(inscripcion, pago) : { permitido: false, motivo: null }),
    [inscripcion, pago],
  );

  // Precarga el formulario una sola vez, cuando llega el pago.
  useEffect(() => {
    if (!pago || inicializado) return;
    form.setFieldsValue(mapPagoToEditFormValues(pago));
    setMetodoPagoId(pago.metodoPagoId ?? null);
    setInicializado(true);
  }, [pago, inicializado, form]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Inscripciones', href: returnListPath },
      { title: 'Detalle de inscripción', href: detallePath },
      { title: 'Editar pago' },
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

  const reglasMetodo = useMemo(
    () => buildReglasMetodo(findMetodoCodigo(metodosPago, metodoPagoId)),
    [metodosPago, metodoPagoId],
  );
  const saldosPorConcepto = useMemo(
    () => (pago ? saldosParaEditarPago(inscripcion, pago) : {}),
    [inscripcion, pago],
  );
  const conceptoOptions = useMemo(
    () => (pago ? conceptosParaEditarPago(inscripcion, pago) : []),
    [inscripcion, pago],
  );

  /** Submit: PUT solo con lo que cambió + comprobante opcional + refetch + volver al detalle. */
  const handleSubmit = useCallback(async () => {
    setFormError(null);
    try {
      const values = await form.validateFields();
      const payload = buildPagoUpdatePayload(values, pago);
      const archivo = extractComprobanteFile(values.comprobante);
      if (Object.keys(payload).length === 0 && !archivo) {
        notification.info({ title: 'Sin cambios', description: 'No hay cambios que guardar.' });
        handleVolver();
        return;
      }
      if (Object.keys(payload).length > 0) {
        const result = await actualizarPago(pago.id, payload);
        if (!result?.success) throw new Error(result?.error || 'No se pudo corregir el pago');
      }
      if (archivo) {
        const result = await adjuntarComprobantePago(pago.id, archivo);
        if (!result?.success) throw new Error(result?.error || 'No se pudo adjuntar el comprobante');
      }
      notification.success({ title: 'Pago corregido', description: 'Los cambios se guardaron.' });
      await refetch();
      navigate(detallePath, { replace: true, state: { returnListPath, menuSidebarKey } });
    } catch (e) {
      if (e?.errorFields) {
        setFormError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo corregir el pago';
        setFormError(msg);
        notification.error({ title: 'Error al editar el pago', description: msg });
      }
    }
  }, [
    form,
    pago,
    actualizarPago,
    adjuntarComprobantePago,
    notification,
    refetch,
    navigate,
    handleVolver,
    detallePath,
    returnListPath,
    menuSidebarKey,
  ]);

  const bloqueo =
    inscripcion && !loading
      ? !pago
        ? 'No se encontró el pago solicitado.'
        : !evaluacion.permitido
          ? evaluacion.motivo || 'Este pago no se puede editar.'
          : null
      : null;

  return {
    inscripcion,
    loading,
    error: formError || fichaError || bloqueo,
    bloqueado: Boolean(bloqueo),
    isInvalidInscripcionId,
    pageTitle: 'Editar pago',
    breadcrumbItems,
    handleVolver,
    handleSubmit,
    submitLoading: actualizandoPago || subiendoComprobante,
    form,
    reglasMetodo,
    handleMetodoPagoChange,
    saldosPorConcepto,
    conceptoOptions,
    cursoExterno: Boolean(inscripcion?.pagoCursoExterno),
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
  };
};
