/**
 * Contexto del detalle de una licencia estudiantil (ficha · ACA-ASI-LIC-DET).
 * Lo publica LicenciaDetalleProvider; lo consume la página de detalle vía useLicenciaDetalleContext.
 */
import { createContext } from 'react';

export const LicenciaDetalleContext = createContext(null);
