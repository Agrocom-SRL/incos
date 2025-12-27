/**
 * Context: NavigationContext
 * 
 * Single Responsibility: Definir el contexto de navegación
 * 
 * Este archivo debe estar separado para evitar problemas de Fast Refresh
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { createContext } from 'react';

export const NavigationContext = createContext(null);

