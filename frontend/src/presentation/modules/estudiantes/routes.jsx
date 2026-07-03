// src/presentation/modules/estudiantes/routes.jsx
/**
 * Rutas de admisión, becas y documentos (MAT). Licencias de estudiante: keys ACA-* (menú Académico).
 * Ítems de sidebar MAT: menu.parent = 'MAT' (sin padres intermedios MAT-* que generen sub-submenús).
 */

import { UnderConstruction } from '@components/pages';
import {
  ListConnector,
  RegisterConnector,
  DetailConnector,
  EditConnector,
  AsignarBecaConnector,
  BecasAsignarSeleccionConnector,
  BecasListConnector,
  BecaAsignacionDetailConnector,
} from '@estudiantes/connectors';

export const estudiantesRoutes = [
  {
    path: '/estudiantes/listar',
    element: <ListConnector />,
    key: 'MAT-ADMISION',
    permiso: 'matricula.admision.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Admisión',
      module: 'MAT',
      parent: 'MAT',
      order: 2,
      labelByRole: { ESTUDIANTE: 'Mis datos' },
    },
  },
  {
    path: '/estudiantes/registrar',
    element: <RegisterConnector />,
    key: 'MAT-ADM-NUEVA',
    permiso: 'matricula.admision.crear',
    accion: 'CREAR',
    menu: {
      label: 'Nuevo estudiante',
      module: 'MAT',
      parent: 'MAT',
      order: 1,
      tipo: 'ACCION_DIRECTA',
    },
  },
  {
    path: '/pasantias/listar',
    element: <UnderConstruction />,
    key: 'MAT-PAS-LISTA',
    permiso: 'matricula.pasantia.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Pasantías',
      module: 'MAT',
      parent: 'MAT',
      order: 6,
      labelByRole: { ESTUDIANTE: 'Mi pasantía' },
    },
  },
  {
    path: '/estudiantes/becas/listar',
    element: <BecasListConnector />,
    key: 'MAT-BEC-LISTAR',
    permiso: 'matricula.beca.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Becas',
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
  {
    path: '/estudiantes/:id/editar',
    element: <EditConnector />,
    key: 'MAT-ADM-EDITAR',
    permiso: 'matricula.admision.editar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'MAT-ADMISION',
  },
  {
    path: '/estudiantes/:id',
    element: <DetailConnector />,
    key: 'MAT-ADM-DETALLE',
    // Rama docente self: el DOCENTE llega con `estudiantes.ver` DETALLE a la
    // ficha de SUS estudiantes (roster del dashboard); el backend restringe por
    // asignación. El staff sigue entrando con `matricula.admision.ver`.
    permisoAny: ['matricula.admision.ver', 'estudiantes.ver'],
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'MAT-ADMISION',
  },
  {
    path: '/estudiantes/documentos',
    element: <UnderConstruction />,
    key: 'MAT-DOCUMENTOS',
    permiso: 'matricula.documento.ver',
    accion: 'GENERAR_PDF',
    menu: null,
    breadcrumbParent: 'MAT-ADMISION',
  },
  {
    path: '/pasantias/solicitar',
    element: <UnderConstruction />,
    key: 'MAT-PAS-SOLICITAR',
    permiso: 'matricula.pasantia.solicitar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'MAT-PAS-LISTA',
  },
  {
    path: '/pasantias/:id/editar',
    element: <UnderConstruction />,
    key: 'MAT-PAS-EDITAR',
    permiso: 'matricula.pasantia.evaluar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'MAT-PAS-LISTA',
  },
  {
    path: '/pasantias/:id',
    element: <UnderConstruction />,
    key: 'MAT-PAS-DETALLE',
    permiso: 'matricula.pasantia.ver',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'MAT-PAS-LISTA',
  },
];

export default estudiantesRoutes;
