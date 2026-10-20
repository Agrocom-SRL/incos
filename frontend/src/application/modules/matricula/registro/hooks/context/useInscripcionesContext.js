/**
 * Hook: useInscripcionesContext
 * 
 * Single Responsibility: Consumir el contexto principal de inscripciones (estado compartido)
 * 
 * Clean Architecture:
 * - Application Layer: Accede al estado compartido de inscripciones en memoria
 * - Proporciona datos y métodos para CRUD en memoria
 * 
 * Este hook debe estar en un archivo separado para que Fast Refresh funcione correctamente
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { useContext } from 'react';
import { InscripcionesContext } from '@application-matricula/registro/context/InscripcionesContext';

/**
 * Hook para consumir el contexto principal de inscripciones
 * 
 * @returns {Object} Contexto de inscripciones con:
 * - inscripciones: Array de inscripciones (estado en memoria)
 * - loading: Estado de carga
 * - error: Error si existe
 * - addInscripcion: Función para agregar inscripción al estado
 * - updateInscripcion: Función para actualizar inscripción en el estado
 * - removeInscripcion: Función para eliminar inscripción del estado
 * - refetch: Función para sincronizar con BD
 * @throws {Error} Si se usa fuera del InscripcionesProvider
 */
export const useInscripcionesContext = () => {
  const context = useContext(InscripcionesContext);
  if (!context) {
    throw new Error('useInscripcionesContext must be used within InscripcionesProvider');
  }
  return context;
};
