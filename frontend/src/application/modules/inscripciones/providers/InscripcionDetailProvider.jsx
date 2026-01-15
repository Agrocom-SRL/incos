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

import { useEffect } from 'react';
import { useGetInscripcionById } from '@application-inscripciones/hooks';
import { InscripcionDetailContext } from '@application-inscripciones/context/InscripcionDetailContext';

export const InscripcionDetailProvider = ({ children, inscripcionId }) => {
  // Hook para obtener la inscripción por ID
  // El hook retorna { inscripcion: data, ... } donde data contiene:
  // { enrollment, studentAcademicData, management, student, career }
  const { inscripcion: inscripcionRaw, loading, error, getInscripcionById, refetch } = useGetInscripcionById();

  // Cargar automáticamente la inscripción cuando se proporciona inscripcionId
  useEffect(() => {
    if (inscripcionId) {
      getInscripcionById(inscripcionId);
    }
  }, [inscripcionId, getInscripcionById]);

  // inscripcionRaw contiene toda la estructura: { enrollment, studentAcademicData, management, student, career }
  // La pasamos directamente al contexto
  const inscripcion = inscripcionRaw;

  const value = {
    inscripcion, // Contiene: { enrollment, studentAcademicData, management, student, career }
    loading,
    error,
    getInscripcionById,
    refetch: () => refetch(inscripcionId),
  };

  return (
    <InscripcionDetailContext.Provider value={value}>
      {children}
    </InscripcionDetailContext.Provider>
  );
};
