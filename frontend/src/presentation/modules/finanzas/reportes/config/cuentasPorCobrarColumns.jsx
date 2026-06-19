/**
 * Columnas de la planilla de cuentas por cobrar (grano = estudiante, read-only).
 *
 * Lenguaje visual del catálogo académico / Asistencia · Licencias:
 *   - Nº.
 *   - Estudiante: `CobranzaEstudianteCell` (IdentidadCelda carnet + nombre) con el
 *     ESTADO de cobranza (al día / próxima / vencida / sin compromiso) como
 *     `StatusPill` DEBAJO del nombre — NO ocupa columna propia.
 *   - Montos (total, pagos, saldo) con `TableCell`.
 *   - Datos con color (% saldo, días de atraso) con `StatusPill` por severidad.
 *   - Observaciones con `TableCell`.
 *
 * El nombre completo llega ya formateado por el backend (orden APELLIDOS NOMBRES)
 * y se usa tal cual. Las filas de TOTALES por carrera y los encabezados de
 * paralelo se pintan en el organismo de sección, no aquí.
 */

import { TableCell } from '@molecules';
import { Text } from '@atoms';
import StatusPill from '@atoms/StatusPill';
import CobranzaEstudianteCell from '@finanzas/reportes/components/atoms/CobranzaEstudianteCell';
import {
  getDiasAtrasoPill,
  getPorcentajeSaldoPillClass,
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
    width: 48,
    align: 'center',
    fixed: 'left',
    render: (_value, _record, index) => index + 1,
  },
  {
    title: 'Estudiante',
    key: 'estudiante',
    width: 280,
    fixed: 'left',
    ellipsis: true,
    render: (_, record) => (
      <CobranzaEstudianteCell
        carnet={record.carnet}
        nombreCompleto={record.nombreCompleto}
        estado={record.estado}
      />
    ),
  },
  {
    title: 'Monto total (Bs)',
    key: 'montoTotal',
    width: 130,
    align: 'right',
    render: (_, record) => (
      <TableCell align="right" strong>
        {formatBs(record.montoTotal)}
      </TableCell>
    ),
  },
  {
    title: 'Pagos realizados',
    children: [
      {
        title: 'Fecha',
        key: 'fechaUltimoPago',
        width: 110,
        align: 'center',
        render: (_, record) => (
          <TableCell align="center">{formatFecha(record.fechaUltimoPago)}</TableCell>
        ),
      },
      {
        title: 'Monto (Bs)',
        key: 'totalPagado',
        width: 120,
        align: 'right',
        render: (_, record) => (
          <TableCell align="right">{formatBs(record.totalPagado)}</TableCell>
        ),
      },
    ],
  },
  {
    title: 'Saldo pendiente (Bs)',
    key: 'saldoPendiente',
    width: 150,
    align: 'right',
    render: (_, record) => (
      <TableCell align="right" strong>
        {formatBs(record.saldoPendiente)}
      </TableCell>
    ),
  },
  {
    title: '% saldo pendiente',
    key: 'porcentajeSaldo',
    width: 130,
    align: 'center',
    render: (_, record) => (
      <TableCell align="center">
        <StatusPill
          label={formatPorcentaje(record.porcentajeSaldo)}
          className={getPorcentajeSaldoPillClass(record.porcentajeSaldo)}
        />
      </TableCell>
    ),
  },
  {
    title: 'Fecha compromiso',
    key: 'fechaCompromiso',
    width: 130,
    align: 'center',
    render: (_, record) => (
      <TableCell align="center">{formatFecha(record.fechaCompromiso)}</TableCell>
    ),
  },
  {
    title: 'Días de atraso',
    key: 'diasAtraso',
    width: 120,
    align: 'center',
    render: (_, record) => {
      const { label, pillClass } = getDiasAtrasoPill(record.diasAtraso);
      return (
        <TableCell align="center">
          <StatusPill label={label} className={pillClass} />
        </TableCell>
      );
    },
  },
  {
    title: 'Observaciones',
    key: 'observacion',
    width: 200,
    ellipsis: true,
    render: (_, record) => (
      <TableCell>
        <Text type={record.observacion ? 'default' : 'secondary'}>
          {record.observacion || '—'}
        </Text>
      </TableCell>
    ),
  },
];

export default createCuentasPorCobrarColumns;
