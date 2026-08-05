/**
 * Columnas de la tabla de folios de un libro (ficha — `LibroDetailPage`).
 *
 * Fila = 1 folio (página del centralizador de un paralelo). La tabla vive
 * dentro de un tab de carrera (`LibroFoliosSection`), así que no repite la
 * columna "Carrera" (redundante: toda la pestaña es de una sola carrera).
 * Ver navega al preview del folio (`ACA-LIBROS-FOLIO`, permiso DETALLE);
 * Firmar/Anular viven en el preview, no en esta fila (TableActions
 * fail-closed: sin permiso explícito, la acción no se pinta).
 */

import { IdentidadCelda, StatusPill } from '@atoms';
import { TableActions, TableCell } from '@molecules';
import { LIBROS_PERMISOS } from '@application-academico/libros/utils/librosPermisos';
import {
  formatFolioEstado,
  getFolioEstadoPillClass,
} from '@application-academico/libros/utils/librosEstados';

/**
 * @param {Object} params
 * @param {(record: Object) => void} params.onView
 */
export const createFoliosTableColumns = ({ onView }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index) => index + 1,
  },
  {
    title: 'Folio',
    dataIndex: 'numeroFolio',
    ellipsis: true,
    render: (_numero, record) => (
      <IdentidadCelda
        codigo={record.numeroFolio != null ? `FOLIO N° ${record.numeroFolio}` : null}
        nombre={record.cursoLabel}
      />
    ),
    sorter: (a, b) => (Number(a.numeroFolio) || 0) - (Number(b.numeroFolio) || 0),
  },
  {
    title: 'Turno',
    dataIndex: 'turno',
    width: 130,
    render: (turno) => <TableCell>{turno || '—'}</TableCell>,
  },
  {
    title: 'Estudiantes',
    key: 'estudiantes',
    width: 280,
    render: (_, record) => (
      <TableCell
        subtext={`Aprobados ${record.totalAprobados ?? 0} · Reprobados ${record.totalReprobados ?? 0} · Abandonos ${record.totalAbandonos ?? 0}`}
      >
        {record.totalEstudiantes ?? 0}
      </TableCell>
    ),
  },
  {
    title: 'Estado',
    dataIndex: 'estado',
    width: 140,
    render: (estado) => (
      <StatusPill label={formatFolioEstado(estado)} className={getFolioEstadoPillClass(estado)} />
    ),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 100,
    align: 'right',
    render: (_, record) => (
      <TableActions
        record={record}
        onView={() => onView?.(record)}
        permisos={{ ver: { codigo: LIBROS_PERMISOS.libro, accion: 'DETALLE' } }}
      />
    ),
  },
];

export default createFoliosTableColumns;
