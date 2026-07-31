/**
 * Columnas del listado institucional de alertas de riesgo pedagógico
 * (módulo TUT · `alertasRiesgo`, vista 156 con grano estudiante×materia).
 *
 * Lenguaje visual del prototipo de listado (incos-ui-system §4): numeración +
 * IdentidadCelda (C.I. + APELLIDOS NOMBRES vía buildFullName en el mapper) +
 * CarreraDotCell + InfoLinesCell + notas con rojo semántico (NotaRiesgoText) +
 * StatusPill del kit. Ordenamiento en CLIENTE (modo loadAll): `sortCompare`.
 * Única acción: abrir el drawer de detalle por estudiante (alerta·DETALLE).
 */

import { BookOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { CarreraDotCell, IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import { TableActions } from '@molecules';
import { TUTORIAS_PERMISOS } from '@application-tutorias/utils/tutoriasPermisos';
import { RIESGO_PILL_CLASS, SIN_RIESGO_PILL_CLASS } from '@application-tutorias/utils/tutoriasPills';
import NotaRiesgoText from '@tutorias/acompanamiento/components/atoms/NotaRiesgoText';

/** Etiqueta del curso: año + paralelo (grano anual del instituto). */
const cursoLabel = (record) =>
  [record.anio != null ? `${record.anio}° año` : null, record.paraleloLabel]
    .filter(Boolean)
    .join(' · ') || null;

export const createAlertasRiesgoTableColumns = ({ onVerEstudiante }) => [
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
    sorter: true,
    sortCompare: (a, b) =>
      (a.estudianteNombre || '').localeCompare(b.estudianteNombre || '', 'es', {
        sensitivity: 'base',
      }),
    defaultSortOrder: 'ascend',
  },
  {
    title: 'Carrera',
    key: 'carrera',
    width: 180,
    render: (_, record) => (
      <CarreraDotCell nombre={record.carreraNombre} colorHex={record.carreraColorHex} />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.carreraNombre || '').localeCompare(b.carreraNombre || '', 'es'),
  },
  {
    title: 'Materia y curso',
    key: 'materiaCurso',
    width: 230,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          { icon: <BookOutlined />, label: record.materiaNombre },
          { icon: <TeamOutlined />, label: cursoLabel(record) },
          { icon: <UserOutlined />, label: record.docenteNombre },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.materiaNombre || '').localeCompare(b.materiaNombre || '', 'es'),
  },
  {
    title: 'Último bim.',
    key: 'notaUltimoBimestre',
    width: 110,
    align: 'center',
    render: (_, record) => (
      <NotaRiesgoText nota={record.notaUltimoBimestre} umbral={record.umbralRiesgo} strong />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.notaUltimoBimestre ?? -1) - (b.notaUltimoBimestre ?? -1),
  },
  {
    title: 'Promedio',
    key: 'promedioAnual',
    width: 100,
    align: 'center',
    render: (_, record) => (
      <NotaRiesgoText nota={record.promedioAnual} umbral={record.umbralRiesgo} />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.promedioAnual ?? -1) - (b.promedioAnual ?? -1),
  },
  {
    title: 'Situación',
    key: 'situacion',
    width: 140,
    align: 'center',
    render: (_, record) =>
      record.enRiesgo ? (
        <StatusPill label={`En riesgo (< ${record.umbralRiesgo})`} className={RIESGO_PILL_CLASS} />
      ) : (
        <StatusPill label="Regular" className={SIN_RIESGO_PILL_CLASS} />
      ),
    sorter: true,
    sortCompare: (a, b) => Number(a.enRiesgo) - Number(b.enRiesgo),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 90,
    align: 'right',
    render: (_, record) => (
      <TableActions
        record={record}
        onView={() => onVerEstudiante(record)}
        permisos={{
          ver: { codigo: TUTORIAS_PERMISOS.alerta, accion: 'DETALLE' },
        }}
      />
    ),
  },
];

export default createAlertasRiesgoTableColumns;
