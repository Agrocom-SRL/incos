// src/presentation/modules/academico/seguimiento/routes.jsx
/**
 * Seguimiento académico (ítem de menú ACA · ACA-SEGUIMIENTO).
 *
 * Agrupación 2026-08-01: los ítems de sidebar ACA-AVANCE (order 7) y los 3 de
 * Acompañamiento (ACA-ALERTAS 8, ACA-SESIONES 9, ACA-PANEL 10) se funden en
 * este único ítem (el sidebar se mantiene en 2 niveles, sin submenús): una
 * página contenedora con pestañas gateadas por permiso, extensión del patrón
 * Avance/Deserción de la disolución REP. Hereda el order 7 de Avance; los
 * orders 8-10 quedan huecos a propósito.
 *
 * Gating del ítem/ruta: `permisoAny` (patrón ya existente de CFG-ACADEMICO,
 * resuelto por `hasAnyPermiso` en menú y PrivateRoute) — el ítem se muestra si
 * el usuario tiene ≥1 permiso de sus pestañas con acción LISTAR, así ningún
 * rol con al menos una pantalla lo pierde. CERO cambios funcionales de RBAC
 * (códigos/acciones/roles del seed 59 intactos): cada pestaña reutiliza el
 * permiso de su antigua pantalla. En el seed 59 solo se alinearon
 * `ruta_sidebar` y los nombres de `grupos_ui` a esta agrupación (cosmético,
 * grilla de Seguridad) — requiere resembrar RBAC en BD existente.
 *
 * Rol ESTUDIANTE: solo tiene `academico.avance` → labelByRole «Mi avance» y
 * la página degrada a su ficha propia (alcance PROPIO resuelto en servidor).
 *
 * Las URLs legadas (/academico/avance, /academico/acompanamiento/*) NO se
 * eliminan: quedan como rutas gemelas de este connector (menu: null +
 * breadcrumbParent ACA-SEGUIMIENTO) en los routes.jsx de cada submódulo.
 */

import { lazy } from 'react';
import { SEGUIMIENTO_PATH } from '@application-academico/seguimiento/config/paths';
import { SEGUIMIENTO_PERMISOS_ANY } from '@application-academico/seguimiento/config/seguimientoPermisos';

const SeguimientoAcademicoConnector = lazy(
  () => import('./connectors/SeguimientoAcademicoConnector.jsx'),
);

export const seguimientoRoutes = [
  {
    path: SEGUIMIENTO_PATH,
    element: <SeguimientoAcademicoConnector />,
    key: 'ACA-SEGUIMIENTO',
    permiso: null,
    permisoAny: SEGUIMIENTO_PERMISOS_ANY,
    accion: 'LISTAR',
    menu: {
      label: 'Seguimiento académico',
      module: 'ACA',
      parent: 'ACA',
      order: 7,
      labelByRole: { ESTUDIANTE: 'Mi avance' },
    },
  },
];

export default seguimientoRoutes;
