/**
 * Columnas del listado de libros de registro (patrón Docentes/CFG carreras).
 *
 * Fila = 1 libro (por gestión, compartido por las 3 carreras del instituto).
 * Ver navega a la ficha (`ACA-LIBROS-DETALLE`, permiso DETALLE); no hay
 * editar/eliminar de fila (la cabecera se edita/cierra desde la propia ficha;
 * un libro no se elimina).
 */

import { IdentidadCelda, StatusPill } from '@atoms';
import { TableActions, TableCell } from '@molecules';
import { libroDetallePath } from '@application-academico/libros/utils/librosPaths';
import { LIBROS_PERMISOS } from '@application-academico/libros/utils/librosPermisos';
import {
  formatLibroEstado,
  getLibroEstadoPillClass,
} from '@application-academico/libros/utils/librosEstados';

/**
 * @param {Object} params
 * @param {(path: string) => void} params.navigate
 */
export const createLibrosTableColumns = ({ navigate }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index) => index + 1,
  },
  {
    title: 'Libro',
    dataIndex: 'numeroLibro',
    ellipsis: true,
    render: (_numero, record) => (
      <IdentidadCelda
        codigo={record.numeroLibro != null ? `LIBRO N° ${record.numeroLibro}` : null}
        nombre={record.carrerasConFolio || 'Sin folios generados'}
      />
    ),
    sorter: (a, b) => (Number(a.numeroLibro) || 0) - (Number(b.numeroLibro) || 0),
  },
  {
    title: 'Gestión',
    key: 'gestion',
    width: 160,
    render: (_, record) => (
      <TableCell>{record.gestionNombre || (record.gestionAnio ? `Gestión ${record.gestionAnio}` : '—')}</TableCell>
    ),
    sorter: (a, b) => (Number(a.gestionAnio) || 0) - (Number(b.gestionAnio) || 0),
  },
  {
    title: 'Código de registro',
    dataIndex: 'codigoRegistro',
    width: 170,
    render: (codigo) => <TableCell>{codigo || '—'}</TableCell>,
  },
  {
    title: 'Folios',
    key: 'folios',
    width: 190,
    render: (_, record) => (
      <TableCell subtext={`Anulados ${record.foliosAnulados ?? 0}`}>
        {record.totalFolios ?? 0}
      </TableCell>
    ),
    sorter: (a, b) => (Number(a.totalFolios) || 0) - (Number(b.totalFolios) || 0),
  },
  {
    title: 'Estudiantes',
    dataIndex: 'totalEstudiantes',
    width: 120,
    align: 'center',
    render: (valor) => <TableCell align="center">{valor ?? 0}</TableCell>,
  },
  {
    title: 'Estado',
    dataIndex: 'estado',
    width: 130,
    render: (estado) => (
      <StatusPill label={formatLibroEstado(estado)} className={getLibroEstadoPillClass(estado)} />
    ),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 90,
    align: 'right',
    render: (_, record) => (
      <TableActions
        record={record}
        onView={() => navigate(libroDetallePath(record.id))}
        permisos={{ ver: { codigo: LIBROS_PERMISOS.libro, accion: 'DETALLE' } }}
      />
    ),
  },
];

export default createLibrosTableColumns;
