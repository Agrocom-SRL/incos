// src/presentation/modules/finanzas/configuracion/routes.jsx
/**
 * Finanzas → Config. de pagos (ítem de menú FIN, order 5).
 *
 * Pantalla de configuración de pagos de la gestión vigente: métodos de pago,
 * bancos autorizados, cuentas de pago y becas/descuentos (catálogo maestro),
 * en un sistema de tabs (`?tab=`). Módulo NUEVO e independiente del legacy
 * `@pagos`. El aporte (configuracion_aportes) vive aquí como página hija sin
 * ítem de menú propio (`/finanzas/configuracion/aportes`, permiso
 * `finanzas.aporte`), accesible desde el botón "Configuración de aportes" de
 * `ConfigPagosPage` (mismo patrón `menu: null` + `breadcrumbParent` de
 * `finanzas/reportes/routes.jsx`).
 *
 * Fichas de detalle de bancos/cuentas/métodos (sin ítem de menú propio,
 * mismo permiso `finanzas.configuracion.pago`, acciones DETALLE/EDITAR/
 * ELIMINAR según el botón): reemplazan el toggle activo/inactivo que antes
 * vivía en la tabla.
 *
 * Becas y descuentos (catálogo MAESTRO, permiso propio `finanzas.beca-descuento`):
 * el LISTADO vive EMBEBIDO como 4to tab de `ConfigPagosPage`
 * (`BecasDescuentosTabPanel`, auto-contenido) — NO es una ruta propia. Solo
 * alta/edición/detalle son páginas de navegación completa.
 *
 * Permiso de la ruta de entrada: finanzas.configuracion.pago (LISTAR). El
 * alta (bancos/cuentas) usa CREAR y edición/toggle/eliminar usan EDITAR/
 * ELIMINAR (vía PermisoGuard en los organismos/fichas).
 */

import { lazy } from 'react';

const ConfigPagosConnector = lazy(() => import('./connectors/ConfigPagosConnector.jsx'));
const AporteConfigConnector = lazy(() => import('./connectors/AporteConfigConnector.jsx'));
const BancoDetailConnector = lazy(() => import('./connectors/BancoDetailConnector.jsx'));
const CuentaDetailConnector = lazy(() => import('./connectors/CuentaDetailConnector.jsx'));
const MetodoDetailConnector = lazy(() => import('./connectors/MetodoDetailConnector.jsx'));
const BancoFormCreateConnector = lazy(() => import('./connectors/BancoFormCreateConnector.jsx'));
const BancoFormEditConnector = lazy(() => import('./connectors/BancoFormEditConnector.jsx'));
const CuentaFormCreateConnector = lazy(() => import('./connectors/CuentaFormCreateConnector.jsx'));
const CuentaFormEditConnector = lazy(() => import('./connectors/CuentaFormEditConnector.jsx'));
const MetodoFormEditConnector = lazy(() => import('./connectors/MetodoFormEditConnector.jsx'));
const BecaDescuentoFormCreateConnector = lazy(
  () => import('./connectors/BecaDescuentoFormCreateConnector.jsx'),
);
const BecaDescuentoFormEditConnector = lazy(
  () => import('./connectors/BecaDescuentoFormEditConnector.jsx'),
);
const BecaDescuentoDetailConnector = lazy(
  () => import('./connectors/BecaDescuentoDetailConnector.jsx'),
);

export const finanzasConfiguracionRoutes = [
  {
    path: '/finanzas/configuracion',
    element: <ConfigPagosConnector />,
    key: 'FIN-CFG',
    permiso: 'finanzas.configuracion.pago',
    accion: 'LISTAR',
    menu: {
      label: 'Config. de pagos',
      module: 'FIN',
      parent: 'FIN',
      order: 5,
    },
  },
  {
    path: '/finanzas/configuracion/aportes',
    element: <AporteConfigConnector />,
    key: 'FIN-CFG-APORTES',
    breadcrumbLabel: 'Aportes',
    permiso: 'finanzas.aporte',
    accion: 'LISTAR',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },

  // Bancos autorizados: alta/edición (páginas completas) + ficha de detalle
  // (toggle activo/inactivo y eliminar viven en la ficha).
  {
    path: '/finanzas/configuracion/bancos/nuevo',
    element: <BancoFormCreateConnector />,
    key: 'FIN-CFG-BANCO-NUEVO',
    breadcrumbLabel: 'Nuevo banco',
    permiso: 'finanzas.configuracion.pago',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },
  {
    path: '/finanzas/configuracion/bancos/:id/editar',
    element: <BancoFormEditConnector />,
    key: 'FIN-CFG-BANCO-EDITAR',
    breadcrumbLabel: 'Editar banco',
    permiso: 'finanzas.configuracion.pago',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },
  {
    path: '/finanzas/configuracion/bancos/:id',
    element: <BancoDetailConnector />,
    key: 'FIN-CFG-BANCO-DETALLE',
    breadcrumbLabel: 'Banco',
    permiso: 'finanzas.configuracion.pago',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },

  // Cuentas de pago: alta/edición (páginas completas) + ficha de detalle.
  {
    path: '/finanzas/configuracion/cuentas/nueva',
    element: <CuentaFormCreateConnector />,
    key: 'FIN-CFG-CUENTA-NUEVA',
    breadcrumbLabel: 'Nueva cuenta',
    permiso: 'finanzas.configuracion.pago',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },
  {
    path: '/finanzas/configuracion/cuentas/:id/editar',
    element: <CuentaFormEditConnector />,
    key: 'FIN-CFG-CUENTA-EDITAR',
    breadcrumbLabel: 'Editar cuenta',
    permiso: 'finanzas.configuracion.pago',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },
  {
    path: '/finanzas/configuracion/cuentas/:id',
    element: <CuentaDetailConnector />,
    key: 'FIN-CFG-CUENTA-DETALLE',
    breadcrumbLabel: 'Cuenta',
    permiso: 'finanzas.configuracion.pago',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },

  // Métodos de pago: catálogo fijo (sin alta), solo edición + ficha de detalle.
  {
    path: '/finanzas/configuracion/metodos/:id/editar',
    element: <MetodoFormEditConnector />,
    key: 'FIN-CFG-METODO-EDITAR',
    breadcrumbLabel: 'Editar método de pago',
    permiso: 'finanzas.configuracion.pago',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },
  {
    path: '/finanzas/configuracion/metodos/:id',
    element: <MetodoDetailConnector />,
    key: 'FIN-CFG-METODO-DETALLE',
    breadcrumbLabel: 'Método',
    permiso: 'finanzas.configuracion.pago',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },

  // Becas y descuentos (catálogo maestro) — alta/edición/detalle; el listado
  // vive embebido en el tab "Becas y descuentos" de ConfigPagosPage.
  {
    path: '/finanzas/configuracion/becas-descuentos/nueva',
    element: <BecaDescuentoFormCreateConnector />,
    key: 'FIN-CFG-BECAS-NUEVA',
    breadcrumbLabel: 'Nueva beca o descuento',
    permiso: 'finanzas.beca-descuento',
    accion: 'CREAR',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },
  {
    path: '/finanzas/configuracion/becas-descuentos/:id/editar',
    element: <BecaDescuentoFormEditConnector />,
    key: 'FIN-CFG-BECAS-EDITAR',
    breadcrumbLabel: 'Editar beca o descuento',
    permiso: 'finanzas.beca-descuento',
    accion: 'EDITAR',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },
  {
    path: '/finanzas/configuracion/becas-descuentos/:id',
    element: <BecaDescuentoDetailConnector />,
    key: 'FIN-CFG-BECAS-DETALLE',
    breadcrumbLabel: 'Detalle de beca o descuento',
    permiso: 'finanzas.beca-descuento',
    accion: 'DETALLE',
    menu: null,
    breadcrumbParent: 'FIN-CFG',
  },
];

export default finanzasConfiguracionRoutes;
