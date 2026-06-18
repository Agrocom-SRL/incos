// src/presentation/modules/finanzas/configuracion/routes.jsx
/**
 * Finanzas → Config. de pagos (ítem de menú FIN, order 5).
 * Placeholder en Fase 1. Permiso reutilizado: configuracion.pagos.
 * Aquí vivirá la configuración de aportes, métodos de pago, cuentas y bancos.
 */

import { UnderConstruction } from '@components/pages';

export const finanzasConfiguracionRoutes = [
  {
    path: '/finanzas/configuracion',
    element: <UnderConstruction />,
    key: 'FIN-CFG',
    permiso: 'configuracion.pagos',
    accion: 'LISTAR',
    menu: {
      label: 'Config. de pagos',
      module: 'FIN',
      parent: 'FIN',
      order: 5,
    },
  },
];

export default finanzasConfiguracionRoutes;
