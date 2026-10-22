// src/presentation/modules/capacitacion/inscripciones/routes.jsx
/**
 * Capacitación → Inscripciones (ítem de menú CAP, order 3).
 *
 * Permisos `capacitacion.inscripcion` (listado/ficha/alta/baja) y
 * `capacitacion.pago` (registrar pago, validado en los controles de la ficha);
 * editar un pago usa `capacitacion.inscripcion EDITAR`.
 * Rutas estáticas ANTES de `/:id`; la ruta con menú va al final.
 */

import { lazy } from 'react';

const InscripcionesCapacitacionListConnector = lazy(
  () => import('./connectors/InscripcionesCapacitacionListConnector.jsx'),
);
const InscribirParticipanteConnector = lazy(
  () => import('./connectors/InscribirParticipanteConnector.jsx'),
);
const InscripcionCapacitacionDetailConnector = lazy(
  () => import('./connectors/InscripcionCapacitacionDetailConnector.jsx'),
);
const InscripcionCapRegistrarPagoConnector = lazy(
  () => import('./connectors/InscripcionCapRegistrarPagoConnector.jsx'),
);

const InscripcionCapEditarPagoConnector = lazy(
  () => import('./connectors/InscripcionCapEditarPagoConnector.jsx'),
);

const InscripcionCapEditarConnector = lazy(
  () => import('./connectors/InscripcionCapEditarConnector.jsx'),
);

export const capacitacionInscripcionesRoutes = [
  {
    path: '/capacitacion/inscripciones/inscribir',
    element: <InscribirParticipanteConnector />,
    key: 'CAP-INSCRIPCIONES-INSCRIBIR',
    breadcrumbLabel: 'Inscribir participante',
    permiso: 'capacitacion.inscripcion',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CAP-INSCRIPCIONES',
  },
  {
    path: '/capacitacion/inscripciones/:id/editar',
    element: <InscripcionCapEditarConnector />,
    key: 'CAP-INSCRIPCIONES-EDITAR',
    breadcrumbLabel: 'Editar inscripción',
    permiso: 'capacitacion.inscripcion',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CAP-INSCRIPCIONES-DETALLE',
  },
  {
    path: '/capacitacion/inscripciones/:id/pagos/registrar',
    element: <InscripcionCapRegistrarPagoConnector />,
    key: 'CAP-INSCRIPCIONES-PAGO-REGISTRAR',
    breadcrumbLabel: 'Registrar pago',
    permiso: 'capacitacion.pago',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'CAP-INSCRIPCIONES-DETALLE',
  },
  {
    path: '/capacitacion/inscripciones/:id/pagos/:pagoId/editar',
    element: <InscripcionCapEditarPagoConnector />,
    key: 'CAP-INSCRIPCIONES-PAGO-EDITAR',
    breadcrumbLabel: 'Editar pago',
    permiso: 'capacitacion.inscripcion',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'CAP-INSCRIPCIONES-DETALLE',
  },
  {
    path: '/capacitacion/inscripciones/:id',
    element: <InscripcionCapacitacionDetailConnector />,
    key: 'CAP-INSCRIPCIONES-DETALLE',
    breadcrumbLabel: 'Detalle de inscripción',
    permiso: 'capacitacion.inscripcion',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'CAP-INSCRIPCIONES',
  },
  {
    path: '/capacitacion/inscripciones',
    element: <InscripcionesCapacitacionListConnector />,
    key: 'CAP-INSCRIPCIONES',
    permiso: 'capacitacion.inscripcion',
    accion: 'LISTAR',
    menu: {
      label: 'Inscripciones',
      module: 'CAP',
      parent: 'CAP',
      order: 3,
    },
  },
];

export default capacitacionInscripcionesRoutes;
