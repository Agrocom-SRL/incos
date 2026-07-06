// src/presentation/modules/finanzas/routes.jsx
/**
 * Dominio Finanzas (FIN). Raíz de menú: dominios/routes.jsx → key FIN.
 *
 * Módulo NUEVO e independiente del legacy `pagos/` (no lo importa). Cada ítem
 * del submenú tiene su directorio y routes.jsx propio (mismo patrón que
 * academico/asistencia, institucional/horarios, …).
 *
 * Menú FIN: Pagos · Pagos adicionales · Reportes de pagos · Aportes ·
 * Config. de pagos.
 */

import { UnderConstruction } from '@components/pages';
import { finanzasPagosRoutes } from './pagos/routes.jsx';
import { finanzasPagosAdicionalesRoutes } from './adicional/routes.jsx';
import { finanzasReportesRoutes } from './reportes/routes.jsx';
import { finanzasAportesRoutes } from './aportes/routes.jsx';
import { finanzasConfiguracionRoutes } from './configuracion/routes.jsx';

export const finanzasRoutes = [
  {
    path: '/finanzas',
    element: <UnderConstruction />,
    key: 'FIN-ROOT',
    menu: null,
  },
  ...finanzasPagosRoutes,
  ...finanzasPagosAdicionalesRoutes,
  ...finanzasReportesRoutes,
  ...finanzasAportesRoutes,
  ...finanzasConfiguracionRoutes,
];

export default finanzasRoutes;
