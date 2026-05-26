/**
 * Entrada del módulo: coordinación → vista general; docente → mis cursos.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '@application-auth';
import { CALIFICACIONES_PERMISOS } from '@application-academico/calificaciones/utils/calificacionesPermisos.js';
import { MIS_CURSOS_PATH } from '@application-academico/calificaciones/utils/calificacionesPaths.js';
import CoordinacionPage from '../pages/CoordinacionPage.jsx';

const CalificacionesEntradaConnector = () => {
  const { hasPermiso } = useAuth();

  if (hasPermiso(CALIFICACIONES_PERMISOS.coordinacion, 'LISTAR')) {
    return <CoordinacionPage />;
  }

  if (hasPermiso(CALIFICACIONES_PERMISOS.misCursos, 'LISTAR')) {
    return <Navigate to={MIS_CURSOS_PATH} replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default CalificacionesEntradaConnector;
