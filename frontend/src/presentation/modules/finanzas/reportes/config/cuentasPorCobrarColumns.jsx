/**
 * Columnas de la planilla de cuentas por cobrar (grano = estudiante, read-only).
 *
 * Lenguaje de PLANILLA oficial del instituto (kit `fin-planilla`): cabecera
 * verde, celdas compactas, columnas numéricas alineadas a la derecha con
 * `fin-num` (tabular-nums) y estado por DOT de color (al día / próximo /
 * vencido / sin compromiso). Réplica de la planilla densa de calificaciones.
 *
 * Columnas:
 *   - Nº.
 *   - Estudiante: `CobranzaEstudianteCell` (IdentidadCelda carnet + nombre).
 *   - Monto total (Bs) · numérica.
 *   - Pagos realizados (fecha + monto) · numérica.
 *   - Saldo pendiente (Bs) · numérica, banda teñida por severidad.
 *   - % saldo pendiente · numérica.
 *   - Fecha compromiso · centrada.
 *   - Días de atraso · numérica.
 *   - Estado · dot de color.
 *   - Observaciones.
 *
 * El nombre completo llega ya formateado por el backend (orden APELLIDOS NOMBRES)
 * y se usa tal cual. Las filas de TOTALES por carrera y los encabezados de
 * paralelo se pintan en el organismo de sección (filas `fin-planilla__row-*`).
 */

import CobranzaEstudianteCell from '@finanzas/reportes/components/atoms/CobranzaEstudianteCell';
import {
  formatEstadoCobranza,
  getDiasAtrasoLabel,
  getEstadoDotClass,
  getSaldoBandaClass,
} from '@application-finanzas/utils/cuentasPorCobrarPills';

/** Formatea un monto en bolivianos: "1.200,00" (sin símbolo; la columna ya rotula Bs). */
export const formatBs = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return safe.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/** Formatea un porcentaje a una decimal: "50,0%". */
export const formatPorcentaje = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `${safe.toLocaleString('es-BO', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
};

/** Fecha ISO → dd/mm/aaaa local; guion si no hay fecha. */
export const formatFecha = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * @returns {Array} Columnas de AntD Table (grano estudiante).
 */
export const createCuentasPorCobrarColumns = () => [
  {
    title: 'Nº',
    key: 'nro',
    width: 44,
    align: 'center',
    fixed: 'left',
    className: 'fin-num--center',
    render: (_value, _record, index) => index + 1,
  },
  {
    title: 'Estudiante',
    key: 'estudiante',
    width: 260,
    fixed: 'left',
    ellipsis: true,
    render: (_, record) => (
      <CobranzaEstudianteCell carnet={record.carnet} nombreCompleto={record.nombreCompleto} />
    ),
  },
  {
    title: 'Monto total (Bs)',
    key: 'montoTotal',
    width: 120,
    className: 'fin-num',
    render: (_, record) => formatBs(record.montoTotal),
  },
  {
    title: 'Pagos realizados',
    children: [
      {
        title: 'Fecha',
        key: 'fechaUltimoPago',
        width: 104,
        className: 'fin-num--center',
        render: (_, record) => formatFecha(record.fechaUltimoPago),
      },
      {
        title: 'Monto (Bs)',
        key: 'totalPagado',
        width: 116,
        className: 'fin-num',
        render: (_, record) => formatBs(record.totalPagado),
      },
    ],
  },
  {
    title: 'Saldo pendiente (Bs)',
    key: 'saldoPendiente',
    width: 140,
    className: 'fin-num fin-num--strong',
    onCell: (record) => ({ className: `fin-num fin-num--strong ${getSaldoBandaClass(record.saldoPendiente)}` }),
    render: (_, record) => formatBs(record.saldoPendiente),
  },
  {
    title: '% saldo',
    key: 'porcentajeSaldo',
    width: 92,
    className: 'fin-num',
    render: (_, record) => formatPorcentaje(record.porcentajeSaldo),
  },
  {
    title: 'Fecha compromiso',
    key: 'fechaCompromiso',
    width: 124,
    className: 'fin-num--center',
    render: (_, record) => formatFecha(record.fechaCompromiso),
  },
  {
    title: 'Días de atraso',
    key: 'diasAtraso',
    width: 112,
    className: 'fin-num--center',
    render: (_, record) => getDiasAtrasoLabel(record.diasAtraso),
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 132,
    align: 'left',
    render: (_, record) => (
      <span className="cobranza-estado">
        <span className={`fin-dot ${getEstadoDotClass(record.estado)}`} aria-hidden />
        <span className="cobranza-estado__label">{formatEstadoCobranza(record.estado)}</span>
      </span>
    ),
  },
  {
    title: 'Observaciones',
    key: 'observacion',
    width: 200,
    ellipsis: true,
    render: (_, record) => (
      <span className={record.observacion ? 'cobranza-obs' : 'cobranza-obs cobranza-obs--vacio'}>
        {record.observacion || '—'}
      </span>
    ),
  },
];

export default createCuentasPorCobrarColumns;
