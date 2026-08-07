/**
 * Columnas del listado institucional de alertas de riesgo pedagógico
 * (módulo ACA · `alertasRiesgo`, vista 156 con grano estudiante×materia).
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
import { ACOMPANAMIENTO_PERMISOS } from '@application-academico/acompanamiento/utils/acompanamientoPermisos';
import {
  formatSituacionRiesgo,
  getSituacionRiesgoPillClass,
} from '@application-academico/acompanamiento/utils/acompanamientoPills';
import NotaRiesgoText from '@academico/acompanamiento/components/atoms/NotaRiesgoText';

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
    title: 'Asistencia',
    key: 'pctAsistenciaUltimoBimestre',
    width: 110,
    align: 'center',
    render: (_, record) => (
      <NotaRiesgoText
        nota={record.pctAsistenciaUltimoBimestre}
        umbral={record.umbralAsistencia}
        suffix="%"
      />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.pctAsistenciaUltimoBimestre ?? -1) - (b.pctAsistenciaUltimoBimestre ?? -1),
  },
  {
    title: 'Situación',
    key: 'situacion',
    width: 170,
    align: 'center',
    render: (_, record) => (
      <StatusPill label={formatSituacionRiesgo(record)} className={getSituacionRiesgoPillClass(record)} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      Number(a.enRiesgo || a.enRiesgoAsistencia) - Number(b.enRiesgo || b.enRiesgoAsistencia),
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
          ver: { codigo: ACOMPANAMIENTO_PERMISOS.alerta, accion: 'DETALLE' },
        }}
      />
    ),
  },
];

export default createAlertasRiesgoTableColumns;
