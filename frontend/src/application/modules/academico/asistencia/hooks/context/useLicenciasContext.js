import { useContext } from 'react';
import { LicenciasContext } from '@application-academico/asistencia/context/LicenciasContext.js';

/**
 * Consume el contexto de licencias publicado por LicenciasProvider.
 * @returns {{ licencias: Array, loading: boolean, error: any, estado: string|undefined,
 *   setEstado: Function, refetch: Function, decidir: Function, decidiendo: boolean,
 *   estadoBloqueado: boolean }}
 */
export const useLicenciasContext = () => {
  const ctx = useContext(LicenciasContext);
  if (!ctx) {
    throw new Error('useLicenciasContext debe usarse dentro de <LicenciasProvider>');
  }
  return ctx;
};
