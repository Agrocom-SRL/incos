/**
 * Columnas de la pestaña «Deserción» de ACA-AVANCE (dos tablas):
 *   - agregado carrera × gestión (dataKey `carreras`, vista 173);
 *   - detalle de desertores (dataKey `desertores`, vista 172).
 *
 * El % de deserción usa el rojo SEMÁNTICO del theme (`allColors.colorError`,
 * token — nunca hex), mismo lenguaje que el riesgo por carrera de TUT.
 * dataIndex == campos literales de los dataKeys del backend.
 */

import { Progress, Typography } from 'antd';
import { BookOutlined, CalendarOutlined, TeamOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, CarreraDotCell, StatusPill } from '@atoms';
import { allColors } from '@theme/tokens';

const { Text } = Typography;

/** % con 1 decimal (es-BO); guion cuando el universo está vacío. */
const formatPctDesercion = (value) => {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return '—';
  return `${n.toLocaleString('es-BO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};

/** Estados consolidados de matrícula que cuentan como deserción (vista 172). */
const ESTADO_DESERCION_PILL = {
  ABANDONO: { label: 'Abandono', className: 'cfg-materia-pill cfg-materia-pill--danger' },
  RETIRADO: { label: 'Retiro', className: 'cfg-materia-pill cfg-materia-pill--warning' },
};

const columnaNro = {
  title: '#',
  key: 'nro',
  width: 56,
  align: 'center',
  render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
};

/** Tabla superior: agregado carrera × gestión. */
export const createDesercionCarrerasColumns = () => [
  columnaNro,
  {
    title: 'Gestión',
    dataIndex: 'gestionNombre',
    key: 'gestion',
    width: 130,
    render: (gestionNombre, record) => (
      <Text strong>{gestionNombre || record.gestionAnio || '—'}</Text>
    ),
    sorter: true,
    sortCompare: (a, b) => (a.gestionAnio ?? 0) - (b.gestionAnio ?? 0),
  },
  {
    title: 'Carrera',
    dataIndex: 'carreraNombre',
    key: 'carrera',
    ellipsis: true,
    render: (carreraNombre, record) => (
      <CarreraDotCell nombre={carreraNombre} colorHex={record.carreraColorHex} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.carreraNombre || '').localeCompare(b.carreraNombre || '', 'es', {
        sensitivity: 'base',
      }),
  },
  {
    title: 'Matrículas de materia',
    key: 'matriculas',
    width: 230,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          {
            key: 'total',
            icon: <BookOutlined />,
            label: `${record.totalMatriculasMateria ?? 0} en total`,
          },
          {
            key: 'desercion',
            icon: <UserDeleteOutlined />,
            label: `${record.matriculasAbandono ?? 0} abandono · ${
              record.matriculasRetiro ?? 0
            } retiro`,
          },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.matriculasDesercion ?? 0) - (b.matriculasDesercion ?? 0),
  },
  {
    title: 'Estudiantes',
    key: 'estudiantes',
    width: 200,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          {
            key: 'total',
            icon: <TeamOutlined />,
            label: `${record.totalEstudiantes ?? 0} matriculados`,
          },
          {
            key: 'desertores',
            icon: <UserDeleteOutlined />,
            label: `${record.estudiantesDesercion ?? 0} con deserción`,
            style:
              (record.estudiantesDesercion ?? 0) > 0
                ? { color: allColors.colorError }
                : undefined,
          },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.estudiantesDesercion ?? 0) - (b.estudiantesDesercion ?? 0),
  },
  {
    title: '% de deserción',
    dataIndex: 'pctEstudiantesDesercion',
    key: 'pctDesercion',
    width: 180,
    render: (pct) =>
      pct == null ? (
        <Text type="secondary">—</Text>
      ) : (
        <Progress
          percent={pct}
          size="small"
          strokeColor={allColors.colorError}
          format={() => formatPctDesercion(pct)}
          aria-label={`Deserción: ${formatPctDesercion(pct)}`}
        />
      ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.pctEstudiantesDesercion ?? -1) - (b.pctEstudiantesDesercion ?? -1),
    defaultSortOrder: 'descend',
  },
];

/** Tabla inferior: detalle de desertores (una fila por matrícula ABANDONO/RETIRADO). */
export const createDesercionDesertoresColumns = () => [
  columnaNro,
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
    title: 'Carrera y gestión',
    key: 'carreraGestion',
    width: 240,
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
            key: 'gestion',
            icon: <CalendarOutlined />,
            label: record.gestionNombre || record.gestionAnio || null,
          },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.gestionAnio ?? 0) - (b.gestionAnio ?? 0),
  },
  {
    title: 'Asignatura',
    key: 'asignatura',
    ellipsis: true,
    render: (_, record) => (
      <IdentidadCelda codigo={record.asignaturaSigla} nombre={record.asignaturaNombre} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.asignaturaNombre || '').localeCompare(b.asignaturaNombre || '', 'es', {
        sensitivity: 'base',
      }),
  },
  {
    title: 'Año del plan',
    dataIndex: 'periodoNombre',
    key: 'periodo',
    width: 130,
    render: (periodoNombre, record) => (
      <Text type="secondary">
        {periodoNombre || (record.periodoNumero != null ? `Año ${record.periodoNumero}` : '—')}
      </Text>
    ),
    sorter: true,
    sortCompare: (a, b) => (a.periodoNumero ?? 0) - (b.periodoNumero ?? 0),
  },
  {
    title: 'Estado',
    dataIndex: 'estado',
    key: 'estado',
    width: 120,
    align: 'center',
    render: (estado) => {
      const pill = ESTADO_DESERCION_PILL[estado];
      return <StatusPill label={pill?.label ?? estado} className={pill?.className} />;
    },
    sorter: true,
    sortCompare: (a, b) => (a.estado || '').localeCompare(b.estado || '', 'es'),
  },
];
