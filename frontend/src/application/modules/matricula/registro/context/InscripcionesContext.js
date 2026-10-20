/**
 * Context: InscripcionesContext
 * 
 * Single Responsibility: Definir el contexto global del módulo de inscripciones
 * 
 * Este archivo debe estar separado para evitar problemas de Fast Refresh
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { createContext } from 'react';

export const InscripcionesContext = createContext(null);
