/**
 * Hook de API: búsqueda de estudiantes para abrir su historial académico.
 *
 * Reutiliza la búsqueda de estudiantes ya expuesta (`EstudianteRepository.buscar`
 * → `GET /estudiantes/search`) y normaliza cada fila al DTO de selección con el
 * nombre completo en orden canónico (mapper). Búsqueda DEBOUNCED por texto libre
 * (mín. 2 caracteres), con descarte de respuestas obsoletas (race conditions).
 *
 * Espeja el patrón de `useBuscarEstudiantesRegistro` (Finanzas) pero sin acoplarse
 * a datos financieros: aquí solo se necesita identificar al estudiante.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import EstudianteRepository from '@infrastructure/repositories/EstudianteRepository.js';
import { mapEstudianteBusqueda } from '@application-academico/historial/mappers/historialMapper.js';

/** Retardo del debounce (ms) y mínimo de caracteres para disparar la búsqueda. */
const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 25;

export const useBuscarEstudiantesHistorial = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  /** Token de petición para descartar respuestas obsoletas. */
  const requestIdRef = useRef(0);

  const ejecutarBusqueda = useCallback(async (q) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(null);

    const result = await EstudianteRepository.buscar(q, { params: { limit: DEFAULT_LIMIT } });

    // Descartar si llegó una petición más reciente entre tanto.
    if (requestId !== requestIdRef.current) return;

    if (!result?.success) {
      setEstudiantes([]);
      setError(result?.error || 'No se pudieron buscar los estudiantes');
      setLoading(false);
      return;
    }

    const rows = Array.isArray(result.data) ? result.data.map(mapEstudianteBusqueda).filter(Boolean) : [];
    setEstudiantes(rows);
    setLoading(false);
  }, []);

  /** Búsqueda por texto libre con debounce; limpia si el término es corto. */
  const buscar = useCallback(
    (rawQuery) => {
      const q = String(rawQuery ?? '').trim();

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (q.length < MIN_QUERY_LENGTH) {
        requestIdRef.current += 1;
        setEstudiantes([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      debounceRef.current = setTimeout(() => ejecutarBusqueda(q), DEBOUNCE_MS);
    },
    [ejecutarBusqueda],
  );

  const limpiar = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    requestIdRef.current += 1;
    setEstudiantes([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  return { estudiantes, loading, error, buscar, limpiar };
};

export default useBuscarEstudiantesHistorial;
