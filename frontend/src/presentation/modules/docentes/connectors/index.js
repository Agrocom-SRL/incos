import { lazy } from 'react';

export const DocentesListConnector = lazy(() => import('@docentes/connectors/DocentesListConnector'));
export const DocentesDetailConnector = lazy(() => import('@docentes/connectors/DocentesDetailConnector'));
export const DocentesCreateConnector = lazy(() => import('@docentes/connectors/DocentesCreateConnector'));
export const DocentesEditConnector = lazy(() => import('@docentes/connectors/DocentesEditConnector'));
export const MiHorarioConnector = lazy(() => import('@docentes/connectors/MiHorarioConnector'));

// Supervisión docente (DOC-SUPERVISION)
export const FichasSeguimientoListConnector = lazy(
  () => import('@docentes/supervision/connectors/FichasSeguimientoListConnector'),
);
export const FichaSeguimientoFormCreateConnector = lazy(
  () => import('@docentes/supervision/connectors/FichaSeguimientoFormCreateConnector'),
);
export const FichaSeguimientoFormEditConnector = lazy(
  () => import('@docentes/supervision/connectors/FichaSeguimientoFormEditConnector'),
);
export const FichaSeguimientoDetailConnector = lazy(
  () => import('@docentes/supervision/connectors/FichaSeguimientoDetailConnector'),
);
