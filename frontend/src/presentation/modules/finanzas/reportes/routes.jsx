// src/presentation/modules/finanzas/reportes/routes.jsx
/**
 * Finanzas → Reportes de pagos (ítem de menú FIN, order 3).
 *
 * Un solo ítem de menú con varias páginas (todas menu: null salvo la entrada):
 *   por carrera · por estudiante · por gestión · Cuentas por cobrar (planilla,
 *   imagen 1) · Becas por carrera (planilla, imagen 2).
 *
 * Placeholders en Fase 1. Permisos reutilizados del seed 60-FIN:
 *   finanzas.pago.reporte.{carrera,estudiante,gestion}.
 */

import { lazy } from 'react';
import { UnderConstruction } from '@components/pages';

const BecasReporteConnector = lazy(() => import('./connectors/BecasReporteConnector.jsx'));
const CuentasPorCobrarConnector = lazy(() =>
  import('./connectors/CuentasPorCobrarConnector.jsx'),
);

export const finanzasReportesRoutes = [
  {
    path: '/finanzas/reportes/carrera',
    element: <UnderConstruction />,
    key: 'FIN-REP-CARRERA',
    breadcrumbLabel: 'Reporte por carrera',
    permiso: 'finanzas.pago.reporte.carrera',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-REP',
  },
  {
    path: '/finanzas/reportes/estudiante',
    element: <UnderConstruction />,
    key: 'FIN-REP-ESTUDIANTE',
    breadcrumbLabel: 'Reporte por estudiante',
    permiso: 'finanzas.pago.reporte.estudiante',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-REP',
  },
  {
    path: '/finanzas/reportes/gestion',
    element: <UnderConstruction />,
    key: 'FIN-REP-GESTION',
    breadcrumbLabel: 'Reporte por gestión',
    permiso: 'finanzas.pago.reporte.gestion',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-REP',
  },
  {
    path: '/finanzas/reportes/cuentas-por-cobrar',
    element: <CuentasPorCobrarConnector />,
    key: 'FIN-REP-CUENTAS-COBRAR',
    breadcrumbLabel: 'Cuentas por cobrar',
    permiso: 'finanzas.pago.reporte.carrera',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-REP',
  },
  {
    path: '/finanzas/reportes/becas',
    element: <BecasReporteConnector />,
    key: 'FIN-REP-BECAS',
    breadcrumbLabel: 'Becas por carrera',
    permiso: 'finanzas.pago.reporte.carrera',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-REP',
  },
  {
    path: '/finanzas/reportes',
    element: <UnderConstruction />,
    key: 'FIN-REP',
    permiso: 'finanzas.pago.reporte.carrera',
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
