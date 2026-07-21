/**
 * Hook de API: catálogo de aulas para el picker del formulario de curso (CAP).
 *
 * Reutiliza el catálogo read-only `GET /aulas/catalogo` (el mismo picker de
 * Institucional → Oferta académica; NO el CRUD de CFG → Recursos). Ese endpoint
 * está protegido por `institucional.oferta.paralelo-gestion LISTAR`, que no
 * todos los roles de CAP tienen: la carga DEGRADA con gracia (aulas = [] y
 * `disponible=false`) sin bloquear el formulario — el aula es opcional.
 *
 * El backend envuelve el listado en `{ aulas: [...] }` (ver
 * `ListAulasCatalogUseCase`), no un array plano — hay que desenvolverlo antes
 * de usarlo, igual que ya hace `useOfertaParaleloDetalleState.ensureAulasCatalogo`
 * (`res.data?.aulas ?? res.data`). Sin ese desenvolvimiento, `Array.isArray`
 * siempre da `false` y el picker se ve deshabilitado para CUALQUIER rol,
 * incluido ADMIN_SISTEMA — no es un problema de permisos.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '@api-client';
import { AULAS_CATALOGO_ENDPOINT } from '@api/endpoints';
import { handleSuccessResponse, handleErrorResponse } from '@api/responseHandler';

const mapAulaOption = (raw) => {
  if (!raw || typeof raw !== 'object' || raw.id == null) return null;
  const codigo = raw.codigo ?? raw.code ?? null;
  const nombre = raw.nombre ?? raw.name ?? null;
  return {
    value: raw.id,
    label: [codigo, nombre].filter(Boolean).join(' · ') || `Aula ${raw.id}`,
  };
};

export const useAulasCatalogoCapApi = () => {
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
        // Sin permiso institucional (403) u otro error: picker deshabilitado, sin bloquear.
        setAulas([]);
        setDisponible(false);
      }
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  const buscarLabel = useCallback(
    (aulaId) => aulas.find((a) => a.value === Number(aulaId))?.label ?? null,
    [aulas],
  );

  return useMemo(
    () => ({ aulas, loading, disponible, buscarLabel }),
    [aulas, loading, disponible, buscarLabel],
  );
};
