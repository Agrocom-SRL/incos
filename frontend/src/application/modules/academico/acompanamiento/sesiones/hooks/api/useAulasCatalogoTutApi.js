/**
 * Hook de API: catálogo de aulas para la sesión PRESENCIAL (módulo TUT).
 *
 * REUTILIZA el catálogo read-only `GET /aulas/catalogo` (el mismo picker de
 * Institucional → Oferta y de CAP → Cursos; NO el CRUD de CFG → Recursos).
 * Degrada con gracia si el rol no tiene el permiso institucional: el aula
 * queda deshabilitada sin bloquear el formulario (patrón
 * `useAulasCatalogoCapApi`).
 */

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@api-client';
import { AULAS_CATALOGO_ENDPOINT } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

const mapAulaOption = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.id == null) return null;
  const codigo = raw.codigo ?? null;
  const nombre = raw.nombre ?? null;
  return {
    value: raw.id,
    label: [codigo, nombre].filter(Boolean).join(' · ') || `Aula ${raw.id}`,
  };
};

export const useAulasCatalogoTutApi = () => {
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disponible, setDisponible] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      let result;
      try {
        result = handleSuccessResponse(await apiClient.get(AULAS_CATALOGO_ENDPOINT));
      } catch (error) {
        result = handleErrorResponse(error, 'No se pudo cargar el catálogo de aulas');
      }
      if (!activo) return;
      const raw = result.success ? (result.data?.aulas ?? result.data) : null;
      if (result.success && Array.isArray(raw)) {
        setAulas(raw.map(mapAulaOption).filter(Boolean));
        setDisponible(true);
      } else {
        setAulas([]);
        setDisponible(false);
      }
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  return useMemo(() => ({ aulas, loading, disponible }), [aulas, loading, disponible]);
};
