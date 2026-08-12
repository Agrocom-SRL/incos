// src/presentation/modules/matricula/registro/routes.jsx
/**
 * Matrícula → Registro (ítem de menú MAT "Registro de matrículas": inscripción
 * a materias por gestión, permiso `matricula.inscribir`).
 * URLs canónicas: /matricula/*; /inscripciones/* redirigen por compatibilidad.
 * Mismos `path`/`key`/`permiso`/`accion`/`menu` que antes de la reorganización —
 * sin cambios de URL. Admisión (Nuevo estudiante) vive en `../admision/routes.jsx`.
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { UnderConstruction } from '@components/pages';

const MatriculaNuevaConnector = lazy(() => import('./connectors/InscripcionesNuevaConnector'));
const MatriculaEditarConnector = lazy(() => import('./connectors/InscripcionesEditarConnector'));
const MatriculaDetailConnector = lazy(() => import('./connectors/DetailConnector'));
const MatriculaListConnector = lazy(() => import('./connectors/ListConnector'));

export const matriculaRegistroRoutes = [
  {
    path: '/matricula/listar',
    element: <MatriculaListConnector />,
    key: 'MAT-LISTA',
    // Rama docente self: el DOCENTE entra con `docentes.ver` y el connector le
    // monta "Mis estudiantes" (roster de SUS cursos; el backend restringe por
    // asignación). El staff sigue entrando con `matricula.inscribir`.
    permisoAny: ['matricula.inscribir', 'docentes.ver'],
    accion: 'LISTAR',
    menu: {
      label: 'Registro de matrículas',
      module: 'MAT',
      parent: 'MAT',
      order: 3,
      labelByRole: { ESTUDIANTE: 'Mi matrícula', DOCENTE: 'Mis estudiantes' },
    },
  },
  {
    path: '/matricula/nueva',
    element: <MatriculaNuevaConnector />,
    key: 'MAT-NUEVA',
    permiso: 'matricula.inscribir',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'MAT-LISTA',
  },
  {
    path: '/inscripciones',
    element: <Navigate to="/matricula/listar" replace />,
    key: 'MAT-INS-REDIRECT-ROOT',
    menu: null,
  },
  {
    path: '/inscripciones/listar',
    element: <Navigate to="/matricula/listar" replace />,
    key: 'MAT-INS-REDIRECT-LIST',
    menu: null,
  },
  {
    path: '/inscripciones/nueva',
    element: <Navigate to="/matricula/nueva" replace />,
    key: 'MAT-INS-REDIRECT-NUEVA',
    menu: null,
  },
  {
    path: '/inscripciones/materias/validar',
    element: <UnderConstruction />,
    key: 'GES-MAT-VALIDAR',
    permiso: 'institucional.oferta.gestionar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'GES',
  },
  {
    path: '/inscripciones/:id',
    element: <MatriculaDetailConnector />,
    key: 'MAT-INS-DETALLE',
    permiso: 'matricula.inscribir',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'MAT-LISTA',
  },
  {
    path: '/inscripciones/:id/editar',
    element: <MatriculaEditarConnector />,
    key: 'MAT-INS-EDITAR',
    permiso: 'matricula.inscripcion.editar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'MAT-LISTA',
  },
];

export default matriculaRegistroRoutes;
