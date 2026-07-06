/**
 * Documentación — 4 pantallas independientes (inscripción/becas/pasantías/
 * traslado), UN modelo/endpoint compartido filtrado por `tipoDocumento`.
 *
 *   /configuracion/documentacion                          → entrada de menú (landingStack → 1ra lista con permiso)
 *   /configuracion/documentacion/inscripcion               → listado
 *   /configuracion/documentacion/inscripcion/nueva         → crear
 *   /configuracion/documentacion/inscripcion/:id/editar    → editar
 *   /configuracion/documentacion/inscripcion/:id           → detalle
 *   /configuracion/documentacion/{becas|pasantias|traslado}/... → análogo
 *
 * Decisión de reutilización (evitar 12 archivos casi idénticos): 1 form-page
 * compartida (`DocumentacionFormPage`) + 1 detail-page compartida
 * (`DocumentacionDetailPage`) + 1 list-page compartida
 * (`DocumentacionListPage`), todas parametrizadas por `tipoConfig`
 * (`@application-configuracion/documentacion/config/tipos`). Los conectores de
 * alta/edición/detalle son genéricos (`tipoKey` como prop); solo el LISTADO
 * mantiene 4 archivos de página nombrados (pedido explícito, más claros en
 * breadcrumbs/lazy-loading), pero delegan en el mismo `DocumentacionListConnector`.
 */

import { lazy } from 'react';
import ModuleEntryConnector from '@navigation/components/ModuleEntryConnector.jsx';
import { DOCUMENTACION_TIPOS } from '@application-configuracion/documentacion/config/tipos';
import { DOCUMENTACION_BASE, documentacionListPath } from '@application-configuracion/documentacion/config/paths';

const DocumentacionInscripcionList = lazy(
  () => import('@configuracion/documentacion/pages/DocumentacionInscripcionList.jsx'),
);
const DocumentacionBecasList = lazy(
  () => import('@configuracion/documentacion/pages/DocumentacionBecasList.jsx'),
);
const DocumentacionPasantiasList = lazy(
  () => import('@configuracion/documentacion/pages/DocumentacionPasantiasList.jsx'),
);
const DocumentacionTrasladoList = lazy(
  () => import('@configuracion/documentacion/pages/DocumentacionTrasladoList.jsx'),
);
const DocumentacionFormCreateConnector = lazy(
  () => import('@configuracion/documentacion/connectors/DocumentacionFormCreateConnector.jsx'),
);
const DocumentacionFormEditConnector = lazy(
  () => import('@configuracion/documentacion/connectors/DocumentacionFormEditConnector.jsx'),
);
const DocumentacionDetailConnector = lazy(
  () => import('@configuracion/documentacion/connectors/DocumentacionDetailConnector.jsx'),
);

const LIST_CONNECTOR_BY_TIPO = {
  inscripcion: DocumentacionInscripcionList,
  becas: DocumentacionBecasList,
  pasantias: DocumentacionPasantiasList,
  traslado: DocumentacionTrasladoList,
};

const CFG_DOCUMENTACION_PERMISOS = Object.values(DOCUMENTACION_TIPOS).map((t) => t.permisoCodigo);

/** Rutas nueva/:id/editar/:id + listado por cada tipo (mismos conectores genéricos). */
const rutasPorTipo = Object.values(DOCUMENTACION_TIPOS).flatMap(({ tipoKey, permisoCodigo, label }) => {
  const ListConnector = LIST_CONNECTOR_BY_TIPO[tipoKey];
  const keyBase = `CFG-DOCUMENTACION-${tipoKey.toUpperCase()}`;
  return [
    {
      path: documentacionListPath(tipoKey),
      element: <ListConnector />,
      key: keyBase,
      permiso: permisoCodigo,
      accion: 'LISTAR',
      menu: null,
      breadcrumbParent: 'CFG-DOCUMENTACION',
    },
    {
      path: `${documentacionListPath(tipoKey)}/nueva`,
      element: <DocumentacionFormCreateConnector tipoKey={tipoKey} />,
      key: `${keyBase}-NUEVA`,
      permiso: permisoCodigo,
      accion: 'CREAR',
      menu: null,
      breadcrumbParent: keyBase,
      breadcrumbLabel: `Nuevo documento (${label})`,
    },
    {
      path: `${documentacionListPath(tipoKey)}/:id/editar`,
      element: <DocumentacionFormEditConnector tipoKey={tipoKey} />,
      key: `${keyBase}-EDITAR`,
      permiso: permisoCodigo,
      accion: 'EDITAR',
      menu: null,
      breadcrumbParent: keyBase,
      breadcrumbLabel: `Editar documento (${label})`,
    },
    {
      path: `${documentacionListPath(tipoKey)}/:id`,
      element: <DocumentacionDetailConnector tipoKey={tipoKey} />,
      key: `${keyBase}-DETALLE`,
      permiso: permisoCodigo,
      accion: 'DETALLE',
      menu: null,
      breadcrumbParent: keyBase,
      breadcrumbLabel: `Detalle de documento (${label})`,
    },
  ];
});

export const documentacionRoutes = [
  ...rutasPorTipo,
  {
    path: DOCUMENTACION_BASE,
    element: <ModuleEntryConnector menuKey="CFG-DOCUMENTACION" fallbackPath="/configuracion" />,
    key: 'CFG-DOCUMENTACION',
    permiso: null,
    permisoAny: CFG_DOCUMENTACION_PERMISOS,
    accion: 'LISTAR',
    menu: {
      label: 'Documentación',
      module: 'CFG',
      parent: 'CFG',
      order: 2,
      /** Entrada de menú → primera lista con permiso (inscripción, becas, pasantías, traslado). */
      landingStack: Object.values(DOCUMENTACION_TIPOS).map(({ permisoCodigo, tipoKey }) => ({
        permiso: permisoCodigo,
        accion: 'LISTAR',
        redirectTo: documentacionListPath(tipoKey),
      })),
    },
  },
];

export default documentacionRoutes;
