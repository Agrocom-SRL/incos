/**
 * Context: PagosListContext
 * 
 * Single Responsibility: Definir el contexto específico para la feature de lista de pagos
 * 
 * Este archivo debe estar separado para evitar problemas de Fast Refresh
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { createContext } from 'react';

export const PagosListContext = createContext(null);
