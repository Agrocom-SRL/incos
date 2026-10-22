/**
 * Hook de API: mutaciones de inscripciones de capacitación (módulo CAP).
 *
 * - `inscribir`: POST /inscripciones-capacitacion (participante nuevo O
 *   participanteId + capacitacionId + pagoInicial opcional, una transacción).
 * - `registrarPago`: POST /inscripciones-capacitacion/:id/pagos (capacitacion.pago CREAR);
 *   JSON, o multipart si se adjunta `comprobante` (opcional, imagen/PDF).
 * - `actualizarInscripcion`: PUT /:id (corregir participante y/o grupo; EDITAR).
 * - `actualizarPago` / `anularPago`: PUT /:id/pagos/:pagoId y POST …/anular (EDITAR);
 *   el pago anulado se conserva como historial y deja de contar.
 * - `actualizarRequisitos`: PUT /:id/requisitos (checklist; capacitacion.inscripcion EDITAR).
 * - `adjuntarComprobante`: POST /:id/pagos/:pagoId/comprobante (adjuntar o reemplazar después).
 * - `descargarComprobante`: GET /:id/pagos/:pagoId/comprobante (descarga el archivo).
 * - `descargarFormularioPdf` / `descargarReciboPdf`: GET /:id/formulario-pdf y
 *   /:id/pagos/:pagoId/recibo-pdf (capacitacion.inscripcion DETALLE).
 * - `eliminarInscripcion`: DELETE /:id (soft delete + pagos en cascada).
 * - `anularInscripcion`: POST /:id/anular (capacitacion.inscripcion EDITAR —
 *   no existe acción ANULAR en el vocabulario cerrado de permisos) —
 *   decisión administrativa manual, el monto pagado no se devuelve.
 */

import { useCallback, useMemo, useState } from 'react';
import inscripcionCapacitacionRepository from '@implementations/InscripcionCapacitacionRepository';
import { downloadBlob } from '@application/utils';
import { buildPagoRequestBody } from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';

export const useInscripcionCapacitacionMutations = () => {
  const [inscribiendo, setInscribiendo] = useState(false);
  const [registrandoPago, setRegistrandoPago] = useState(false);
  const [anulando, setAnulando] = useState(false);
  const [actualizandoInscripcion, setActualizandoInscripcion] = useState(false);
  const [actualizandoPago, setActualizandoPago] = useState(false);
  const [anulandoPago, setAnulandoPago] = useState(false);
  const [guardandoRequisitos, setGuardandoRequisitos] = useState(false);
  const [subiendoComprobante, setSubiendoComprobante] = useState(false);

  const inscribir = useCallback(async (payload) => {
    setInscribiendo(true);
    try {
      return await inscripcionCapacitacionRepository.crear(payload);
    } finally {
      setInscribiendo(false);
    }
  }, []);

  const registrarPago = useCallback(async (inscripcionId, payload, comprobante) => {
    setRegistrandoPago(true);
    try {
      return await inscripcionCapacitacionRepository.registrarPago(
        inscripcionId,
        buildPagoRequestBody(payload, comprobante),
      );
    } finally {
      setRegistrandoPago(false);
    }
  }, []);

  const actualizarInscripcion = useCallback(async (inscripcionId, payload) => {
    setActualizandoInscripcion(true);
    try {
      return await inscripcionCapacitacionRepository.actualizar(inscripcionId, payload);
    } finally {
      setActualizandoInscripcion(false);
    }
  }, []);

  const actualizarPago = useCallback(async (inscripcionId, pagoId, payload) => {
    setActualizandoPago(true);
    try {
      return await inscripcionCapacitacionRepository.actualizarPago(inscripcionId, pagoId, payload);
    } finally {
      setActualizandoPago(false);
    }
  }, []);

  const anularPago = useCallback(async (inscripcionId, pagoId, motivo) => {
    setAnulandoPago(true);
    try {
      return await inscripcionCapacitacionRepository.anularPago(inscripcionId, pagoId, motivo);
    } finally {
      setAnulandoPago(false);
    }
  }, []);

  const actualizarRequisitos = useCallback(async (inscripcionId, requisitos) => {
    setGuardandoRequisitos(true);
    try {
      return await inscripcionCapacitacionRepository.actualizarRequisitos(inscripcionId, requisitos);
    } finally {
      setGuardandoRequisitos(false);
    }
  }, []);

  const adjuntarComprobante = useCallback(async (inscripcionId, pagoId, archivo) => {
    setSubiendoComprobante(true);
    try {
      return await inscripcionCapacitacionRepository.adjuntarComprobante(
        inscripcionId,
        pagoId,
        archivo,
      );
    } finally {
      setSubiendoComprobante(false);
    }
  }, []);

  /** Descarga el comprobante y dispara el guardado del archivo en el navegador. */
  const descargarComprobante = useCallback(async (inscripcionId, pagoId) => {
    const result = await inscripcionCapacitacionRepository.descargarComprobante(
      inscripcionId,
      pagoId,
    );
    if (!result?.success || !result.blob) {
      return { success: false, error: result?.error || 'No se pudo descargar el comprobante' };
    }
    downloadBlob(result.blob, result.fileName || `comprobante_pago_${pagoId}`);
    return { success: true };
  }, []);

  /** Ejecuta una descarga PDF del repositorio y dispara el guardado en el navegador. */
  const guardarPdf = useCallback(async (descarga, fallbackName, errorMsg) => {
    const result = await descarga();
    if (!result?.success || !result.blob) {
      return { success: false, error: result?.error || errorMsg };
    }
    downloadBlob(result.blob, result.fileName || fallbackName);
    return { success: true };
  }, []);

  const descargarFormularioPdf = useCallback(
    (inscripcionId) =>
      guardarPdf(
        () => inscripcionCapacitacionRepository.descargarFormularioPdf(inscripcionId),
        `formulario_inscripcion_${inscripcionId}.pdf`,
        'No se pudo descargar el formulario de inscripción',
      ),
    [guardarPdf],
  );

  const descargarReciboPdf = useCallback(
    (inscripcionId, pagoId) =>
      guardarPdf(
        () => inscripcionCapacitacionRepository.descargarReciboPdf(inscripcionId, pagoId),
        `recibo_pago_${pagoId}.pdf`,
        'No se pudo descargar el recibo de pago',
      ),
    [guardarPdf],
  );

  const eliminarInscripcion = useCallback(
    (id) => inscripcionCapacitacionRepository.eliminar(id),
    [],
  );

  const anularInscripcion = useCallback(async (id, payload) => {
    setAnulando(true);
    try {
      return await inscripcionCapacitacionRepository.anular(id, payload);
    } finally {
      setAnulando(false);
    }
  }, []);

  return useMemo(
    () => ({
      inscribiendo,
      registrandoPago,
      anulando,
      actualizandoInscripcion,
      actualizandoPago,
      anulandoPago,
      guardandoRequisitos,
      subiendoComprobante,
      inscribir,
      registrarPago,
      actualizarInscripcion,
      actualizarPago,
      anularPago,
      actualizarRequisitos,
      adjuntarComprobante,
      descargarComprobante,
      descargarFormularioPdf,
      descargarReciboPdf,
      eliminarInscripcion,
      anularInscripcion,
    }),
    [
      inscribiendo,
      registrandoPago,
      anulando,
      actualizandoInscripcion,
      actualizandoPago,
      anulandoPago,
      guardandoRequisitos,
      subiendoComprobante,
      inscribir,
      registrarPago,
      actualizarInscripcion,
      actualizarPago,
      anularPago,
      actualizarRequisitos,
      adjuntarComprobante,
      descargarComprobante,
      descargarFormularioPdf,
      descargarReciboPdf,
      eliminarInscripcion,
      anularInscripcion,
    ],
  );
};
