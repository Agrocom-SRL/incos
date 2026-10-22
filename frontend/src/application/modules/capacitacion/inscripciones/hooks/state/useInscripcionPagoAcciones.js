/**
 * Hook de pantalla: corregir y anular pagos en la pestaña «Pagos» de la ficha
 * (CAP · capacitacion.inscripcion EDITAR).
 *
 * - Editar (`PUT /:id/pagos/:pagoId`): modal con `PagoCapacitacionFormFields`;
 *   el saldo del concepto descuenta el propio pago y en curso externo solo se
 *   ofrece matrícula. Solo envía lo que cambió.
 * - Anular (`POST /:id/pagos/:pagoId/anular`): modal con motivo obligatorio
 *   (3-500 caracteres); es DEFINITIVO, el pago queda en el historial como anulado.
 *
 * No se actúa sobre pagos anulados ni con la inscripción RETIRADA/ANULADA
 * (`evaluarAccionPago`, el backend responde 409 igualmente). Los errores del
 * servidor quedan visibles dentro del modal.
 */

import { useCallback, useMemo, useState } from 'react';
import { App, Form } from 'antd';
import { useInscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext';
import {
  buildPagoUpdatePayload,
  mapPagoToEditFormValues,
  normalizarMotivoAnulacion,
} from '@application-capacitacion/inscripciones/mappers/inscripcionEdicionMapper';
import {
  conceptosParaEditarPago,
  evaluarAccionPago,
  saldosParaEditarPago,
} from '@application-capacitacion/utils/pagosCapacitacion';
import { buildReglasMetodo, findMetodoCodigo } from '@finanzas/pagos/config/registrarFormConfig';

export const useInscripcionPagoAcciones = () => {
  const { message } = App.useApp();
  const [formEditar] = Form.useForm();
  const [formAnular] = Form.useForm();

  const {
    inscripcion,
    actualizarPago,
    actualizandoPago,
    anularPago,
    anulandoPago,
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
  } = useInscripcionCapacitacionDetailContext();

  const [pagoEditando, setPagoEditando] = useState(null);
  const [pagoAnulando, setPagoAnulando] = useState(null);
  const [metodoPagoId, setMetodoPagoId] = useState(null);
  const [errorEditar, setErrorEditar] = useState(null);
  const [errorAnular, setErrorAnular] = useState(null);

  /** Habilitación (y tooltip) de editar/anular para un pago de la tabla. */
  const evaluarPago = useCallback((pago) => evaluarAccionPago(inscripcion, pago), [inscripcion]);

  // ── Editar ──
  const abrirEditar = useCallback(
    (pago) => {
      if (!evaluarAccionPago(inscripcion, pago).permitido) return;
      setErrorEditar(null);
      setMetodoPagoId(pago.metodoPagoId ?? null);
      setPagoEditando(pago);
    },
    [inscripcion],
  );

  const cerrarEditar = useCallback(() => {
    setPagoEditando(null);
    setErrorEditar(null);
  }, []);

  /** Al cambiar de método, limpia la cuenta (deja de aplicar). */
  const handleMetodoPagoChange = useCallback(
    (value) => {
      setMetodoPagoId(value);
      formEditar.setFieldsValue({ cuentaPagoId: undefined });
    },
    [formEditar],
  );

  const reglasMetodo = useMemo(
    () => buildReglasMetodo(findMetodoCodigo(metodosPago, metodoPagoId)),
    [metodosPago, metodoPagoId],
  );
  const saldosPorConcepto = useMemo(
    () => (pagoEditando ? saldosParaEditarPago(inscripcion, pagoEditando) : {}),
    [inscripcion, pagoEditando],
  );
  const conceptoOptions = useMemo(
    () => (pagoEditando ? conceptosParaEditarPago(inscripcion, pagoEditando) : []),
    [inscripcion, pagoEditando],
  );
  const initialValuesEditar = useMemo(() => mapPagoToEditFormValues(pagoEditando), [pagoEditando]);

  const guardarEdicion = useCallback(async () => {
    setErrorEditar(null);
    let values;
    try {
      values = await formEditar.validateFields();
    } catch {
      return;
    }
    const payload = buildPagoUpdatePayload(values, pagoEditando);
    if (Object.keys(payload).length === 0) {
      message.info('No hay cambios que guardar');
      cerrarEditar();
      return;
    }
    const result = await actualizarPago(pagoEditando.id, payload);
    if (!result?.success) {
      setErrorEditar(result?.error || 'No se pudo corregir el pago');
      return;
    }
    message.success('Pago corregido');
    cerrarEditar();
  }, [formEditar, pagoEditando, actualizarPago, message, cerrarEditar]);

  // ── Anular ──
  const abrirAnular = useCallback(
    (pago) => {
      if (!evaluarAccionPago(inscripcion, pago).permitido) return;
      setErrorAnular(null);
      setPagoAnulando(pago); // el modal se destruye al cerrar: el Form arranca limpio
    },
    [inscripcion],
  );

  const cerrarAnular = useCallback(() => {
    setPagoAnulando(null);
    setErrorAnular(null);
  }, []);

  const confirmarAnulacion = useCallback(async () => {
    setErrorAnular(null);
    let values;
    try {
      values = await formAnular.validateFields();
    } catch {
      return;
    }
    const result = await anularPago(pagoAnulando.id, normalizarMotivoAnulacion(values.motivo));
    if (!result?.success) {
      setErrorAnular(result?.error || 'No se pudo anular el pago');
      return;
    }
    message.success('Pago anulado');
    cerrarAnular();
  }, [formAnular, pagoAnulando, anularPago, message, cerrarAnular]);

  return {
    evaluarPago,
    // Editar
    pagoEditando,
    abrirEditar,
    cerrarEditar,
    guardarEdicion,
    guardandoEdicion: actualizandoPago,
    errorEditar,
    formEditar,
    initialValuesEditar,
    reglasMetodo,
    saldosPorConcepto,
    conceptoOptions,
    handleMetodoPagoChange,
    cursoExterno: Boolean(inscripcion?.pagoCursoExterno),
    metodosPago,
    cuentasPago,
    loadingCatalogos,
    errorCatalogos,
    // Anular
    pagoAnulando,
    abrirAnular,
    cerrarAnular,
    confirmarAnulacion,
    anulandoPagoEnCurso: anulandoPago,
    errorAnular,
    formAnular,
  };
};
