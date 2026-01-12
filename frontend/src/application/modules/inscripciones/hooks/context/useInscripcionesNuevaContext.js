/**
 * Hook: useInscripcionesNuevaContext
 * 
 * Single Responsibility: Consumir el contexto de inscripción de estudiantes nuevos
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { useContext } from 'react';
import { InscripcionesNuevaContext } from '@application-inscripciones/context/InscripcionesNuevaContext';

/**
 * Hook para consumir el contexto de inscripción de estudiantes nuevos
 * @returns {Object} Contexto de inscripción de estudiantes nuevos
 * @throws {Error} Si se usa fuera del InscripcionesNuevaProvider
 */
export const useInscripcionesNuevaContext = () => {
  const context = useContext(InscripcionesNuevaContext);
  if (!context) {
    throw new Error('useInscripcionesNuevaContext must be used within InscripcionesNuevaProvider');
  }
  return context;
};
