/**
 * Contextos y hooks de consumo del autosave del cuaderno.
 * Separados del Provider (CuadernoAutosaveContext.jsx) para que ese archivo solo exporte componentes.
 */

import { createContext, useContext } from 'react';

export const CuadernoRegistryContext = createContext(null);
export const CuadernoFooterContext = createContext(null);

export const useCuadernoAutosaveRegistry = () => {
  const ctx = useContext(CuadernoRegistryContext);
  if (!ctx) {
    throw new Error('useCuadernoAutosaveRegistry debe usarse dentro de CuadernoAutosaveProvider');
  }
  return ctx;
};

export const useCuadernoFooterState = () => {
  const footerState = useContext(CuadernoFooterContext);
  if (footerState == null) {
    throw new Error('useCuadernoFooterState debe usarse dentro de CuadernoAutosaveProvider');
  }
  return footerState;
};
