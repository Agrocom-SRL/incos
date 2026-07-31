/**
 * Columnas de la tabla de materias del drawer de detalle por estudiante
 * (módulo TUT · `alertaEstudiante`, A3: todas las materias de la gestión del
 * estudiante — filas de la vista 156, no solo las que están en riesgo).
 *
 * Tabla compacta (size small, sin paginación): materia + docente, los cuatro
 * bimestres y el promedio con rojo semántico bajo el umbral (NotaRiesgoText)
 * y la situación con las pills del kit.
 */

import { Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { InfoLinesCell, StatusPill } from '@atoms';
import { RIESGO_PILL_CLASS, SIN_RIESGO_PILL_CLASS } from '@application-academico/acompanamiento/utils/acompanamientoPills';
import NotaRiesgoText from '@academico/acompanamiento/components/atoms/NotaRiesgoText';

const { Text } = Typography;

/** Columna numérica compacta de un bimestre (B1..B4). */
const bimestreColumn = (numero) => ({
  title: `B${numero}`,
  key: `bim${numero}`,
  width: 56,
  align: 'center',
  render: (_, record) => (
    <NotaRiesgoText nota={record[`bim${numero}`]} umbral={record.umbralRiesgo} />
  ),
});

export const createAlertaEstudianteMateriasColumns = () => [
  {
    title: 'Materia',
    key: 'materia',
    render: (_, record) => (
      <>
        <Text strong>{record.materiaNombre || '—'}</Text>
        <InfoLinesCell lines={[{ icon: <UserOutlined />, label: record.docenteNombre }]} />
      </>
    ),
  },
  bimestreColumn(1),
  bimestreColumn(2),
  bimestreColumn(3),
  bimestreColumn(4),
  {
    title: 'Prom.',
    key: 'promedioAnual',
    width: 70,
    align: 'center',
    render: (_, record) => (
      <NotaRiesgoText nota={record.promedioAnual} umbral={record.umbralRiesgo} strong />
    ),
  },
  {
    title: 'Situación',
    key: 'situacion',
    width: 120,
    align: 'center',
    render: (_, record) =>
      record.enRiesgo ? (
        <StatusPill label="En riesgo" className={RIESGO_PILL_CLASS} />
      ) : (
        <StatusPill label="Regular" className={SIN_RIESGO_PILL_CLASS} />
      ),
  },
];

export default createAlertaEstudianteMateriasColumns;
