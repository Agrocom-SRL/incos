/**
 * Hook de API: participantes sugeridos para inscribir (módulo CAP).
 *
 * Landing del paso 1 del wizard "Inscribir participante": en vez de arrancar
 * con un estado vacío "Escriba para buscar", propone de entrada hasta 10
 * participantes SIN inscripción vigente (`GET /participantes
 * ?sinInscripcionActiva=true&limit=10&page=1`) — candidatos naturales para
 * inscribir. Se dispara una sola vez (`cargarSugeridos`), no hay debounce ni
 * paginación (lista corta y fija).
 */

import { useCallback, useMemo, useState } from 'react';
import participanteCapacitacionRepository from '@implementations/ParticipanteCapacitacionRepository';
import { mapParticipantesList } from '@application-capacitacion/participantes/mappers/participanteMapper';

const SUGERIDOS_LIMIT = 10;

export const useParticipantesSugeridosApi = () => {
  const [sugeridos, setSugeridos] = useState([]);
  const [loadingSugeridos, setLoadingSugeridos] = useState(false);
  const [errorSugeridos, setErrorSugeridos] = useState(null);

  const cargarSugeridos = useCallback(async () => {
    setLoadingSugeridos(true);
    setErrorSugeridos(null);
    const result = await participanteCapacitacionRepository.obtenerTodos({
      params: { sinInscripcionActiva: true, limit: SUGERIDOS_LIMIT, page: 1 },
    });
    if (!result?.success) {
      setSugeridos([]);
      setErrorSugeridos(result?.error || 'No se pudieron cargar los participantes sugeridos');
      setLoadingSugeridos(false);
      return;
    }
    setSugeridos(mapParticipantesList(result.data));
    setLoadingSugeridos(false);
  }, []);

  return useMemo(
    () => ({ sugeridos, loadingSugeridos, errorSugeridos, cargarSugeridos }),
    [sugeridos, loadingSugeridos, errorSugeridos, cargarSugeridos],
  );
};
