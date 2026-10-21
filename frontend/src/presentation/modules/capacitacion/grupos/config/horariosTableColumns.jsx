/**
 * Columnas del listado de horarios de capacitación (módulo CAP).
 *
 * Lenguaje visual de ParticipantesList/CursosList: numeración + celdas simples
 * + StatusPill (cursos en uso) + TableActions (editar/eliminar con
 * confirmación; el 409 del backend —horario en uso— llega como mensaje).
 * Orden en cliente (modo loadAll): cada columna ordenable declara `sortCompare`.
 */

import { StatusPill } from '@atoms';
import { TableActions } from '@molecules';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import { ordenDia } from '@application-capacitacion/utils/horarioCapacitacion';

const CURSOS_EN_USO_PILL = 'cfg-materia-pill cfg-materia-pill--info';
const SIN_USO_PILL = 'cfg-materia-pill cfg-materia-pill--default';

const labelCursosEnUso = (n) => `${n} ${n === 1 ? 'curso' : 'cursos'}`;

export const createHorariosTableColumns = ({ onEditar, deleteFn, refetch }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Día',
    dataIndex: 'dia',
    key: 'dia',
    width: 140,
    render: (dia) => dia || '—',
    sorter: true,
    sortCompare: (a, b) => ordenDia(a.dia) - ordenDia(b.dia),
  },
  {
    title: 'Hora inicio',
    dataIndex: 'horaInicio',
    key: 'horaInicio',
    width: 120,
    render: (v) => v || '—',
    sorter: true,
    sortCompare: (a, b) => (a.horaInicio || '').localeCompare(b.horaInicio || ''),
  },
  {
    title: 'Hora fin',
    dataIndex: 'horaFin',
    key: 'horaFin',
    width: 120,
    render: (v) => v || '—',
    sorter: true,
    sortCompare: (a, b) => (a.horaFin || '').localeCompare(b.horaFin || ''),
  },
  {
    title: 'Etiqueta',
    dataIndex: 'etiqueta',
    key: 'etiqueta',
    render: (v) => v || '—',
  },
  {
    title: 'Cursos que lo usan',
    dataIndex: 'cursosEnUso',
    key: 'cursosEnUso',
    width: 170,
    align: 'center',
    render: (n) => (
      <StatusPill label={labelCursosEnUso(n)} className={n > 0 ? CURSOS_EN_USO_PILL : SIN_USO_PILL} />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.cursosEnUso || 0) - (b.cursosEnUso || 0),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 120,
    align: 'right',
    render: (_, record) => (
      <TableActions
        record={record}
        refetch={refetch}
        deleteFn={deleteFn}
        itemName={`el horario ${record.etiqueta}`}
        itemDetails={[
          { label: 'Horario', value: record.etiqueta },
          { label: 'Cursos que lo usan', value: String(record.cursosEnUso) },
        ]}
        onEdit={() => onEditar(record)}
        editTitle="Editar horario"
        permisos={{
          editar: { codigo: CAPACITACION_PERMISOS.grupo, accion: 'EDITAR' },
          eliminar: { codigo: CAPACITACION_PERMISOS.grupo, accion: 'ELIMINAR' },
        }}
      />
    ),
  },
];
