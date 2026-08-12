// src/presentation/modules/matricula/nuevo/routes.jsx
/**
 * Matrícula → Nuevo estudiante (ítem de menú MAT propio, distinto de "Proceso
 * de admisión"). Alta y edición: único componente `EstudiantesRegister.jsx`,
 * envuelto por `RegisterConnector`/`EditConnector` con sus Providers propios.
 *
 * `RegisterConnector`/`EditConnector` cruzan hacia `matricula/admision/` para
 * `StudentProvider`/`StudentDetailProvider` (compartidos con Proceso de
 * admisión); ver comentario en cada connector. Mismos `path`/`permiso`/`accion`
 * que antes de separar esta carpeta — sin cambios de URL.
 */

import { lazy } from 'react';

const RegisterConnector = lazy(() => import('./connectors/RegisterConnector.jsx'));
const EditConnector = lazy(() => import('./connectors/EditConnector.jsx'));

export const estudiantesNuevoRoutes = [
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
    path: '/estudiantes/:id/editar',
    element: <EditConnector />,
    key: 'MAT-ADM-EDITAR',
    permiso: 'matricula.admision.editar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'MAT-ADMISION',
  },
];

export default estudiantesNuevoRoutes;
