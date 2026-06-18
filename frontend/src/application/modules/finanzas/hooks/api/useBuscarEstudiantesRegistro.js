/**
 * Hook de API: búsqueda de estudiantes para registrar un abono (módulo Finanzas).
 *
 * Módulo independiente del legacy `@pagos`/`@application-pagos`: consume directamente
 * la INFRAESTRUCTURA compartida — `PagoAporteRepository.buscarEstudiantesRegistroAporte`
 * (GET /pagos-aportes/buscar-estudiantes-registro).
 *
 * Expone una búsqueda DEBOUNCED por texto libre (min. 2 caracteres) y un modo
 * `preliminar` (estudiantes con saldo en cabeceras, sin `q`). Devuelve filas ya
 * normalizadas a un DTO estable (nombre completo en orden canónico vía buildFullName).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import pagoAporteRepository from '@implementations/PagoAporteRepository';
import { mapEstudianteBusqueda } from '@application-finanzas/mappers/pagosRegistrarMapper';

/** Retardo del debounce (ms) y mínimo de caracteres para disparar la búsqueda libre. */
const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 25;

export const useBuscarEstudiantesRegistro = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  /** Token de petición para descartar respuestas obsoletas (race conditions). */
  const requestIdRef = useRef(0);

  const ejecutarBusqueda = useCallback(async ({ q = '', preliminar = false, limit = DEFAULT_LIMIT }) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setError(null);

    const result = await pagoAporteRepository.buscarEstudiantesRegistroAporte({ q, preliminar, limit });

    // Descartar si llegó una petición más reciente entre tanto.
    if (requestId !== requestIdRef.current) {
      return;
    }

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

  /** Búsqueda por texto libre con debounce; limpia resultados si el término es corto. */
  const buscar = useCallback(
    (rawQuery) => {
      const q = String(rawQuery ?? '').trim();

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (q.length < MIN_QUERY_LENGTH) {
        // Invalida respuestas en vuelo y limpia.
        requestIdRef.current += 1;
        setEstudiantes([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      debounceRef.current = setTimeout(() => {
        ejecutarBusqueda({ q });
      }, DEBOUNCE_MS);
    },
    [ejecutarBusqueda],
  );

  /** Carga inicial (preliminar): estudiantes con saldo pendiente en cabeceras. */
  const cargarPreliminar = useCallback(() => {
    ejecutarBusqueda({ preliminar: true });
  }, [ejecutarBusqueda]);

  const limpiar = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    requestIdRef.current += 1;
    setEstudiantes([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(
    () => () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    },
    [],
  );

  return { estudiantes, loading, error, buscar, cargarPreliminar, limpiar };
};
