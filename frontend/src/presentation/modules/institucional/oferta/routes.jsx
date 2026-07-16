/**
 * Institucional → Oferta académica
 *
 *   /institucional/oferta                                    → dashboard
 *   /institucional/oferta/gestiones/:gestionId/planes        → tabs por plan
 *   /institucional/oferta/gestiones/.../paralelos            → legacy → ?plan=
 *   /institucional/oferta/paralelo/:paraleloGestionId        → detalle
 */

import { lazy } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { UnderConstruction } from '@components/pages';
import { ofertaPaths } from '@application-institucional/oferta';

const INST_OFERTA_ACADEMICA_PERMISOS = [
  'institucional.oferta.gestion-plan',
  'institucional.oferta.paralelo-gestion',
  'institucional.oferta.cursos',
];

const OfertaDashboardConnector = lazy(
  () => import('@institucional/oferta/connectors/OfertaDashboardConnector'),
);
const OfertaGestionPlanesConnector = lazy(
  () => import('@institucional/oferta/connectors/OfertaGestionPlanesConnector'),
);
const OfertaParaleloDetalleConnector = lazy(
  () => import('@institucional/oferta/connectors/OfertaParaleloDetalleConnector'),
);
const DocenteAsignacionesConnector = lazy(
  () => import('@institucional/oferta/connectors/DocenteAsignacionesConnector'),
);
const RenovarOfertaConnector = lazy(
  () => import('@institucional/oferta/connectors/RenovarOfertaConnector'),
);
const GestionFormConnector = lazy(
  () => import('@institucional/oferta/connectors/GestionFormConnector'),
);

/** Ruta legacy …/planes/:gestionPlanId/paralelos → resumen por tabs (?plan=). */
function OfertaParalelosLegacyRedirect() {
  const { gestionId, gestionPlanId } = useParams();
  return (
    <Navigate to={ofertaPaths.gestionPlanesConPlan(gestionId, gestionPlanId)} replace />
  );
}

export const ofertaRoutes = [
  // Estática ANTES de las rutas /gestiones/:gestionId/* para que el router no
  // capture «nueva» como id de gestión.
  {
    path: '/institucional/oferta/gestiones/nueva',
    element: <GestionFormConnector />,
    key: 'INST-OFERTA-GESTION-NUEVA',
    permiso: 'institucional.oferta.gestion-plan',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'INST-OFERTA-ACADEMICA',
  },
  {
    path: '/institucional/oferta/gestiones/:gestionId/editar',
    element: <GestionFormConnector mode="edit" />,
    key: 'INST-OFERTA-GESTION-EDITAR',
    permiso: 'institucional.oferta.gestion-plan',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'INST-OFERTA-ACADEMICA',
  },
  {
    path: '/institucional/oferta/gestiones/:gestionId/planes/:gestionPlanId/paralelos',
    element: <OfertaParalelosLegacyRedirect />,
    key: 'INST-OFERTA-PARALELOS-LEGACY',
    permisoAny: INST_OFERTA_ACADEMICA_PERMISOS,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'INST-OFERTA-ACADEMICA',
  },
  {
    path: '/institucional/oferta/gestiones/:gestionId/planes',
    element: <OfertaGestionPlanesConnector />,
    key: 'INST-OFERTA-GESTION-PLANES',
    permisoAny: INST_OFERTA_ACADEMICA_PERMISOS,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'INST-OFERTA-ACADEMICA',
  },
  {
    path: '/institucional/oferta/gestiones',
    element: <Navigate to="/institucional/pasadas" replace />,
    key: 'INST-OFERTA-GESTIONES-REDIRECT',
    menu: null,
  },
  {
    path: '/institucional/oferta/renovar',
    element: <RenovarOfertaConnector />,
    key: 'INST-OFERTA-RENOVAR',
    permiso: 'institucional.oferta.gestion-plan',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'INST-OFERTA-ACADEMICA',
  },
  {
    path: '/institucional/oferta/paralelo/:paraleloGestionId',
    element: <OfertaParaleloDetalleConnector />,
    key: 'INST-OFERTA-PARALELO-DETALLE',
    permiso: 'institucional.oferta.paralelo-gestion',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'INST-OFERTA-ACADEMICA',
  },
  {
    path: '/institucional/oferta/docente/:docenteId/asignaciones',
    element: <DocenteAsignacionesConnector />,
    key: 'INST-OFERTA-DOCENTE-ASIGNACIONES',
    // Rama docente self: el DOCENTE entra con `docentes.ver` a SUS asignaciones
    // (el backend restringe los datos a su propio id); la edición (color) queda
    // fail-closed tras `docentes.editar` en la UI.
    permisoAny: [...INST_OFERTA_ACADEMICA_PERMISOS, 'docentes.ver'],
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'INST-OFERTA-ACADEMICA',
  },
  {
    path: '/institucional/oferta/inscribir',
    element: <UnderConstruction />,
    key: 'INST-OFERTA-MAT-INSCRIBIR',
    permiso: 'institucional.oferta.gestionar',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'INST-OFERTA-ACADEMICA',
  },
  {
    path: '/institucional/oferta/curso',
    element: <UnderConstruction />,
    key: 'INST-OFERTA-MAT-CURSO',
    permiso: 'institucional.oferta.gestionar',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'INST-OFERTA-ACADEMICA',
  },
  {
    path: '/institucional/oferta-academica',
    element: <Navigate to="/institucional/oferta" replace />,
    key: 'INST-OFERTA-LEGACY-REDIRECT',
    menu: null,
  },
  {
    path: '/institucional/oferta/wizard',
    element: <Navigate to="/institucional/oferta" replace />,
    key: 'INST-OFERTA-WIZARD-REDIRECT',
    menu: null,
  },
  {
    path: '/institucional/oferta',
    element: <OfertaDashboardConnector />,
    key: 'INST-OFERTA-ACADEMICA',
    // Rama docente self: el DOCENTE entra con `docentes.ver` y el connector lo
    // redirige a SUS asignaciones (DocenteAsignacionesPage, solo lectura); el
    // staff sigue entrando con los permisos de oferta.
    permisoAny: [...INST_OFERTA_ACADEMICA_PERMISOS, 'docentes.ver'],
    accion: 'LISTAR',
    menu: {
      label: 'Oferta académica',
      module: 'INST',
      parent: 'INST',
      order: 2,
      labelByRole: { DOCENTE: 'Mis asignaciones' },
    },
  },
];

export default ofertaRoutes;
