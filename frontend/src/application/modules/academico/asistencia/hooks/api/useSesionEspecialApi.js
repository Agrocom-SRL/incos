/**
 * Alta/edición y eliminación de fecha especial de clase (taller/recuperación).
 * Mutaciones imperativas:
 *  - `crear(asignacionId, { fecha, motivo, horaInicio, horaFin })` (crea o edita).
 *  - `eliminar(asignacionId, fecha)` (solo si no tiene asistencia tomada).
 */
import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export const useSesionEspecialApi = () => {
  const [creando, setCreando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const crear = useCallback(async (asignacionId, payload = {}) => {
    setCreando(true);
    try {
      const uc = useCasesFactory.crearSesionEspecialAsistencia();
      return await uc.ejecutar(asignacionId, payload);
    } finally {
      setCreando(false);
    }
  }, []);

  const eliminar = useCallback(async (asignacionId, fecha) => {
    setEliminando(true);
    try {
      const uc = useCasesFactory.eliminarSesionEspecialAsistencia();
      return await uc.ejecutar(asignacionId, fecha);
    } finally {
      setEliminando(false);
    }
  }, []);

  return { crear, creando, eliminar, eliminando };
};
