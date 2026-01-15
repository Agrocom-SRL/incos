/**
 * Context: InscripcionDetailContext
 * 
 * Single Responsibility: Definir el contexto para el detalle de una inscripción
 * 
 * Este archivo debe estar separado para evitar problemas de Fast Refresh
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { createContext } from 'react';

export const InscripcionDetailContext = createContext(null);
