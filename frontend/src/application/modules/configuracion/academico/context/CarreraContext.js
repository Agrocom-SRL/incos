/**
 * Context: CarreraContext
 * 
 * Single Responsibility: Definir el contexto de carreras
 * 
 * Este archivo debe estar separado para evitar problemas de Fast Refresh
 * cuando se mezclan componentes y hooks en el mismo módulo.
 * 
 * Ubicación: application/modules/configuracion/academico/carreras
 * - Parte del módulo de Configuración
 * - Submódulo: Académico
 * - Feature: Carreras
 */

import { createContext } from 'react';

export const CarreraContext = createContext(null);

