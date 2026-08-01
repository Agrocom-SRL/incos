/**
 * Provider: reporte de avance de tutorías por carrera (TIT · Titulación,
 * Requisito 2 — extensión 2026-07-31).
 *
 * Ensambla los catálogos de filtro (carreras/gestiones, `application/modules/shared/hooks`
 * — mismo patrón que `useLibrosList`), el reporte (`useAvanceTutoriaCarreraApi`,
 * reactivo a los filtros) y la exportación a PDF. Provider DELGADO: solo
 * ensambla y publica el estado de filtro (la orquestación de pantalla vive en
 * `useAvanceTutoriaCarreraPage`).
 */

import { useMemo, useState } from 'react';
import { useCarrerasCatalogApi, useGestionesCatalogApi } from '@application-shared/hooks';
import { useAvanceTutoriaCarreraApi } from '@application-titulacion/proyectos-grado/hooks/api/useAvanceTutoriaCarreraApi';
import { useExportAvanceTutoriaCarreraPdf } from '@application-titulacion/proyectos-grado/hooks/api/useExportAvanceTutoriaCarreraPdf';
import { AvanceTutoriaCarreraContext } from '@application-titulacion/proyectos-grado/context/AvanceTutoriaCarreraContext';

export const AvanceTutoriaCarreraProvider = ({ children }) => {
  const [gestionId, setGestionId] = useState(undefined);
  const [carreraId, setCarreraId] = useState(undefined);

  const { carreras, loading: loadingCarreras } = useCarrerasCatalogApi();
  const { gestiones, loading: loadingGestiones } = useGestionesCatalogApi();

  const { avance, loading, error, refetch } = useAvanceTutoriaCarreraApi({ gestionId, carreraId });
  const { exportar, exportando } = useExportAvanceTutoriaCarreraPdf();

  const value = useMemo(
    () => ({
      avance,
      loading,
      error,
      refetch,
      exportar,
      exportando,
      carreras,
      loadingCarreras,
      gestiones,
      loadingGestiones,
      gestionId,
      setGestionId,
      carreraId,
      setCarreraId,
    }),
    [
      avance,
      loading,
      error,
      refetch,
      exportar,
      exportando,
      carreras,
      loadingCarreras,
      gestiones,
      loadingGestiones,
      gestionId,
      carreraId,
    ],
  );

  return (
    <AvanceTutoriaCarreraContext.Provider value={value}>
      {children}
    </AvanceTutoriaCarreraContext.Provider>
  );
};
