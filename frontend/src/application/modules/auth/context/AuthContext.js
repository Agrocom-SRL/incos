/**
 * Context: AuthContext
 * 
 * Single Responsibility: Proporcionar contexto de autenticación
 * 
 * Clean Architecture:
 * - Application Layer: Context para estado de autenticación
 */

import { createContext } from 'react';

export const AuthContext = createContext(null);
