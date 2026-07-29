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
  // Pasantías: retiradas de MAT 2026-07-29 — el dominio pasa al módulo
  // Titulación (TUT) sobre el schema 24 (docs/plan/titulacion-y-dominios-pendientes.md).
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
    // El DOCENTE también entra aquí (ficha SOLO LECTURA de SUS estudiantes desde
    // "Mis estudiantes"): tiene `matricula.admision.ver` DETALLE sin LISTAR; el
    // backend restringe por asignación.
    permiso: 'matricula.admision.ver',
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
];

export default estudiantesRoutes;
