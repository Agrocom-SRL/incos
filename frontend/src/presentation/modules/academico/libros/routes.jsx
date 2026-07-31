// src/presentation/modules/academico/libros/routes.jsx
/**
 * Libros de registro del centralizador — módulo de menú propio (ACA-LIBROS),
 * hermano de Centralizador (`order: 2.7`). Flujo de 3 niveles:
 *   P1 listado de libros → P2 ficha del libro (folios) → P3 preview del folio.
 *
 * Permiso `academico.libro` (seed 59, en BD): LISTAR/DETALLE/CREAR/EDITAR/
 * APROBAR/EXPORTAR (sin ELIMINAR — un folio no se borra, se ANULA). Backend en
 * `/api/v1/libros` (schema 25).
 */

import { lazy } from 'react';

const LibrosListConnector = lazy(() => import('./connectors/LibrosListConnector.jsx'));
const LibroDetailConnector = lazy(() => import('./connectors/LibroDetailConnector.jsx'));
const FolioPreviewConnector = lazy(() => import('./connectors/FolioPreviewConnector.jsx'));

export const librosRoutes = [
  {
    // P3 — preview/impresión del folio elegido.
    path: '/academico/libros/:id/folios/:folioId',
    element: <FolioPreviewConnector />,
    key: 'ACA-LIBROS-FOLIO',
    breadcrumbLabel: 'Folio',
    permiso: 'academico.libro',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'ACA-LIBROS-DETALLE',
  },
  {
    // P2 — ficha del libro (cabecera + tabla de folios).
    path: '/academico/libros/:id',
    element: <LibroDetailConnector />,
    key: 'ACA-LIBROS-DETALLE',
    breadcrumbLabel: 'Libro',
    permiso: 'academico.libro',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'ACA-LIBROS',
  },
  {
    // P1 — listado de libros. Ítem de menú propio (hermano de Centralizador).
    path: '/academico/libros',
    element: <LibrosListConnector />,
    key: 'ACA-LIBROS',
    breadcrumbLabel: 'Libros de registro',
    permiso: 'academico.libro',
    accion: 'LISTAR',
    menu: {
      label: 'Libros de registro',
      module: 'ACA',
      parent: 'ACA',
      order: 2.7,
    },
  },
];

export default librosRoutes;
