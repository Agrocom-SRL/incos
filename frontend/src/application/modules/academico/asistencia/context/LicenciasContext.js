/**
 * Contexto del listado de licencias estudiantiles (página dentro de Asistencia · ACA-ASI-LIC).
 * Lo publica LicenciasProvider; lo consumen las páginas listado/aprobar vía useLicenciasContext.
 */
import { createContext } from 'react';

export const LicenciasContext = createContext(null);
