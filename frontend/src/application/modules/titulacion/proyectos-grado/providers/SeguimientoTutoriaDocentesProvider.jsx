/**
 * Provider: seguimiento de tutorías a docentes (TIT · Titulación, extensión
 * 2026-08-10 — reemplaza la planilla de avance "10 en 10" de 3er año).
 *
 * Ensambla el catálogo de carreras (mismo patrón que otros reportes del
 * módulo), el catálogo de docentes CON tutoriados activos
 * (`useDocentesConTutoriaCatalogApi` — NO el catálogo genérico `GET
 * /docentes`, que listaría también docentes sin nada que mostrar), el
 * periodo mes/año (dayjs | null — null = mes/año vigente del servidor) y el
 * reporte (`useSeguimientoTutoriaDocentesApi`, reactivo a los 4 filtros, TODOS
 * opcionales) más la exportación a Excel. Provider DELGADO: solo ensambla.
 */

import { useMemo, useState } from 'react';
import { useCarrerasCatalogApi } from '@application-shared/hooks';
import { useDocentesConTutoriaCatalogApi } from '@application-titulacion/proyectos-grado/hooks/api/useDocentesConTutoriaCatalogApi';
import { useSeguimientoTutoriaDocentesApi } from '@application-titulacion/proyectos-grado/hooks/api/useSeguimientoTutoriaDocentesApi';
import { useExportSeguimientoTutoriaDocentesExcel } from '@application-titulacion/proyectos-grado/hooks/api/useExportSeguimientoTutoriaDocentesExcel';
import { SeguimientoTutoriaDocentesContext } from '@application-titulacion/proyectos-grado/context/SeguimientoTutoriaDocentesContext';

export const SeguimientoTutoriaDocentesProvider = ({ children }) => {
  const [docenteId, setDocenteId] = useState(undefined);
  const [carreraId, setCarreraId] = useState(undefined);
  /** dayjs | null — null significa "mes/año vigente del servidor" (sin filtrar). */
  const [periodo, setPeriodo] = useState(null);

  const anio = periodo ? periodo.year() : undefined;
  const mes = periodo ? periodo.month() + 1 : undefined;

  const { carreras, loading: loadingCarreras } = useCarrerasCatalogApi();
  const { docentes, loading: loadingDocentes } = useDocentesConTutoriaCatalogApi();

  const { seguimiento, loading, error } = useSeguimientoTutoriaDocentesApi({
    docenteId,
    carreraId,
    anio,
    mes,
  });
  const { exportar, exportando } = useExportSeguimientoTutoriaDocentesExcel();

  const value = useMemo(
    () => ({
      seguimiento,
      loading,
      error,
      exportar,
      exportando,
      carreras,
      loadingCarreras,
      docentes,
      loadingDocentes,
      docenteId,
      setDocenteId,
      carreraId,
      setCarreraId,
      periodo,
      setPeriodo,
    }),
    [
      seguimiento,
      loading,
      error,
      exportar,
      exportando,
      carreras,
      loadingCarreras,
      docentes,
      loadingDocentes,
      docenteId,
      carreraId,
      periodo,
    ],
  );

  return (
    <SeguimientoTutoriaDocentesContext.Provider value={value}>
      {children}
    </SeguimientoTutoriaDocentesContext.Provider>
  );
};
