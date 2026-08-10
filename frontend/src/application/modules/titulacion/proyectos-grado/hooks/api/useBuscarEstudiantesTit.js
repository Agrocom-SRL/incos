/**
 * Hook de API: búsqueda de estudiantes para titular/integrantes del proyecto
 * (módulo TIT · Titulación).
 *
 * REUTILIZA la búsqueda de estudiantes ya expuesta
 * (`EstudianteRepository.buscar` → `GET /estudiantes/search`, catálogo del
 * plan — no se crean endpoints nuevos). Búsqueda DEBOUNCED (mín. 2
 * caracteres) con descarte de respuestas obsoletas, mismo patrón que
 * `useBuscarEstudiantesHistorial` (Académico · Historial).
 *
 * El nombre se arma en orden institucional APELLIDO_PATERNO APELLIDO_MATERNO
 * NOMBRES (buildFullName).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import EstudianteRepository from '@infrastructure/repositories/EstudianteRepository.js';
import { normalizeFieldToArray } from '@application/utils';
import { buildFullName } from '@application/utils/formatters';

const DEBOUNCE_MS = 350;
export const MIN_QUERY_LENGTH = 2;
const DEFAULT_LIMIT = 25;

const mapEstudianteOption = (row) => {
  if (!row || row.id == null) return null;
  return {
    id: row.id,
    ci: row.ci ?? null,
    nombreCompleto: buildFullName(
      row.nombres,
      row.apellidoPaterno,
      row.apellidoMaterno,
      row.nombreCompleto || 'Sin nombre',
    ),
    carreraId: row.carreraId ?? null,
    carreraNombre: row.carreraNombre ?? null,
  };
};

export const useBuscarEstudiantesTit = () => {
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

    if (requestId !== requestIdRef.current) return;

    if (!result?.success) {
      // 404 NOT_FOUND del BaseSearchController = sin coincidencias → empty, no error.
      const sinResultados = result?.errorDetails?.code === 'NOT_FOUND';
      setEstudiantes([]);
      setError(sinResultados ? null : result?.error || 'No se pudieron buscar los estudiantes');
      setLoading(false);
      return;
    }

    const rows = normalizeFieldToArray(result.data, 'student')
      .map(mapEstudianteOption)
      .filter(Boolean);
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

export default useBuscarEstudiantesTit;
