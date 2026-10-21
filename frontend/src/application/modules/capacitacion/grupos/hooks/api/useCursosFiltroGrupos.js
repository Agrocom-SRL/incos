/**
 * Hook de API: opciones del filtro «Curso» del tab «Grupos» (módulo CAP).
 *
 * Reutiliza `useCursosCapacitacionApi` (listado completo de cursos, incluidos
 * inactivos) y lo reduce a `{value, label}`; si falla, el filtro queda vacío sin
 * bloquear el listado.
 */

import { useEffect, useMemo, useState } from 'react';
import { useCursosCapacitacionApi } from '@application-capacitacion/cursos/hooks/api/useCursosCapacitacionApi';

const CATALOG_PARAMS = { params: { page: 1, limit: 10000 } };

export const useCursosFiltroGrupos = () => {
  const { fetch } = useCursosCapacitacionApi();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;
    fetch(CATALOG_PARAMS).then((result) => {
      if (!activo) return;
      setOptions(result?.success ? result.data.map((c) => ({ value: c.id, label: c.titulo })) : []);
      setLoading(false);
    });
    return () => {
      activo = false;
    };
  }, [fetch]);

  return useMemo(() => ({ options, loading }), [options, loading]);
};
