/**
 * Institucional → Gestión de horarios
 *
 *   /institucional/horarios              → panel principal
 *   /institucional/horarios/armado       → grilla semanal
 *   /institucional/horarios/publicacion  → publicar paralelos_gestion
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { UnderConstruction } from '@components/pages';
import {
  ArmadoGestionRedirectFromParaleloPath,
  ArmadoGestionRedirectFromPlantillaPath,
} from '@institucional/horarios/connectors/HorariosArmadoEntryRedirects';

const GestionHorariosConnector = lazy(() => import('@institucional/horarios/connectors'));
const GestionHorariosArmadoConnector = lazy(
  () => import('@institucional/horarios/connectors/ArmadoConnector'),
);
const GestionHorariosPublicacionConnector = lazy(
    () => import('@institucional/horarios/connectors/PublicacionConnector'),
);
const GestionHorariosConflictosConnector = lazy(
    () => import('@institucional/horarios/connectors/ConflictosConnector'),
);
export const horariosRoutes = [
  {
    path: '/institucional/horarios/generar',
    element: <UnderConstruction />,
    key: 'INST-HORARIO-GENERAR',
    permiso: 'institucional.horario.asignar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'INST-HORARIOS',
  },
  {
    path: '/institucional/horarios/plantilla',
    element: <ArmadoGestionRedirectFromPlantillaPath />,
    key: 'INST-HORARIO-PLANTILLA',
    permiso: 'institucional.horario.plantilla',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'INST-HORARIOS',
  },
  {
    path: '/institucional/horarios/paralelo/:paraleloId/gestion',
    element: <ArmadoGestionRedirectFromParaleloPath />,
    key: 'INST-HORARIO-PARALELO-GESTION',
    permiso: 'institucional.gestion.horarios',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'INST-HORARIOS',
  },
  {
    path: '/institucional/horarios/armado',
    element: <GestionHorariosArmadoConnector />,
    key: 'INST-HORARIO-ARMADO',
    permiso: 'institucional.horario.armado',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'INST-HORARIOS',
  },
  {
    path: '/institucional/horarios/aulas',
    element: <Navigate to="/institucional/horarios" replace />,
    key: 'INST-HORARIO-AULAS-LEGACY',
    menu: null,
  },
  {
    path: '/institucional/horarios/conflictos',
    element: <GestionHorariosConflictosConnector />,
    key: 'INST-HORARIO-CONFLICTOS',
    permiso: 'institucional.horario.armado',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'INST-HORARIOS',
  },
  {
    path: '/institucional/horarios/asignacion-docente',
    element: <Navigate to="/institucional/oferta" replace />,
    key: 'INST-HORARIO-ASIGNACION-DOCENTE-LEGACY',
    menu: null,
  },
  {
    path: '/institucional/horarios/carga-docentes/:gestionId',
    element: <Navigate to="/institucional/oferta" replace />,
    key: 'INST-HORARIO-CARGA-DOCENTES-LEGACY',
    menu: null,
  },
  {
    path: '/institucional/horarios/publicacion',
    element: <GestionHorariosPublicacionConnector />,
    key: 'INST-HORARIO-PUBLICACION',
    permiso: 'institucional.horario.publicacion',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'INST-HORARIOS',
  },
  {
    path: '/institucional/horarios',
    element: <GestionHorariosConnector />,
    key: 'INST-HORARIOS',
    permiso: 'institucional.gestion.horarios',
    accion: 'LISTAR',
    menu: {
      label: 'Gestión de Horarios',
      module: 'INST',
      parent: 'INST',
      order: 3,
    },
  },
];

export default horariosRoutes;
