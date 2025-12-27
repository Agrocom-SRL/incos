/**
 * Context: DashboardContext
 * 
 * Single Responsibility: Definir el contexto del dashboard
 * 
 * Este archivo debe estar separado para evitar problemas de Fast Refresh
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { createContext } from 'react';

export const DashboardContext = createContext(null);

