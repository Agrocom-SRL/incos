/**
 * Columnas de la tabla de reprobación por materia del panel de acompañamiento
 * (módulo ACA · A10, sección `reprobacionPorMateria`: vista 158 por
 * gestión+carrera+oferta de curso).
 *
 * Tabla de LECTURA (sin acciones): materias ordenadas por % de riesgo, con
 * porcentajes en rojo semántico del theme (`Text type="danger"`) cuando
 * superan cero — el detalle fino vive en "Alumnos en riesgo".
 */

import { Typography } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { CarreraDotCell, IdentidadCelda, InfoLinesCell } from '@atoms';

const { Text } = Typography;

/** Render de porcentaje con énfasis de riesgo cuando es mayor a cero. */
const renderPct = (pct) => (
  <Text strong={pct > 0} type={pct > 0 ? 'danger' : 'secondary'}>
    {pct}%
  </Text>
);

export const createPanelReprobacionColumns = () => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Materia',
    key: 'materia',
    width: 240,
    render: (_, record) => (
      <IdentidadCelda
        codigo={record.paraleloLabel || null}
        nombre={(record.materiaNombre || 'Sin materia').toUpperCase()}
      />
    ),
  },
  {
    title: 'Carrera',
    key: 'carrera',
    width: 180,
    render: (_, record) => <CarreraDotCell nombre={record.carreraNombre} />,
  },
  {
    title: 'Matriculados',
    key: 'matriculados',
    width: 130,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          { icon: <TeamOutlined />, label: `${record.matriculados} matriculados` },
          record.enRiesgo > 0 ? { label: `${record.enRiesgo} en riesgo` } : null,
        ].filter(Boolean)}
      />
    ),
  },
  {
    title: '% riesgo',
    key: 'pctRiesgo',
    width: 100,
    align: 'center',
    render: (_, record) => renderPct(record.pctRiesgo),
  },
  {
    title: '% reprobación',
    key: 'pctReprobacion',
    width: 120,
    align: 'center',
    render: (_, record) => renderPct(record.pctReprobacion),
  },
];

export default createPanelReprobacionColumns;
