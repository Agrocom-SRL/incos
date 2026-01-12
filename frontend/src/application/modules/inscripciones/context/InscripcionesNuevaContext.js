/**
 * Context: InscripcionesNuevaContext
 * 
 * Single Responsibility: Definir el contexto específico para la feature de inscripción de estudiantes nuevos
 * 
 * Este archivo debe estar separado para evitar problemas de Fast Refresh
 * cuando se mezclan componentes y hooks en el mismo módulo.
 */

import { createContext } from 'react';

export const InscripcionesNuevaContext = createContext(null);
