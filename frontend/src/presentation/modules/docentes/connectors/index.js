import { lazy } from 'react';

export const DocentesListConnector = lazy(() => import('@docentes/connectors/DocentesListConnector'));
export const DocentesDetailConnector = lazy(() => import('@docentes/connectors/DocentesDetailConnector'));
export const DocentesCreateConnector = lazy(() => import('@docentes/connectors/DocentesCreateConnector'));
export const DocentesEditConnector = lazy(() => import('@docentes/connectors/DocentesEditConnector'));
export const DocentesAsignacionAcademicaConnector = lazy(() =>
  import('@docentes/connectors/DocentesAsignacionAcademicaConnector')
);
