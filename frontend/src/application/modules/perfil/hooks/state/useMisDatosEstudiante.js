/**
 * Mis datos — ficha completa (SOLO LECTURA) del estudiante autenticado, embebida
 * en "Mi perfil". Solo carga cuando el usuario es estudiante (`enabled`).
 *
 * No edita ni descarga nada; solo lee `GET /estudiantes/mis-datos`.
 */

import { useCallback, useEffect, useState } from 'react';
import EstudianteRepository from '@infrastructure/repositories/EstudianteRepository.js';

export const useMisDatosEstudiante = (enabled = false) => {
  const [misDatos, setMisDatos] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await EstudianteRepository.obtenerMisDatos();
      if (!result?.success) {
        setMisDatos(null);
        setError(result?.error || 'No se pudieron cargar sus datos');
        return;
      }
      setMisDatos(result.data ?? null);
    } catch (err) {
      setMisDatos(null);
      setError(err?.message || 'No se pudieron cargar sus datos');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) {
      cargar();
    } else {
      setMisDatos(null);
      setLoading(false);
      setError(null);
    }
  }, [enabled, cargar]);

  return { misDatos, loadingMisDatos: loading, errorMisDatos: error, refetchMisDatos: cargar };
};

export default useMisDatosEstudiante;
