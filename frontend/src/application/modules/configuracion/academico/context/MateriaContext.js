/**
 * Context: MateriaContext
 * 
 * Single Responsibility: Definir el contexto de materias
 * 
 * Este archivo debe estar separado para evitar problemas de Fast Refresh
 * cuando se mezclan componentes y hooks en el mismo módulo.
 * 
 * Ubicación: application/modules/configuracion/academico
 * - Parte del módulo de Configuración
 * - Submódulo: Académico
 * - Feature: Materias
 */

import { createContext } from 'react';

export const MateriaContext = createContext(null);

