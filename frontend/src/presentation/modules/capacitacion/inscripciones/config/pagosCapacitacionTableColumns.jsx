/**
 * Columnas del historial de pagos de una inscripción (ficha CAP).
 *
 * Tabla embebida en `InscripcionPagosSection` (gemela de las cuotas de la
 * ficha de pago de Finanzas). Sin editar/eliminar por fila: los pagos de capacitación
 * no se modifican por separado (solo el comprobante, opcional) (el recibo PDF se difiere, §6.5).
 * Montos Bs SIN decimales (formatBs).
 */

import { formatBs } from '@application/utils/formatters';
import { formatConceptoPago } from '@application-capacitacion/utils/capacitacionCatalogos';
import PagoComprobanteCell from '@capacitacion/inscripciones/components/molecules/PagoComprobanteCell';

/**
 * @param {Object} [comprobante] - permisos y handlers del comprobante (opcional)
 *   `{ puedeDescargar, puedeAdjuntar, subiendo, onDescargar, onAdjuntar }`
 */
export const createPagosCapacitacionTableColumns = (comprobante = {}) => [
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
    title: 'Concepto',
    dataIndex: 'concepto',
    width: 200,
    render: (concepto) => formatConceptoPago(concepto),
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
  {
    title: 'Comprobante',
    key: 'comprobante',
    width: 240,
    render: (_, pago) => <PagoComprobanteCell pago={pago} {...comprobante} />,
  },
];
