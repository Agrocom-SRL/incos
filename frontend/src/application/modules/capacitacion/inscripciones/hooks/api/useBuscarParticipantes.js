/**
 * Hook de API: búsqueda de participantes para inscribir (módulo CAP).
 *
 * Espejo funcional de `useBuscarEstudiantesRegistro` (Finanzas): búsqueda por
 * CI/nombre/celular (server-side, GET /participantes?search=) con debounce a
 * cargo del que teclea (la página llama `buscar` en cada cambio y aquí se
 * debouncea). Devuelve DTOs del mapper de participantes.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import participanteCapacitacionRepository from '@implementations/ParticipanteCapacitacionRepository';
import { mapParticipantesList } from '@application-capacitacion/participantes/mappers/participanteMapper';

const SEARCH_DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 2;
const SEARCH_LIMIT = 20;

export const useBuscarParticipantes = () => {
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const seqRef = useRef(0);

  const ejecutarBusqueda = useCallback(async (query) => {
    const seq = ++seqRef.current;
    setLoading(true);
    setError(null);
    const result = await participanteCapacitacionRepository.obtenerTodos({
      params: { search: query, page: 1, limit: SEARCH_LIMIT },
    });
    if (seq !== seqRef.current) return;
    if (!result?.success) {
      setParticipantes([]);
      setError(result?.error || 'No se pudieron buscar los participantes');
      setLoading(false);
      return;
    }
    setParticipantes(mapParticipantesList(result.data));
    setLoading(false);
  }, []);

  /** Búsqueda con debounce; con menos de 2 caracteres limpia los resultados. */
  const buscar = useCallback(
    (query) => {
      const q = String(query ?? '').trim();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (q.length < MIN_QUERY_LENGTH) {
        seqRef.current += 1;
        setParticipantes([]);
        setLoading(false);
        setError(null);
        return;
      }
      timerRef.current = setTimeout(() => ejecutarBusqueda(q), SEARCH_DEBOUNCE_MS);
    },
    [ejecutarBusqueda],
  );

  const limpiar = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    seqRef.current += 1;
    setParticipantes([]);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  return useMemo(
    () => ({ participantes, loading, error, buscar, limpiar }),
    [participantes, loading, error, buscar, limpiar],
  );
};
