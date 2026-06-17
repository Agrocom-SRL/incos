/**
 * Provider: detalle de una licencia estudiantil (ficha · ACA-ASI-LIC-DET).
 * Delgado — ensambla el hook de estado y publica el contexto.
 */

import { useLicenciaDetalle } from '@application-academico/asistencia/hooks/state/useLicenciaDetalle.js';
import { LicenciaDetalleContext } from '@application-academico/asistencia/context/LicenciaDetalleContext.js';

export const LicenciaDetalleProvider = ({ children, licenciaId }) => {
  const value = useLicenciaDetalle(licenciaId);
  return (
    <LicenciaDetalleContext.Provider value={value}>{children}</LicenciaDetalleContext.Provider>
  );
};

export default LicenciaDetalleProvider;
