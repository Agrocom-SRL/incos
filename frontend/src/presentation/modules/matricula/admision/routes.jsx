// src/presentation/modules/matricula/admision/routes.jsx
/**
 * Matrícula → Admisión (ítem de menú MAT "Proceso de admisión": listado +
 * ficha de detalle; "Nuevo estudiante" — alta/edición — vive en su propio
 * `matricula/nuevo/routes.jsx`, ver también `EstudianteAdmisionRedirect`).
 *
 * Listado/detalle: `EstudiantesList.jsx`/`EstudiantesDetail.jsx`, envueltos por
 * `ListConnector`/`DetailConnector`. Mismos `path`/`permiso`/`accion` que antes
 * de la reorganización — sin cambios de URL. `MAT-DOCUMENTOS` (placeholder
 * `UnderConstruction`, aún sin construir) también vive aquí — es el último
 * remanente de `presentation/modules/estudiantes/`, ya consolidado.
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';

const ListConnector = lazy(() => import('./connectors/ListConnector.jsx'));
const DetailConnector = lazy(() => import('./connectors/DetailConnector.jsx'));

export const estudiantesAdmisionRoutes = [
  {
    path: '/estudiantes/listar',
    element: <ListConnector />,
    key: 'MAT-ADMISION',
    permiso: 'matricula.admision.ver',
    accion: 'LISTAR',
    menu: {
      label: 'Proceso de admisión',
      module: 'MAT',
      parent: 'MAT',
      order: 2,
      labelByRole: { ESTUDIANTE: 'Mis datos' },
    },
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

export default estudiantesAdmisionRoutes;
