// src/presentation/modules/finanzas/reportes/routes.jsx
/**
 * Finanzas → Reportes de pagos (ítem de menú FIN, order 3).
 *
 * Un solo ítem de menú con varias páginas (todas menu: null salvo la entrada):
 *   por carrera · por estudiante · por gestión · Cuentas por cobrar (planilla,
 *   imagen 1) · Becas por carrera (planilla, imagen 2).
 *
 * Permisos del seed 60-FIN:
 *   finanzas.pago.reporte.{carrera,estudiante,gestion} (reportes de pagos),
 *   finanzas.cuenta-cobrar.reporte (planilla de cuentas por cobrar),
 *   finanzas.beca.reporte (planilla de becas por carrera).
 * Estos dos últimos se siembran en paralelo (seed 60-FIN, refs por código).
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';

const BecasReporteConnector = lazy(() => import('./connectors/BecasReporteConnector.jsx'));
const CuentasPorCobrarConnector = lazy(() =>
  import('./connectors/CuentasPorCobrarConnector.jsx'),
);
const ReportesHubPage = lazy(() => import('./pages/ReportesHubPage.jsx'));

export const finanzasReportesRoutes = [
  {
    path: '/finanzas/reportes/carrera',
    element: <UnderConstruction />,
    key: 'FIN-REP-CARRERA',
    breadcrumbLabel: 'Reporte por carrera',
    permiso: FINANZAS_PERMISOS.reporteCarrera,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-REP',
  },
  {
    path: '/finanzas/reportes/estudiante',
    element: <UnderConstruction />,
    key: 'FIN-REP-ESTUDIANTE',
    breadcrumbLabel: 'Reporte por estudiante',
    permiso: FINANZAS_PERMISOS.reporteEstudiante,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-REP',
  },
  {
    path: '/finanzas/reportes/gestion',
    element: <UnderConstruction />,
    key: 'FIN-REP-GESTION',
    breadcrumbLabel: 'Reporte por gestión',
    permiso: FINANZAS_PERMISOS.reporteGestion,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-REP',
  },
  {
    path: '/finanzas/reportes/cuentas-por-cobrar',
    element: <CuentasPorCobrarConnector />,
    key: 'FIN-REP-CUENTAS-COBRAR',
    breadcrumbLabel: 'Cuentas por cobrar',
    permiso: FINANZAS_PERMISOS.cuentaCobrarReporte,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-REP',
  },
  {
    path: '/finanzas/reportes/becas',
    element: <BecasReporteConnector />,
    key: 'FIN-REP-BECAS',
    breadcrumbLabel: 'Becas por carrera',
    permiso: FINANZAS_PERMISOS.becaReporte,
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-REP',
  },
  {
    path: '/finanzas/reportes',
    element: <ReportesHubPage />,
    key: 'FIN-REP',
    permiso: FINANZAS_PERMISOS.reporteCarrera,
    accion: 'LISTAR',
    menu: {
      label: 'Reportes de pagos',
      module: 'FIN',
      parent: 'FIN',
      order: 3,
    },
  },
];

export default finanzasReportesRoutes;
