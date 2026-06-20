/**
 * Inscripción vigente del estudiante (resuelve estudiante → inscripcionId para la solicitud).
 *
 * Fetch puro: `consultarInscripcion(estudianteId)` → backend `{ data: { inscripcion } }`.
 * El use case del container devuelve `{ inscripcion: {...} | null }`; aquí se desenvuelve la
 * clave `inscripcion` (puede ser null cuando el estudiante no tiene inscripción vigente, en
 * cuyo caso la página muestra un Alert y deshabilita el guardado).
 *
 * No se usa `createApiHook` porque su `dataKey` no desenvuelve `result.data[clave]` (solo
 * nombra la propiedad expuesta), y aquí necesitamos extraer `result.data.inscripcion`.
 */
import { useCallback, useState } from 'react';
import { useCasesFactory } from '@container';

export const useInscripcionVigenteApi = () => {
  const [inscripcion, setInscripcion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const consultarInscripcion = useCallback(async (estudianteId) => {
    setLoading(true);
    setError(null);
    try {
      const useCase = useCasesFactory.obtenerInscripcionVigenteLicencia();
      const result = await useCase.ejecutar(estudianteId);
      if (!result?.success) {
        const msg = result?.error || 'No se pudo consultar la inscripción vigente del estudiante';
        setError(msg);
        setInscripcion(null);
        return { success: false, error: msg };
      }
      const inscripcionVigente = result.data?.inscripcion ?? null;
      setInscripcion(inscripcionVigente);
      return { success: true, inscripcion: inscripcionVigente };
    } catch (e) {
      const msg = e?.message || 'Error al consultar la inscripción vigente del estudiante';
      setError(msg);
      setInscripcion(null);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const limpiarInscripcion = useCallback(() => {
    setInscripcion(null);
    setError(null);
  }, []);

  return { inscripcion, loading, error, consultarInscripcion, limpiarInscripcion };
};

export default useInscripcionVigenteApi;
