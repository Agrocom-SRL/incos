/**
 * Provider: InscripcionDetailProvider
 * 
 * Single Responsibility: Proporcionar estado compartido para el detalle de una inscripción
 * 
 * Clean Architecture:
 * - Application Layer: Provider específico para la feature de detalle de inscripción
 * - Usa useGetInscripcionById para obtener datos del backend
 * - Maneja el estado de la inscripción completa con todos sus datos relacionados
 * 
 * Ventajas:
 * - Aislamiento: estado independiente para el detalle
 * - Reutilizable: puede usarse en cualquier componente que necesite el detalle
 * - Caché: mantiene la inscripción cargada mientras el provider esté montado
 * - Carga automática: carga la inscripción automáticamente cuando se proporciona inscripcionId
 */

import { useMatriculaDetailPage } from '@application-inscripciones/hooks';
import { InscripcionDetailContext } from '@application-inscripciones/context/InscripcionDetailContext';

export const InscripcionDetailProvider = ({ children, inscripcionId }) => {
  const value = useMatriculaDetailPage(inscripcionId);

  return (
    <InscripcionDetailContext.Provider value={value}>
      {children}
    </InscripcionDetailContext.Provider>
  );
};
