/**
 * Provider: ficha de seguimiento en clase (DOC · Supervisión docente).
 *
 * Ensambla el hook de API (S2, auto-fetch por id) y la exportación a PDF
 * (S6). La orquestación (navegación, feedback) vive en
 * `useFichaSeguimientoDetailPage`.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useGetFichaSeguimiento } from '@application-docentes/supervision/hooks/api/useGetFichaSeguimiento';
import { useExportarFichaPdf } from '@application-docentes/supervision/hooks/api/useExportarFichaPdf';
import { FichaSeguimientoDetailContext } from '@application-docentes/supervision/context/FichaSeguimientoDetailContext';

export const FichaSeguimientoDetailProvider = ({ children, fichaId }) => {
  const { ficha, loading, error, cargar } = useGetFichaSeguimiento();
  const { descargando: descargandoPdf, exportarPdf } = useExportarFichaPdf();

  const id = Number(fichaId);
  const idValido = Number.isFinite(id) && id > 0;

  useEffect(() => {
    if (idValido) {
      cargar(id);
    }
  }, [idValido, id, cargar]);

  const refetch = useCallback(() => {
    if (idValido) return cargar(id);
    return Promise.resolve({ success: false });
  }, [idValido, id, cargar]);

  const value = useMemo(
    () => ({
      fichaId: idValido ? id : null,
      ficha,
      loading,
      error: idValido ? error : 'Identificador de ficha inválido',
      refetch,
      descargandoPdf,
      exportarPdf,
    }),
    [idValido, id, ficha, loading, error, refetch, descargandoPdf, exportarPdf],
  );

  return (
    <FichaSeguimientoDetailContext.Provider value={value}>
      {children}
    </FichaSeguimientoDetailContext.Provider>
  );
};
