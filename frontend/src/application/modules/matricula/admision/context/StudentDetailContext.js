/**
 * Context: StudentDetailContext
 * 
 * Single Responsibility: Definir el contexto para el detalle de un estudiante
 * 
 * Este archivo debe estar separado para evitar problemas de Fast Refresh
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { createContext } from 'react';

export const StudentDetailContext = createContext(null);

