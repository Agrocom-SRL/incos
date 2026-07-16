// src/presentation/modules/capacitacion/inscripciones/routes.jsx
/**
 * Capacitación → Inscripciones (ítem de menú CAP, order 3).
 *
 * Permisos `capacitacion.inscripcion` (listado/ficha/alta/baja) y
 * `capacitacion.pago` (registrar pago, validado en los controles de la ficha).
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
