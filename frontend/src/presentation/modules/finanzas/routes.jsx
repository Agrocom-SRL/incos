// src/presentation/modules/finanzas/routes.jsx
/**
 * Dominio Finanzas (FIN). Raíz de menú: dominios/routes.jsx → key FIN.
 *
 * Módulo NUEVO e independiente del legacy `pagos/` (no lo importa). Cada ítem
 * del submenú tiene su directorio y routes.jsx propio (mismo patrón que
 * academico/asistencia, institucional/horarios, …).
 *
 * Menú FIN: Pagos · Reportes de pagos · Configuración de becas · Config. de
 * pagos. Aportes ya no es ítem de menú propio: vive como página hija de
 * Config. de pagos (`/finanzas/configuracion/aportes`, ver
 * `configuracion/routes.jsx`).
 *
 * "Configuración de becas" (`becas/`) reutiliza el directorio del antiguo
 * placeholder "Pagos adicionales" (`adicional/`, Fase 1 sin funcionalidad
 * real) — separa el catálogo maestro de becas/descuentos de los parámetros
 * de pago (bancos/cuentas/métodos), que antes vivía embebido como tab de
 * "Config. de pagos".
 */

import { UnderConstruction } from '@components/pages';
import { finanzasPagosRoutes } from './pagos/routes.jsx';
import { finanzasBecasRoutes } from './becas/routes.jsx';
import { finanzasReportesRoutes } from './reportes/routes.jsx';
import { finanzasConfiguracionRoutes } from './configuracion/routes.jsx';

export const finanzasRoutes = [
  {
    path: '/finanzas',
    element: <UnderConstruction />,
    key: 'FIN-ROOT',
    menu: null,
  },
  ...finanzasPagosRoutes,
  ...finanzasReportesRoutes,
  ...finanzasBecasRoutes,
  ...finanzasConfiguracionRoutes,
];

export default finanzasRoutes;
