/**
 * Tabs de la pantalla "Config. de pagos" (Finanzas).
 * Una URL base (/finanzas/configuracion) con `?tab=` (espejo de AcademicoPage):
 * aporte · métodos · bancos · cuentas. Cada tab = una entidad con título + descripción.
 */

import {
  BankOutlined,
  CreditCardOutlined,
  GoldOutlined,
  WalletOutlined,
} from '@ant-design/icons';

export const TAB_APORTE = 'aporte';
export const TAB_METODOS = 'metodos';
export const TAB_BANCOS = 'bancos';
export const TAB_CUENTAS = 'cuentas';

/** Metadatos por tab: etiqueta corta (chip del tab) + título y descripción del panel. */
export const CONFIG_PAGOS_TAB_META = {
  [TAB_APORTE]: {
    shortLabel: 'Aporte',
    title: 'Aporte de la gestión vigente',
    description:
      'Monto base, vigencia y estado del aporte que se cobra a los estudiantes en la gestión actual.',
    icon: GoldOutlined,
  },
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
};

export const CONFIG_PAGOS_TAB_KEYS = [TAB_APORTE, TAB_METODOS, TAB_BANCOS, TAB_CUENTAS];
