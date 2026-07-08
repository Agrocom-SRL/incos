/**
 * Tabs de la pantalla "Config. de pagos" (Finanzas).
 * Una URL base (/finanzas/configuracion) con `?tab=` (espejo de AcademicoPage):
 * métodos · bancos · cuentas · becas y descuentos. Cada tab = una entidad con
 * título + descripción.
 *
 * El tab "Aporte" se promovió a página hija sin ítem de menú propio,
 * `/finanzas/configuracion/aportes` (permiso `finanzas.aporte`, ver
 * `finanzas/configuracion/routes.jsx`). "Becas y descuentos" es el catálogo
 * MAESTRO (permiso `finanzas.beca-descuento`, distinto de las becas asignadas
 * a estudiantes): el listado vive embebido en este tab; alta/edición/detalle
 * son páginas de navegación completa.
 */

import { BankOutlined, CreditCardOutlined, GiftOutlined, WalletOutlined } from '@ant-design/icons';

export const TAB_METODOS = 'metodos';
export const TAB_BANCOS = 'bancos';
export const TAB_CUENTAS = 'cuentas';
export const TAB_BECAS_DESCUENTOS = 'becas-descuentos';

/** Metadatos por tab: etiqueta corta (chip del tab) + título y descripción del panel. */
export const CONFIG_PAGOS_TAB_META = {
  [TAB_METODOS]: {
    shortLabel: 'Métodos de pago',
    title: 'Métodos de pago',
    description:
      'Los cuatro medios habilitados (efectivo, QR, transferencia y depósito). Edite el nombre visible o active/desactive cada uno.',
    icon: CreditCardOutlined,
  },
  [TAB_BANCOS]: {
    shortLabel: 'Bancos autorizados',
    title: 'Bancos autorizados',
    description:
      'Entidades bancarias habilitadas para recibir transferencias y depósitos. Agregue, edite y active/desactive cada banco.',
    icon: BankOutlined,
  },
  [TAB_CUENTAS]: {
    shortLabel: 'Cuentas de pago',
    title: 'Cuentas de pago',
    description:
      'Cuentas destino con su titular, método, banco y QR de cobro. Agregue, edite (incluyendo el QR) y active/desactive cada cuenta.',
    icon: WalletOutlined,
  },
  [TAB_BECAS_DESCUENTOS]: {
    shortLabel: 'Becas y descuentos',
    title: 'Becas y descuentos',
    description:
      'Catálogo maestro de becas y descuentos disponibles: porcentaje, reglas de aplicación y asignación automática.',
    icon: GiftOutlined,
  },
};

export const CONFIG_PAGOS_TAB_KEYS = [TAB_METODOS, TAB_BANCOS, TAB_CUENTAS, TAB_BECAS_DESCUENTOS];
