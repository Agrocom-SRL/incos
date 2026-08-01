/**
 * Provider: planilla de avance de tutorías "10 en 10" (TIT · Titulación,
 * Requisito 3 — extensión 2026-07-31).
 *
 * Ensambla los catálogos de filtro (carreras/gestiones, mismo patrón que
 * `useLibrosList`), el bimestre (catálogo fijo 1-4) y la planilla
 * (`usePlanillaAvanceTercerAnioApi`, reactiva a los 3 filtros) más la
 * exportación a Excel. Provider DELGADO: solo ensambla.
 */

import { useMemo, useState } from 'react';
import { useCarrerasCatalogApi, useGestionesCatalogApi } from '@application-shared/hooks';
import { usePlanillaAvanceTercerAnioApi } from '@application-titulacion/proyectos-grado/hooks/api/usePlanillaAvanceTercerAnioApi';
import { useExportPlanillaAvanceTercerAnioExcel } from '@application-titulacion/proyectos-grado/hooks/api/useExportPlanillaAvanceTercerAnioExcel';
import { PlanillaAvanceTercerAnioContext } from '@application-titulacion/proyectos-grado/context/PlanillaAvanceTercerAnioContext';

export const PlanillaAvanceTercerAnioProvider = ({ children }) => {
  const [carreraId, setCarreraId] = useState(undefined);
  const [gestionId, setGestionId] = useState(undefined);
  const [bimestre, setBimestre] = useState(undefined);

  const { carreras, loading: loadingCarreras } = useCarrerasCatalogApi();
  const { gestiones, loading: loadingGestiones } = useGestionesCatalogApi();

  const { planilla, loading, error } = usePlanillaAvanceTercerAnioApi({
    carreraId,
    gestionId,
    bimestre,
  });
  const { exportar, exportando } = useExportPlanillaAvanceTercerAnioExcel();

  const value = useMemo(
    () => ({
      planilla,
      loading,
      error,
      exportar,
      exportando,
      carreras,
      loadingCarreras,
      gestiones,
      loadingGestiones,
      carreraId,
      setCarreraId,
      gestionId,
      setGestionId,
      bimestre,
      setBimestre,
    }),
    [
      planilla,
      loading,
      error,
      exportar,
      exportando,
      carreras,
      loadingCarreras,
      gestiones,
      loadingGestiones,
      carreraId,
      gestionId,
      bimestre,
    ],
  );

  return (
    <PlanillaAvanceTercerAnioContext.Provider value={value}>
      {children}
    </PlanillaAvanceTercerAnioContext.Provider>
  );
};
