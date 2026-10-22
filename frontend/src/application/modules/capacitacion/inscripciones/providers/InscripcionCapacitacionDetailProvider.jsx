/**
 * Provider: ficha de una inscripción de capacitación (CAP).
 *
 * Espejo de `PagosDetailProvider`: ensambla la ficha (auto-fetch por id), el
 * registro de pagos y los catálogos de pago COMPARTIDOS de Finanzas
 * (`usePaymentCatalogsApi` — métodos/cuentas, lectura transparente por
 * `sistema.catalogo.referencia`; no se reimplementa el fetch).
 *
 * Correcciones (capacitacion.inscripcion EDITAR): editar la inscripción
 * (participante y/o grupo), corregir y anular pagos. Todas refrescan la ficha
 * al terminar con éxito (el backend recalcula estados y saldos). La ficha del
 * curso (`cursoDetalle`) aporta los grupos con cupo del selector de grupo.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGetCursoCapacitacion } from '@application-capacitacion/cursos/hooks/api/useGetCursoCapacitacion';
import { useGetInscripcionCapacitacion } from '@application-capacitacion/inscripciones/hooks/api/useGetInscripcionCapacitacion';
import { useInscripcionCapacitacionMutations } from '@application-capacitacion/inscripciones/hooks/api/useInscripcionCapacitacionMutations';
import { usePaymentCatalogsApi } from '@application-finanzas/hooks/api/usePaymentCatalogsApi';
import { InscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/context/InscripcionCapacitacionDetailContext';

export const InscripcionCapacitacionDetailProvider = ({ children, inscripcionId }) => {
  const { inscripcion, loading, error, cargar } = useGetInscripcionCapacitacion();
  const cursoApi = useGetCursoCapacitacion();
  const {
    registrandoPago,
    registrarPago,
    actualizandoInscripcion,
    actualizarInscripcion,
    actualizandoPago,
    actualizarPago,
    anulandoPago,
    anularPago,
    anulando,
    anularInscripcion,
    guardandoRequisitos,
    subiendoComprobante,
    actualizarRequisitos,
    adjuntarComprobante,
    descargarComprobante,
    descargarFormularioPdf,
    descargarReciboPdf,
  } = useInscripcionCapacitacionMutations();
  const {
    metodosPago,
    cuentasPago,
    loading: loadingCatalogos,
    error: errorCatalogos,
  } = usePaymentCatalogsApi();

  const id = Number(inscripcionId);
  const idValido = Number.isFinite(id) && id > 0;

  useEffect(() => {
    if (idValido) {
      cargar(id);
    }
  }, [idValido, id, cargar]);

  const refetch = useCallback(() => {
    if (idValido) return cargar(id);
    return Promise.resolve({ success: false });
  }, [idValido, id, cargar]);

  const registrarPagoInscripcion = useCallback(
    (payload, comprobante) => {
      if (!idValido) return Promise.resolve({ success: false, error: 'Inscripción inválida' });
      return registrarPago(id, payload, comprobante);
    },
    [idValido, id, registrarPago],
  );

  /** Guarda el checklist de requisitos; en éxito refresca la ficha (el estado se recalcula). */
  const guardarRequisitos = useCallback(
    async (requisitos) => {
      if (!idValido) return { success: false, error: 'Inscripción inválida' };
      const result = await actualizarRequisitos(id, requisitos);
      if (result?.success) await cargar(id);
      return result;
    },
    [idValido, id, actualizarRequisitos, cargar],
  );

  /** Adjunta/reemplaza el comprobante de un pago y refresca la ficha. */
  const adjuntarComprobantePago = useCallback(
    async (pagoId, archivo) => {
      if (!idValido) return { success: false, error: 'Inscripción inválida' };
      const result = await adjuntarComprobante(id, pagoId, archivo);
      if (result?.success) await cargar(id);
      return result;
    },
    [idValido, id, adjuntarComprobante, cargar],
  );

  const descargarComprobantePago = useCallback(
    (pagoId) => {
      if (!idValido) return Promise.resolve({ success: false, error: 'Inscripción inválida' });
      return descargarComprobante(id, pagoId);
    },
    [idValido, id, descargarComprobante],
  );

  const descargarFormularioPdfActual = useCallback(() => {
    if (!idValido) return Promise.resolve({ success: false, error: 'Inscripción inválida' });
    return descargarFormularioPdf(id);
  }, [idValido, id, descargarFormularioPdf]);

  const descargarReciboPdfPago = useCallback(
    (pagoId) => {
      if (!idValido) return Promise.resolve({ success: false, error: 'Inscripción inválida' });
      return descargarReciboPdf(id, pagoId);
    },
    [idValido, id, descargarReciboPdf],
  );

  /** Corrige participante y/o grupo; en éxito refresca la ficha. */
  const actualizarInscripcionActual = useCallback(
    async (payload) => {
      if (!idValido) return { success: false, error: 'Inscripción inválida' };
      const result = await actualizarInscripcion(id, payload);
      if (result?.success) await cargar(id);
      return result;
    },
    [idValido, id, actualizarInscripcion, cargar],
  );

  /** Corrige un pago; en éxito refresca la ficha (estados y saldos recalculados). */
  const actualizarPagoInscripcion = useCallback(
    async (pagoId, payload) => {
      if (!idValido) return { success: false, error: 'Inscripción inválida' };
      const result = await actualizarPago(id, pagoId, payload);
      if (result?.success) await cargar(id);
      return result;
    },
    [idValido, id, actualizarPago, cargar],
  );

  /** Anula un pago (definitivo); en éxito refresca la ficha. */
  const anularPagoInscripcion = useCallback(
    async (pagoId, motivo) => {
      if (!idValido) return { success: false, error: 'Inscripción inválida' };
      const result = await anularPago(id, pagoId, motivo);
      if (result?.success) await cargar(id);
      return result;
    },
    [idValido, id, anularPago, cargar],
  );

  /** Anular (decisión administrativa manual): refetch de la ficha en éxito. */
  const anularInscripcionActual = useCallback(
    async (payload) => {
      if (!idValido) return { success: false, error: 'Inscripción inválida' };
      const result = await anularInscripcion(id, payload);
      if (result?.success) await cargar(id);
      return result;
    },
    [idValido, id, anularInscripcion, cargar],
  );

  const value = useMemo(
    () => ({
      inscripcionId: idValido ? id : null,
      inscripcion,
      loading,
      error: idValido ? error : 'Identificador de inscripción inválido',
      refetch,
      // Registro de pago
      registrarPago: registrarPagoInscripcion,
      registrandoPago,
      // Requisitos y comprobantes
      guardarRequisitos,
      guardandoRequisitos,
      adjuntarComprobantePago,
      subiendoComprobante,
      descargarComprobantePago,
      descargarFormularioPdf: descargarFormularioPdfActual,
      descargarReciboPdfPago,
      // Correcciones (EDITAR): inscripción y pagos
      actualizarInscripcion: actualizarInscripcionActual,
      actualizandoInscripcion,
      actualizarPago: actualizarPagoInscripcion,
      actualizandoPago,
      anularPago: anularPagoInscripcion,
      anulandoPago,
      // Ficha del curso (grupos con cupo) para el selector de grupo
      cursoDetalle: cursoApi.curso,
      loadingCursoDetalle: cursoApi.loading,
      errorCursoDetalle: cursoApi.error,
      cargarCursoDetalle: cursoApi.cargar,
      // Anular inscripción (decisión administrativa manual)
      anularInscripcion: anularInscripcionActual,
      anulando,
      // Catálogos de pago (compartidos con Finanzas)
      metodosPago,
      cuentasPago,
      loadingCatalogos,
      errorCatalogos,
    }),
    [
      idValido,
      id,
      inscripcion,
      loading,
      error,
      refetch,
      registrarPagoInscripcion,
      registrandoPago,
      guardarRequisitos,
      guardandoRequisitos,
      adjuntarComprobantePago,
      subiendoComprobante,
      descargarComprobantePago,
      descargarFormularioPdfActual,
      descargarReciboPdfPago,
      anularInscripcionActual,
      anulando,
      actualizarInscripcionActual,
      actualizandoInscripcion,
      actualizarPagoInscripcion,
      actualizandoPago,
      anularPagoInscripcion,
      anulandoPago,
      cursoApi,
      metodosPago,
      cuentasPago,
      loadingCatalogos,
      errorCatalogos,
    ],
  );

  return (
    <InscripcionCapacitacionDetailContext.Provider value={value}>
      {children}
    </InscripcionCapacitacionDetailContext.Provider>
  );
};
