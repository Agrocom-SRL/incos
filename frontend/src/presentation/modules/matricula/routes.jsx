// src/presentation/modules/matricula/routes.jsx
/**
 * Rutas del dominio Matrícula (sidebar MAT, junto a Admisión/Becas en estudiantes).
 * URLs canónicas: /matricula/*; /inscripciones/* redirigen por compatibilidad.
 */

import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { UnderConstruction } from '@components/pages';

const MatriculaNuevaConnector = lazy(() => import('./connectors/InscripcionesNuevaConnector'));
const MatriculaEditarConnector = lazy(() => import('./connectors/InscripcionesEditarConnector'));
const MatriculaDetailConnector = lazy(() => import('./connectors/DetailConnector'));
const MatriculaListConnector = lazy(() => import('./connectors/ListConnector'));

export const matriculaRoutes = [
  {
    path: '/matricula/listar',
    element: <MatriculaListConnector />,
    key: 'MAT-LISTA',
    permiso: 'matricula.inscribir',
    accion: 'LISTAR',
    menu: {
      label: 'Matrículas',
      module: 'MAT',
      parent: 'MAT',
      order: 3,
      labelByRole: { ESTUDIANTE: 'Mi matrícula' },
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

export default matriculaRoutes;
