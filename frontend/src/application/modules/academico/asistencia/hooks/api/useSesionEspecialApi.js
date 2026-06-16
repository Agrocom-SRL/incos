/**
 * Alta de fecha especial de clase (taller/recuperación; permite fecha futura).
 * Mutación imperativa: `crear(asignacionId, { fecha, motivo, horaInicio, horaFin })`.
 */
import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export const useSesionEspecialApi = () => {
  const [creando, setCreando] = useState(false);

  const crear = useCallback(async (asignacionId, payload = {}) => {
    setCreando(true);
    try {
      const uc = useCasesFactory.crearSesionEspecialAsistencia();
      return await uc.ejecutar(asignacionId, payload);
    } finally {
      setCreando(false);
    }
  }, []);

  return { crear, creando };
};
