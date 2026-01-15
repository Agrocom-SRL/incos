/**
 * Hook: useInscripcionDetailContext
 * 
 * Single Responsibility: Consumir el contexto de detalle de inscripción
 * 
 * Clean Architecture:
 * - Application Layer: Accede al estado del detalle de inscripción
 * - Proporciona datos y métodos para obtener/recargar la inscripción
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { useContext } from 'react';
import { InscripcionDetailContext } from '@application-inscripciones/context/InscripcionDetailContext';

/**
 * Hook para consumir el contexto de detalle de inscripción
 * 
 * @returns {Object} Contexto de detalle de inscripción con:
 * - inscripcion: Objeto con la inscripción completa y sus datos relacionados
 * - loading: Estado de carga
 * - error: Error si existe
 * - getInscripcionById: Función para obtener una inscripción por ID
 * - refetch: Función para recargar la inscripción actual
 * @throws {Error} Si se usa fuera del InscripcionDetailProvider
 */
export const useInscripcionDetailContext = () => {
  const context = useContext(InscripcionDetailContext);
  if (!context) {
    throw new Error('useInscripcionDetailContext must be used within InscripcionDetailProvider');
  }
  return context;
};
