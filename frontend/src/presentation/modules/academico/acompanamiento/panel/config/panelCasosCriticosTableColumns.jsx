/**
 * Columnas de la tabla de casos críticos del panel de acompañamiento
 * (módulo ACA · A10, sección `casosCriticos`: top de filas de la vista 156).
 *
 * Tabla de LECTURA (sin acciones): mismo lenguaje visual que la lista de
 * alertas — IdentidadCelda, CarreraDotCell, InfoLinesCell y notas con rojo
 * semántico (NotaRiesgoText). El seguimiento operativo vive en el ítem
 * "Alumnos en riesgo".
 */

import { BookOutlined, UserOutlined } from '@ant-design/icons';
import { CarreraDotCell, IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import { RIESGO_PILL_CLASS } from '@application-academico/acompanamiento/utils/acompanamientoPills';
import NotaRiesgoText from '@academico/acompanamiento/components/atoms/NotaRiesgoText';

export const createPanelCasosCriticosColumns = () => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Estudiante',
    key: 'estudiante',
    width: 240,
    render: (_, record) => (
      <IdentidadCelda
        codigo={record.ci || null}
        nombre={(record.estudianteNombre || 'Sin nombre').toUpperCase()}
      />
    ),
  },
  {
    title: 'Carrera',
    key: 'carrera',
    width: 180,
    render: (_, record) => (
      <CarreraDotCell nombre={record.carreraNombre} colorHex={record.carreraColorHex} />
    ),
  },
  {
    title: 'Materia y docente',
    key: 'materiaDocente',
    width: 230,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          { icon: <BookOutlined />, label: record.materiaNombre },
          { icon: <UserOutlined />, label: record.docenteNombre },
        ]}
      />
    ),
  },
  {
    title: 'Último bim.',
    key: 'notaUltimoBimestre',
    width: 110,
    align: 'center',
    render: (_, record) => (
      <NotaRiesgoText nota={record.notaUltimoBimestre} umbral={record.umbralRiesgo} strong />
    ),
  },
  {
    title: 'Promedio',
    key: 'promedioAnual',
    width: 100,
    align: 'center',
    render: (_, record) => (
      <NotaRiesgoText nota={record.promedioAnual} umbral={record.umbralRiesgo} />
    ),
  },
  {
    title: 'Situación',
    key: 'situacion',
    width: 130,
    align: 'center',
    render: (_, record) => (
      <StatusPill label={`En riesgo (< ${record.umbralRiesgo})`} className={RIESGO_PILL_CLASS} />
    ),
  },
];

export default createPanelCasosCriticosColumns;
