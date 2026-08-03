/**
 * Columnas de la tabla de Avance académico (pestaña «Avance» de ACA-AVANCE).
 *
 * Lenguaje de celda de la referencia (CFG Académico): `IdentidadCelda` para el
 * estudiante (nombre ya en orden canónico APELLIDOS NOMBRES desde la vista),
 * `InfoLinesCell` para celdas multi-línea y `Progress` para el % de avance.
 * dataIndex == campos literales del dataKey `avance` del backend.
 */

import { Progress, Typography } from 'antd';
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, CarreraDotCell } from '@atoms';
import { allColors } from '@theme/tokens';

const { Text } = Typography;

/** Nota mínima de aprobación (fallback institucional; espejo del centralizador). */
const NOTA_MINIMA_FALLBACK = 61;

/** % con 1 decimal (es-BO) o guion si el plan aún no define denominador. */
const formatPctAvance = (value) => {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return '—';
  return `${n.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};

export const createAvanceTableColumns = () => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Estudiante',
    dataIndex: 'nombreCompleto',
    key: 'estudiante',
    fixed: 'left',
    width: 280,
    ellipsis: true,
    render: (nombreCompleto, record) => (
      <IdentidadCelda codigo={record.codigo} nombre={nombreCompleto} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombreCompleto || '').localeCompare(b.nombreCompleto || '', 'es', {
        sensitivity: 'base',
      }),
  },
  {
    title: 'Carrera y plan',
    key: 'carreraPlan',
    width: 260,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          {
            key: 'carrera',
            label: (
              <CarreraDotCell nombre={record.carreraNombre} colorHex={record.carreraColorHex} />
            ),
          },
          {
            key: 'plan',
            icon: <BookOutlined />,
            label: record.planNombre
              ? `${record.planNombre}${
                  record.planDuracionAnios ? ` · ${record.planDuracionAnios} años` : ''
                }`
              : null,
          },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.carreraNombre || '').localeCompare(b.carreraNombre || '', 'es', {
        sensitivity: 'base',
      }),
  },
  {
    title: 'Materias del plan',
    key: 'materias',
    width: 230,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          {
            key: 'avanzadas',
            icon: <CheckCircleOutlined />,
            label: `${record.materiasAvanzadas ?? 0} de ${
              record.totalAsignaturasPlan ?? 0
            } avanzadas`,
          },
          {
            key: 'detalle',
            icon: <FileDoneOutlined />,
            label: `${record.materiasAprobadas ?? 0} aprobadas · ${
              record.materiasConvalidadas ?? 0
            } convalidadas`,
          },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.materiasAvanzadas ?? 0) - (b.materiasAvanzadas ?? 0),
  },
  {
    title: '% de avance',
    dataIndex: 'pctAvance',
    key: 'pctAvance',
    width: 180,
    render: (pctAvance) =>
      pctAvance == null ? (
        <Text type="secondary">—</Text>
      ) : (
        <Progress
          percent={pctAvance}
          size="small"
          format={() => formatPctAvance(pctAvance)}
          aria-label={`Avance del plan: ${formatPctAvance(pctAvance)}`}
        />
      ),
    sorter: true,
    sortCompare: (a, b) => (a.pctAvance ?? -1) - (b.pctAvance ?? -1),
    defaultSortOrder: 'descend',
  },
  {
    title: 'Historial',
    key: 'historial',
    width: 190,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          {
            key: 'promedio',
            icon: <TrophyOutlined />,
            label:
              record.promedioHistorial != null
                ? `Promedio ${Number(record.promedioHistorial).toLocaleString('es-BO', {
                    maximumFractionDigits: 2,
                  })}`
                : null,
            // Promedio bajo el mínimo de aprobación: rojo semántico del theme.
            style:
              record.promedioHistorial != null &&
              Number(record.promedioHistorial) < NOTA_MINIMA_FALLBACK
                ? { color: allColors.colorError }
                : undefined,
          },
          {
            key: 'gestiones',
            icon: <CalendarOutlined />,
            label:
              record.primeraGestionAnio != null
                ? record.ultimaGestionAnio != null &&
                  record.ultimaGestionAnio !== record.primeraGestionAnio
                  ? `Gestiones ${record.primeraGestionAnio} – ${record.ultimaGestionAnio}`
                  : `Gestión ${record.primeraGestionAnio}`
                : null,
          },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.promedioHistorial ?? -1) - (b.promedioHistorial ?? -1),
  },
];

export default createAvanceTableColumns;
