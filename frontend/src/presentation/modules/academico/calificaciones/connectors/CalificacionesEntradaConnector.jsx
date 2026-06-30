/**
 * Entrada Calificaciones — delega en ModuleEntryConnector + landingStack (routes ACA-CAL).
 */

import { Navigate } from 'react-router-dom';
import ModuleEntryConnector from '@navigation/components/ModuleEntryConnector.jsx';
import { useAuth, esEstudiante } from '@application-auth';
import { MI_BOLETIN_PATH } from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import CoordinacionPage from '../pages/CoordinacionPage.jsx';

/**
 * Entrada Calificaciones (patrón docente CoordinacionPage→MisCursosPage):
 * - ESTUDIANTE → "Mi boletín" (rama propia, SOLO LECTURA).
 * - Staff/docente → ModuleEntryConnector + landingStack (coordinación | mis cursos).
 */
const CalificacionesEntradaConnector = () => {
  const { usuario } = useAuth();

  if (esEstudiante(usuario)) {
    return <Navigate to={MI_BOLETIN_PATH} replace />;
  }

  return <ModuleEntryConnector menuKey="ACA-CAL" inlineElement={<CoordinacionPage />} />;
};

export default CalificacionesEntradaConnector;
