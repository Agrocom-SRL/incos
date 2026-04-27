// src/presentation/modules/docentes/routes.jsx
/**
 * Rutas del módulo de Docentes (dominio Docentes).
 */

import { UnderConstruction } from '@components/pages';
import {
  DocentesListConnector,
  DocentesDetailConnector,
  DocentesCreateConnector,
  DocentesEditConnector,
  DocentesAsignacionAcademicaConnector,
} from '@docentes/connectors';

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
    element: <DocentesAsignacionAcademicaConnector />,
    key: 'DOC-ASIGNAR',
    permiso: 'docentes.asignar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'DOC-LIST',
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
];

export default docentesRoutes;
