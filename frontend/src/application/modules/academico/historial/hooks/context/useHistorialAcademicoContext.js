/**
 * Consume el contexto del Historial académico (detalle).
 * Falla explícito si se usa fuera del Provider.
 */

import { useContext } from 'react';
import { HistorialAcademicoContext } from '@application-academico/historial/context/HistorialAcademicoContext.js';

export const useHistorialAcademicoContext = () => {
  const ctx = useContext(HistorialAcademicoContext);
  if (!ctx) {
    throw new Error(
      'useHistorialAcademicoContext debe usarse dentro de <HistorialAcademicoProvider>',
    );
  }
  return ctx;
};

export default useHistorialAcademicoContext;
