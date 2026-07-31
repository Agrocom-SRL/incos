// src/presentation/modules/docentes/routes.jsx
/**
 * Rutas del módulo de Docentes (dominio Docentes).
 *
 * Orden: todas las rutas literales (`/docentes/listar`, `/docentes/asignar`, `/docentes/licencias/...`)
 * deben declararse antes de `/docentes/:id` para que React Router no interprete segmentos fijos como `:id`.
 *
 * Los campos `permiso` + `accion` se aplican en `routerFactory` vía `PrivateRoute` (RBAC alineado con seeders).
 */

import { Navigate, useParams } from 'react-router-dom';
import { ofertaPaths } from '@application-institucional/oferta/config/paths';
import { UnderConstruction } from '@components/pages';
import {
  DocentesListConnector,
  DocentesDetailConnector,
  DocentesCreateConnector,
  DocentesEditConnector,
  MiHorarioConnector,
  FichasSeguimientoListConnector,
  FichaSeguimientoFormCreateConnector,
  FichaSeguimientoFormEditConnector,
  FichaSeguimientoDetailConnector,
} from '@docentes/connectors';
import {
  SUPERVISION_LIST_PATH,
  fichaSeguimientoRegistrarPath,
  SUPERVISION_FICHA_PERMISO,
} from '@application-docentes/supervision/config/paths';

const DocenteAsignacionesLegacyRedirect = () => {
  const { id } = useParams();
  return <Navigate to={ofertaPaths.docenteAsignaciones(id)} replace />;
};

export const docentesRoutes = [
  {
    path: '/docentes/listar',
    element: <DocentesListConnector />,
    key: 'DOC-LIST',
    permiso: 'docentes.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Docentes',
      module: 'DOC',
      parent: 'DOC',
      order: 1,
      labelByRole: { DOCENTE: 'Mi ficha' },
    },
  },
  {
    path: '/docentes/registrar',
    element: <DocentesCreateConnector />,
    key: 'DOC-CREATE',
    permiso: 'docentes.crear',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'DOC-LIST',
  },
  {
    path: '/docentes/asignar',
    element: <Navigate to="/institucional/oferta" replace />,
    key: 'DOC-ASIGNAR-LEGACY',
    menu: null,
  },
  {
    path: '/docentes/licencias/listar',
    element: <UnderConstruction />,
    key: 'DOC-LIC',
    permiso: 'docentes.licencia.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Licencias docentes',
      module: 'DOC',
      parent: 'DOC',
      order: 2,
    },
  },
  {
    path: '/docentes/licencias/solicitar',
    element: <UnderConstruction />,
    key: 'DOC-LIC-SOLICITAR',
    permiso: 'docentes.licencia.crear',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'DOC-LIC',
  },
  {
    path: '/docentes/licencias/aprobar',
    element: <UnderConstruction />,
    key: 'DOC-LIC-APROBAR',
    permiso: 'docentes.licencia.aprobar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'DOC-LIC',
  },
  {
    // Portal del docente: calendario semanal propio (identidad resuelta en servidor).
    // Ruta literal ANTES de `/docentes/:id` para que React Router no la capture como id.
    path: '/docentes/mi-horario',
    element: <MiHorarioConnector />,
    key: 'DOC-MI-HORARIO',
    permiso: 'docentes.ver',
    accion: 'LISTAR',
    menu: null,
  },
  {
    // Supervisión docente: rutas literales ANTES de `/docentes/:id` (crítico,
    // si no `/docentes/supervision` matchea como si fuera un `:id`).
    path: fichaSeguimientoRegistrarPath,
    element: <FichaSeguimientoFormCreateConnector />,
    key: 'DOC-SUPERVISION-REGISTRAR',
    permiso: SUPERVISION_FICHA_PERMISO,
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'DOC-SUPERVISION',
  },
  {
    path: `${SUPERVISION_LIST_PATH}/:id/editar`,
    element: <FichaSeguimientoFormEditConnector />,
    key: 'DOC-SUPERVISION-EDITAR',
    permiso: SUPERVISION_FICHA_PERMISO,
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'DOC-SUPERVISION',
  },
  {
    path: `${SUPERVISION_LIST_PATH}/:id`,
    element: <FichaSeguimientoDetailConnector />,
    key: 'DOC-SUPERVISION-DETALLE',
    permiso: SUPERVISION_FICHA_PERMISO,
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'DOC-SUPERVISION',
  },
  {
    path: SUPERVISION_LIST_PATH,
    element: <FichasSeguimientoListConnector />,
    key: 'DOC-SUPERVISION',
    permiso: SUPERVISION_FICHA_PERMISO,
    accion: 'LISTAR',
    menu: {
      label: 'Supervisión docente',
      module: 'DOC',
      parent: 'DOC',
      order: 3,
    },
  },
  {
    path: '/docentes/:id/asignaciones',
    element: <DocenteAsignacionesLegacyRedirect />,
    key: 'DOC-ASIGNACIONES-LEGACY',
    menu: null,
  },
  {
    path: '/docentes/:id/editar',
    element: <DocentesEditConnector />,
    key: 'DOC-EDIT',
    permiso: 'docentes.editar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'DOC-LIST',
  },
  {
    path: '/docentes/:id',
    element: <DocentesDetailConnector />,
    key: 'DOC-DETAIL',
    permiso: 'docentes.ver',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'DOC-LIST',
  },
];

export default docentesRoutes;
