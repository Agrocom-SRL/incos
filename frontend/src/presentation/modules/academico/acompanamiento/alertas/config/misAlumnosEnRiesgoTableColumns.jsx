/**
 * Columnas de "Mis alumnos en riesgo" — rama DOCENTE del ítem Alumnos en
 * riesgo (módulo TUT · `misAlumnosEnRiesgo`, A2: el backend resuelve al
 * docente por token, la lista solo trae SUS cursos).
 *
 * Mismo lenguaje visual que la lista institucional, sin la columna de carrera
 * (los cursos del docente) y con la acción propia del rol: "Programar sesión"
 * de refuerzo con el alumno preseleccionado (sesion·CREAR, fail-closed).
 */

import { BookOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import { TableActions } from '@molecules';
import { TUTORIAS_PERMISOS } from '@application-academico/acompanamiento/utils/acompanamientoPermisos';
import { RIESGO_PILL_CLASS, SIN_RIESGO_PILL_CLASS } from '@application-academico/acompanamiento/utils/acompanamientoPills';
import NotaRiesgoText from '@academico/acompanamiento/components/atoms/NotaRiesgoText';

/** Etiqueta del curso: año + paralelo (grano anual del instituto). */
const cursoLabel = (record) =>
  [record.anio != null ? `${record.anio}° año` : null, record.paraleloLabel]
    .filter(Boolean)
    .join(' · ') || null;

export const createMisAlumnosEnRiesgoTableColumns = ({ onProgramarSesion }) => [
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
    width: 250,
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
    title: 'Materia y curso',
    key: 'materiaCurso',
    width: 230,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          { icon: <BookOutlined />, label: record.materiaNombre },
          { icon: <TeamOutlined />, label: cursoLabel(record) },
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
        extraActions={[
          {
            key: 'programarSesion',
            icon: <CalendarOutlined />,
            variant: 'view',
            tooltip: 'Programar sesión de refuerzo',
            permiso: TUTORIAS_PERMISOS.sesion,
            accion: 'CREAR',
            onClick: () => onProgramarSesion(record),
          },
        ]}
      />
    ),
  },
];

export default createMisAlumnosEnRiesgoTableColumns;
