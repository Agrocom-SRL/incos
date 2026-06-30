/**
 * Columnas de la tabla "Pagos realizados" del portal del estudiante (Mis aportes).
 *
 * SOLO LECTURA: sin acciones de recibo, edición ni anulación. Una sola fuente de
 * verdad de columnas (no inline en la página). Montos enteros en Bs (`formatBs`).
 */

import { Tag } from 'antd';
import { formatBs } from '@application/utils/formatters';

/** Fecha ISO → dd/mm/aaaa local; guion si no hay fecha. */
const formatFecha = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/** Color del Tag de estado de la cuota, derivado del token de estado de AntD. */
const estadoTagColor = (estado) => {
  const value = String(estado || '').toUpperCase();
  if (value.includes('ANUL')) return 'error';
  if (value.includes('PEND')) return 'warning';
  if (value) return 'success';
  return 'default';
};

export const misAportesCuotasColumns = [
  {
    title: 'Nº',
    key: 'numero',
    width: 64,
    align: 'center',
    render: (_, record, index) => record.numero ?? index + 1,
  },
  {
    title: 'Fecha de pago',
    key: 'fechaPago',
    width: 130,
    render: (_, record) => formatFecha(record.fechaPago),
  },
  {
    title: 'Monto (Bs)',
    key: 'monto',
    width: 120,
    align: 'right',
    render: (_, record) => formatBs(record.monto),
  },
  {
    title: 'Método de pago',
    key: 'metodoPago',
    render: (_, record) => record.metodoPago || '—',
  },
  {
    title: 'Nº comprobante',
    key: 'nroComprobante',
    render: (_, record) => record.nroComprobante || '—',
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 130,
    render: (_, record) =>
      record.estado ? (
        <Tag color={estadoTagColor(record.estado)} style={{ margin: 0 }}>
          {record.estado}
        </Tag>
      ) : (
        '—'
      ),
  },
];

export default misAportesCuotasColumns;
