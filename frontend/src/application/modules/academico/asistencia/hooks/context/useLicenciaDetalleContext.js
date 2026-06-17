import { useContext } from 'react';
import { LicenciaDetalleContext } from '@application-academico/asistencia/context/LicenciaDetalleContext.js';

/**
 * Consume el contexto del detalle de licencia publicado por LicenciaDetalleProvider.
 */
export const useLicenciaDetalleContext = () => {
  const ctx = useContext(LicenciaDetalleContext);
  if (!ctx) {
    throw new Error('useLicenciaDetalleContext debe usarse dentro de <LicenciaDetalleProvider>');
  }
  return ctx;
};

export default useLicenciaDetalleContext;
