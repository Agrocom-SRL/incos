/**
 * Hook de API: mutaciones de inscripciones de capacitación (módulo CAP).
 *
 * - `inscribir`: POST /inscripciones-capacitacion (participante nuevo O
 *   participanteId + capacitacionId + pagoInicial opcional, una transacción).
 * - `registrarPago`: POST /inscripciones-capacitacion/:id/pagos (capacitacion.pago CREAR).
 * - `eliminarInscripcion`: DELETE /:id (soft delete + pagos en cascada).
 */

import { useCallback, useMemo, useState } from 'react';
import inscripcionCapacitacionRepository from '@implementations/InscripcionCapacitacionRepository';

export const useInscripcionCapacitacionMutations = () => {
  const [inscribiendo, setInscribiendo] = useState(false);
  const [registrandoPago, setRegistrandoPago] = useState(false);

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

  return useMemo(
    () => ({ inscribiendo, registrandoPago, inscribir, registrarPago, eliminarInscripcion }),
    [inscribiendo, registrandoPago, inscribir, registrarPago, eliminarInscripcion],
  );
};
