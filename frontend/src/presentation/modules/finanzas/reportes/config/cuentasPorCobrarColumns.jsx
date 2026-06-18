/**
 * Columnas de la planilla de cuentas por cobrar (grano = estudiante, read-only).
 *
 * Replica las columnas de la planilla de referencia: Nº, Carnet, Nombre, Monto
 * total (Bs), Pagos realizados (Fecha último + Monto pagado), Saldo pendiente
 * (Bs), % del saldo, Fecha compromiso, Días de atraso, Estado y Observaciones.
 *
 * Celdas con `TableCell`; el nombre completo llega ya formateado por el backend
 * (orden APELLIDOS NOMBRES) y se usa tal cual. La fila de TOTALES por carrera y
 * los encabezados de paralelo se pintan en el organismo de sección, no aquí.
 */

import { TableCell } from '@molecules';
import { Text } from '@atoms';
import EstadoCobranzaTag from '@finanzas/reportes/components/atoms/EstadoCobranzaTag';

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
 * Días de atraso: positivo = vencido (peligro), negativo = faltan días (aviso),
 * 0 = vence hoy, null = sin compromiso. El color sigue el `textType` del átomo
 * `Text` (que deriva del token de estado), nunca #hex.
 */
const renderDiasAtraso = (dias) => {
  if (dias == null) {
    return (
      <TableCell align="center">
        <Text type="secondary">—</Text>
      </TableCell>
    );
  }
  const n = Number(dias) || 0;
  let textType = 'secondary';
  let label = '0';
  if (n > 0) {
    textType = 'danger';
    label = `+${n}`;
  } else if (n < 0) {
    textType = 'warning';
    label = String(n);
  }
  return (
    <TableCell align="center">
      <Text type={textType} strong={n > 0}>
        {label}
      </Text>
    </TableCell>
  );
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
    title: 'Carnet',
    key: 'carnet',
    width: 120,
    fixed: 'left',
    render: (_, record) => (
      <TableCell subtext={record.codigoEstudiante || null}>{record.carnet || '—'}</TableCell>
    ),
  },
  {
    title: 'Nombre completo',
    key: 'nombreCompleto',
    width: 240,
    fixed: 'left',
    ellipsis: true,
    render: (_, record) => <TableCell>{record.nombreCompleto || 'Sin nombre'}</TableCell>,
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
      <TableCell align="center">{formatPorcentaje(record.porcentajeSaldo)}</TableCell>
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
    width: 110,
    align: 'center',
    render: (_, record) => renderDiasAtraso(record.diasAtraso),
  },
  {
    title: 'Estado',
    key: 'estado',
    width: 150,
    align: 'center',
    render: (_, record) => (
      <TableCell align="center">
        <EstadoCobranzaTag estado={record.estado} />
      </TableCell>
    ),
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
