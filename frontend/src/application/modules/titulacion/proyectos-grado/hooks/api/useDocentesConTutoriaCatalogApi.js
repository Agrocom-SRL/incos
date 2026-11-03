/**
 * Hook de API: catálogo de docentes-tutores CON al menos un tutoriado activo
 * (select de filtro de "Seguimiento de tutorías a docentes", TIT).
 *
 * A diferencia de `useDocentesCatalogoTitApi` (catálogo genérico `GET
 * /docentes`, TODOS los docentes del instituto), este deriva las opciones del
 * mismo reporte (`GET /reportes/seguimiento-tutoria-docentes`) pero SIN
 * filtros — así el select nunca ofrece un docente cuya selección resulte en
 * una lista vacía. Independiente de los filtros activos de la pantalla
 * (docenteId/carreraId/anio/mes): se carga una sola vez.
 */

import { useEffect, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { SEGUIMIENTO_TUTORIA_DOCENTES_DATA_KEY } from './useSeguimientoTutoriaDocentesApi';

export const useDocentesConTutoriaCatalogApi = () => {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;
    (async () => {
      let result = null;
      try {
        result = await proyectoGradoRepository.obtenerSeguimientoTutoriaDocentes({});
      } catch {
        // Sin catálogo: el filtro queda vacío en lugar de dejar la carga colgada.
        result = null;
      }
      if (!activo) return;
      const raw = result?.success ? result.data?.[SEGUIMIENTO_TUTORIA_DOCENTES_DATA_KEY] : null;
      const opciones = Array.isArray(raw?.docentes)
        ? raw.docentes
            .filter((d) => d?.docenteId != null)
            .map((d) => ({ value: d.docenteId, label: d.docenteNombre || `Docente ${d.docenteId}` }))
        : [];
      setDocentes(opciones);
      setLoading(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  return useMemo(() => ({ docentes, loading }), [docentes, loading]);
};

export default useDocentesConTutoriaCatalogApi;
