/**
 * Context: StudentContext
 * 
 * Single Responsibility: Definir el contexto de estudiantes
 * 
 * Este archivo debe estar separado para evitar problemas de Fast Refresh
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { createContext } from 'react';

export const StudentContext = createContext(null);

