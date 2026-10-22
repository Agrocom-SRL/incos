/**
 * Hook de pantalla: corregir y anular pagos en la pestaña «Pagos» de la ficha
 * (CAP · capacitacion.inscripcion EDITAR).
 *
 * - Editar: navega a la página «Editar pago» (`/:id/pagos/:pagoId/editar`, hook
 *   `useInscripcionCapEditarPagoPage`), el mismo formulario de «Registrar pago».
 * - Anular (`POST /:id/pagos/:pagoId/anular`): modal con motivo obligatorio
 *   (3-500 caracteres); es DEFINITIVO, el pago queda en el historial como anulado.
 *
 * No se actúa sobre pagos anulados ni con la inscripción RETIRADA/ANULADA
 * (`evaluarAccionPago`, el backend responde 409 igualmente). Los errores del
 * servidor de la anulación quedan visibles dentro del modal.
 */

import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App, Form } from 'antd';
import { useInscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext';
import { normalizarMotivoAnulacion } from '@application-capacitacion/inscripciones/mappers/inscripcionEdicionMapper';
import { evaluarAccionPago } from '@application-capacitacion/utils/pagosCapacitacion';
import { inscripcionCapEditarPagoPath } from '@application-capacitacion/config/paths';

export const useInscripcionPagoAcciones = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [formAnular] = Form.useForm();

  const {
    inscripcion,
    anularPago,
    anulandoPago,
  } = useInscripcionCapacitacionDetailContext();

  const [pagoAnulando, setPagoAnulando] = useState(null);
  const [errorAnular, setErrorAnular] = useState(null);

  /** Habilitación (y tooltip) de editar/anular para un pago de la tabla. */
  const evaluarPago = useCallback((pago) => evaluarAccionPago(inscripcion, pago), [inscripcion]);

  // ── Editar: página propia (`useInscripcionCapEditarPagoPage`), no modal ──
  const irAEditar = useCallback(
    (pago) => {
      if (!evaluarAccionPago(inscripcion, pago).permitido) return;
      navigate(inscripcionCapEditarPagoPath(inscripcion.id, pago.id), {
        state: location.state,
      });
    },
    [inscripcion, navigate, location.state],
  );

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
      setErrorAnular(result?.error || 'No se pudo eliminar el pago');
      return;
    }
    message.success('Pago eliminado');
    cerrarAnular();
  }, [formAnular, pagoAnulando, anularPago, message, cerrarAnular]);

  return {
    evaluarPago,
    // Editar (página propia)
    irAEditar,
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
