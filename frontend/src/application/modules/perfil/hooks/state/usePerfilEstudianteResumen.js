/**
 * Resumen del estudiante para el hub de "Mi perfil".
 *
 * Compone, SOLO cuando el usuario es estudiante (`enabled`), las fuentes ya
 * existentes para alimentar las tarjetas de acceso del perfil sin duplicar
 * llamadas:
 *   - `useEstudianteHome` (GET /dashboard/mi-resumen) → carrera + saldo pendiente.
 *   - `useMisDatosEstudiante` (GET /estudiantes/mis-datos) → código + C.I.
 *   - Boletín (GET …/mi-boletin) → promedio general (opcional, tolerante a fallos).
 *
 * SOLO LECTURA y tolerante a fallos parciales: si una fuente falla, su dato queda
 * en `null` (la UI muestra "—") y la navegación de la tarjeta sigue funcionando.
 */

import { useCallback, useEffect, useState } from 'react';
import { useEstudianteHome } from '@application-dashboard/hooks/useEstudianteHome.js';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';
import { useMisDatosEstudiante } from './useMisDatosEstudiante.js';

export const usePerfilEstudianteResumen = (enabled = false) => {
  const { carrera, saldoPendiente, loading: loadingHome } = useEstudianteHome(enabled);
  const { misDatos, loadingMisDatos } = useMisDatosEstudiante(enabled);

  const [promedioGeneral, setPromedioGeneral] = useState(null);
  const [loadingPromedio, setLoadingPromedio] = useState(enabled);

  const cargarPromedio = useCallback(async () => {
    if (!enabled) return;
    setLoadingPromedio(true);
    try {
      const result = await CalificacionRepository.obtenerMiBoletin();
      setPromedioGeneral(
        result?.success && result.data?.promedioGeneral != null
          ? result.data.promedioGeneral
          : null,
      );
    } catch {
      setPromedioGeneral(null);
    } finally {
      setLoadingPromedio(false);
    }
  }, [enabled]);

  useEffect(() => {
    // Deshabilitado: no se consulta el boletín (cargarPromedio corta de inmediato) y
    // el estado inicial ya es null con loading=false; no hace falta resetear.
    if (!enabled) return;
    cargarPromedio();
  }, [enabled, cargarPromedio]);

  const student = misDatos?.student;

  return {
    carrera: carrera?.label || null,
    codigo: student?.studentCode || null,
    ci: student?.ci || null,
    saldoPendiente,
    promedioGeneral,
    loadingResumen: loadingHome || loadingMisDatos || loadingPromedio,
  };
};

export default usePerfilEstudianteResumen;
