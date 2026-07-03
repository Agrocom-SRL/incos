/**
 * misEstudiantesDocenteColumns — columnas de "Mis estudiantes"
 * (rama DOCENTE del ítem Matrículas: `MisEstudiantesDocentePage`).
 *
 * Lenguaje visual del prototipo de listado (incos-ui-system §4): `#` numérico +
 * `IdentidadCelda` (código + APELLIDOS NOMBRES, ya compuestos por el hook con
 * `buildFullName`) + `InfoLinesCell` (C.I.) + `StatusPill` (estado de matrícula)
 * + `TableActions` con única acción "ver" fail-closed (`matricula.admision.ver`
 * DETALLE: el docente solo accede a la ficha de SUS estudiantes; el guard fino
 * vive en el backend). Sin estilos inline sueltos ni `Space orientation` (deprecado).
 */

import { IdcardOutlined } from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, StatusPill } from '@atoms';
import { TableActions } from '@molecules';

/** Estado de matrícula → clase de pill semántica (mismo criterio que estudiantes). */
const getEstadoMatriculaPillClass = (estado) => {
  const e = String(estado || '').toUpperCase();
  if (/ACTIV|REGULAR|VIGENTE|INSCRIT/.test(e)) return 'cfg-materia-pill cfg-materia-pill--success';
  if (/EGRES|GRADU|CONCLU/.test(e)) return 'cfg-materia-pill cfg-materia-pill--info';
  if (/RETIR|ABANDON|BAJA|ANUL/.test(e)) return 'cfg-materia-pill cfg-materia-pill--danger';
  if (/SUSP|PEND|MORA|CONGEL/.test(e)) return 'cfg-materia-pill cfg-materia-pill--warning';
  return 'cfg-materia-pill cfg-materia-pill--default';
};

/** C.I. completo (número + expedición) desde la fila normalizada. */
const getCiCompleto = (record) =>
  [record.ci, record.expedicion].filter(Boolean).join(' ') || null;

/**
 * Crea las columnas del roster "Mis estudiantes" del docente.
 *
 * @param {Function} navigate - navigate de react-router (para TableActions).
 * @returns {Array} columnas de tabla (TableListView / CarreraTabsListView).
 */
export const createMisEstudiantesDocenteColumns = (navigate) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  // Identidad: código + APELLIDO_PATERNO APELLIDO_MATERNO NOMBRES (§4b).
  {
    title: 'Estudiante',
    key: 'estudiante',
    ellipsis: true,
    responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
    render: (_, record) => (
      <IdentidadCelda
        codigo={record.codigoEstudiante || null}
        nombre={(record.nombreCompleto || 'Sin nombre').toUpperCase()}
      />
    ),
    sorter: (a, b) =>
      String(a.nombreCompleto || '').localeCompare(String(b.nombreCompleto || ''), 'es', {
        sensitivity: 'base',
      }),
    defaultSortOrder: 'ascend',
  },
  {
    title: 'C.I.',
    key: 'ci',
    width: 160,
    responsive: ['sm', 'md', 'lg', 'xl', 'xxl'],
    render: (_, record) => (
      <InfoLinesCell lines={[{ icon: <IdcardOutlined />, label: getCiCompleto(record) || '—' }]} />
    ),
    sorter: (a, b) =>
      String(getCiCompleto(a) || '').localeCompare(String(getCiCompleto(b) || ''), 'es', {
        numeric: true,
      }),
  },
  {
    title: 'Estado matrícula',
    key: 'estadoMatricula',
    width: 170,
    responsive: ['md', 'lg', 'xl', 'xxl'],
    render: (_, record) => (
      <StatusPill
        label={record.estadoMatricula}
        className={getEstadoMatriculaPillClass(record.estadoMatricula)}
      />
    ),
    sorter: (a, b) =>
      String(a.estadoMatricula || '').localeCompare(String(b.estadoMatricula || ''), 'es', {
        sensitivity: 'base',
      }),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 90,
    align: 'right',
    responsive: ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'],
    render: (_, record) => (
      <TableActions
        record={record}
        navigate={navigate}
        viewPath="/estudiantes/:id"
        permisos={{
          // Rama docente: el DOCENTE tiene `matricula.admision.ver` DETALLE
          // (sin LISTAR) para la ficha de SUS estudiantes; el backend restringe
          // por asignación. Fail-closed sin el permiso.
          ver: { codigo: 'matricula.admision.ver', accion: 'DETALLE' },
        }}
      />
    ),
  },
];

export default createMisEstudiantesDocenteColumns;
