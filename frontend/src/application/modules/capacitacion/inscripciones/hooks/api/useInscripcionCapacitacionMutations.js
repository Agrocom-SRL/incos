/**
 * Hook de API: mutaciones de inscripciones de capacitación (módulo CAP).
 *
 * - `inscribir`: POST /inscripciones-capacitacion (participante nuevo O
 *   participanteId + capacitacionId + pagoInicial opcional, una transacción).
 * - `registrarPago`: POST /inscripciones-capacitacion/:id/pagos (capacitacion.pago CREAR).
 * - `eliminarInscripcion`: DELETE /:id (soft delete + pagos en cascada).
 * - `anularInscripcion`: POST /:id/anular (capacitacion.inscripcion EDITAR —
 *   no existe acción ANULAR en el vocabulario cerrado de permisos) —
 *   decisión administrativa manual, el monto pagado no se devuelve.
 */

import { useCallback, useMemo, useState } from 'react';
import inscripcionCapacitacionRepository from '@implementations/InscripcionCapacitacionRepository';

export const useInscripcionCapacitacionMutations = () => {
  const [inscribiendo, setInscribiendo] = useState(false);
  const [registrandoPago, setRegistrandoPago] = useState(false);
  const [anulando, setAnulando] = useState(false);

  const inscribir = useCallback(async (payload) => {
    setInscribiendo(true);
    try {
      return await inscripcionCapacitacionRepository.crear(payload);
    } finally {
      setInscribiendo(false);
    }
  }, []);

  const registrarPago = useCallback(async (inscripcionId, payload) => {
    setRegistrandoPago(true);
    try {
      return await inscripcionCapacitacionRepository.registrarPago(inscripcionId, payload);
    } finally {
      setRegistrandoPago(false);
    }
  }, []);

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
      inscribir,
      registrarPago,
      eliminarInscripcion,
      anularInscripcion,
    }),
    [
      inscribiendo,
      registrandoPago,
      anulando,
      inscribir,
      registrarPago,
      eliminarInscripcion,
      anularInscripcion,
    ],
  );
};
