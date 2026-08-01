import { useEffect, useState } from 'react';
import { mapDocentesList } from '@application-docentes/mappers';
import DocenteRepository from '@implementations/DocenteRepository';

const PAGE_LIMIT = 80;

/**
 * Docentes para el modal de asignación: una sola carga al abrir (sin refetch al escribir).
 * El filtro por nombre es en cliente sobre esa lista.
 */
export function useDocentesAsignacionModal({ enabled }) {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const cargar = async () => {
      if (!enabled) {
        setDocentes([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await DocenteRepository.obtenerTodos({
          params: {
            page: 1,
            limit: PAGE_LIMIT,
            incluir_estadisticas: 'false',
          },
        });
        if (cancelled) return;
        const payload = res?.success ? res.data : null;
        const rows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.docentes)
            ? payload.docentes
            : [];
        setDocentes(mapDocentesList(rows));
      } catch {
        if (!cancelled) setDocentes([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    cargar();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { docentes, loading };
}
