/**
 * Hook de API: estudiantes de 3er año elegibles para elegir modalidad de
 * graduación (módulo TIT · Titulación, Requisito 1 — extensión 2026-07-31).
 *
 * GET /proyectos-grado/estudiantes-elegibles?carreraId=&gestionId= — el
 * backend YA filtra por 3er año y sin proyecto vigente (vista 178, guard
 * `assertEstudianteEsTercerAnio`); el frontend NO debe re-filtrar por año ni
 * ofrecer un buscador genérico paralelo (reemplaza a `useBuscarEstudiantesTit`
 * en el formulario de alta/edición de proyecto). Reactivo a `carreraId`: sin
 * carrera elegida no hay elegibles que mostrar, el select queda deshabilitado
 * en el organismo consumidor. `dataKey` ('estudiantesElegibles') coincide con
 * el `dataFieldName` del backend.
 */

import { useEffect, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapEstudiantesElegiblesList } from '@application-titulacion/proyectos-grado/mappers/tutoriaAvanceMapper';
import { CATALOG_LIST_LIMIT } from '@application/constants/listPagination';

/** Clave de datos = dataFieldName del backend (Requisito 1). */
export const ESTUDIANTES_ELEGIBLES_DATA_KEY = 'estudiantesElegibles';

export const useEstudiantesElegiblesModalidadApi = ({ carreraId, gestionId } = {}) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;

    if (carreraId == null) {
      setEstudiantes([]);
      setError(null);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    (async () => {
      const result = await proyectoGradoRepository.obtenerEstudiantesElegibles({
        params: { carreraId, gestionId: gestionId ?? undefined, limit: CATALOG_LIST_LIMIT },
      });
      if (!activo) return;
      if (result?.success) {
        const raw = result.data?.[ESTUDIANTES_ELEGIBLES_DATA_KEY] ?? result.data;
        setEstudiantes(mapEstudiantesElegiblesList(raw));
      } else {
        setEstudiantes([]);
        setError(result?.error || 'No se pudieron cargar los estudiantes elegibles');
      }
      setLoading(false);
    })();

    return () => {
      activo = false;
    };
  }, [carreraId, gestionId]);

  return useMemo(() => ({ estudiantes, loading, error }), [estudiantes, loading, error]);
};

export default useEstudiantesElegiblesModalidadApi;
