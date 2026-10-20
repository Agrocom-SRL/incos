// src/presentation/modules/matricula/becas/routes.jsx
/**
 * Matrícula → Becas y descuentos (ítem de menú MAT "Becas y descuentos", más
 * el flujo de asignación en 3 pasos: elegir estudiante → asignar → detalle).
 *
 * Mismos `path`/`permiso`/`accion` que antes de la reorganización — sin
 * cambios de URL. `MAT-DOCUMENTOS` vive en `@matricula/admision/routes.jsx`
 * (placeholder `UnderConstruction`, aún sin construir).
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';

const AsignarBecaConnector = lazy(() => import('./connectors/AsignarBecaConnector.jsx'));
const BecasAsignarSeleccionConnector = lazy(() => import('./connectors/BecasAsignarSeleccionConnector.jsx'));
const BecasListConnector = lazy(() => import('./connectors/BecasListConnector.jsx'));
const BecaAsignacionDetailConnector = lazy(() => import('./connectors/BecaAsignacionDetailConnector.jsx'));

export const matriculaBecasRoutes = [
  {
    path: '/estudiantes/becas/listar',
    element: <BecasListConnector />,
    key: 'MAT-BEC-LISTAR',
    permiso: 'matricula.beca.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Becas y descuentos',
      module: 'MAT',
      parent: 'MAT',
      order: 5,
      labelByRole: { ESTUDIANTE: 'Mi beca' },
    },
  },
  {
    path: '/estudiantes/becas/asignacion/:id',
    element: <BecaAsignacionDetailConnector />,
    key: 'MAT-BEC-ASIG-DET',
    permiso: 'matricula.beca.ver',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'MAT-BEC-LISTAR',
  },
  {
    path: '/estudiantes/becas/asignar/seleccionar-estudiante',
    element: <BecasAsignarSeleccionConnector />,
    key: 'MAT-BEC-SEL-EST',
    permiso: 'matricula.beca.asignar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'MAT-BEC-LISTAR',
  },
  {
    path: '/estudiantes/becas/asignar',
    element: <AsignarBecaConnector />,
    key: 'MAT-BEC-ASIGNAR',
    permiso: 'matricula.beca.asignar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'MAT-BEC-LISTAR',
  },
  {
    path: '/estudiantes/becas/aprobar',
    element: <UnderConstruction />,
    key: 'MAT-BEC-APROBAR',
    permiso: 'matricula.beca.aprobar',
    accion: 'APROBAR',
    menu: null,
    breadcrumbParent: 'MAT-BEC-LISTAR',
  },
];

export default matriculaBecasRoutes;
