/**
 * Columnas del historial de pagos de una inscripción (ficha CAP).
 *
 * Tabla embebida en `InscripcionPagosSection` (gemela de las cuotas de la
 * ficha de pago de Finanzas). Sin acciones de fila: los pagos de capacitación
 * no se editan ni eliminan por separado (el recibo PDF se difiere, §6.5).
 * Montos Bs SIN decimales (formatBs).
 */

import { formatBs } from '@application/utils/formatters';

export const createPagosCapacitacionTableColumns = () => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index) => index + 1,
  },
  {
    title: 'Recibo',
    dataIndex: 'numeroRecibo',
    width: 110,
    render: (v) => v || '—',
  },
  {
    title: 'Fecha',
    dataIndex: 'fechaPagoLabel',
    width: 120,
    render: (v) => v || '—',
  },
  {
    title: 'Monto',
    dataIndex: 'monto',
    width: 120,
    align: 'right',
    render: (monto) => `Bs ${formatBs(monto)}`,
  },
  {
    title: 'Método',
    dataIndex: 'metodoPagoNombre',
    width: 140,
    render: (v) => v || '—',
  },
  {
    title: 'Cuenta',
    dataIndex: 'cuentaLabel',
    width: 200,
    render: (v) => v || '—',
  },
  {
    title: 'Observaciones',
    dataIndex: 'observaciones',
    render: (v) => v || '—',
  },
];
