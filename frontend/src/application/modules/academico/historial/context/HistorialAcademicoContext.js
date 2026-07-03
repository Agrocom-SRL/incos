/**
 * Contexto del Historial académico (detalle).
 *
 * Contrato publicado por `HistorialAcademicoProvider` y consumido por la página
 * vía `useHistorialAcademicoContext`. El provider es delgado: solo ensambla el
 * hook de pantalla `useHistorialAcademico`.
 */

import { createContext } from 'react';

export const HistorialAcademicoContext = createContext(null);

export default HistorialAcademicoContext;
