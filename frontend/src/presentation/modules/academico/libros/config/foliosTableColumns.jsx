/**
 * Columnas de la tabla de folios de un libro (ficha `LibroDetailPage` y
 * página de anulados `LibroAnuladosPage`).
 *
 * En la ficha (tabs por carrera, `LibroFoliosSection`) NO se repite la
 * columna "Carrera": es redundante, toda la pestaña es de una sola carrera.
 * En la página de anulados (lista plana, sin tabs) SÍ hace falta —
 * `showCarrera`— y además se agrega el motivo de anulación —`showMotivo`—
 * (queda guardado en `observaciones` al anular).
 *
 * Ver navega al preview del folio (`ACA-LIBROS-FOLIO`, permiso DETALLE);
 * Anular vive en el preview, no en esta fila (TableActions fail-closed: sin
 * permiso explícito, la acción no se pinta).
 */

import { CarreraDotCell, IdentidadCelda, StatusPill } from '@atoms';
import { TableActions, TableCell } from '@molecules';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import { LIBROS_PERMISOS } from '@application-academico/libros/utils/librosPermisos';
import {
  formatFolioEstadoDisplay,
  getFolioEstadoDisplayPillClass,
} from '@application-academico/libros/utils/librosEstados';

/**
 * @param {Object} params
 * @param {(record: Object) => void} params.onView
 * @param {boolean} [params.showCarrera] - Columna "Carrera" (lista plana sin tabs).
 * @param {boolean} [params.showMotivo] - Columna "Motivo" (observaciones del folio anulado).
 * @param {string} [params.libroEstado] - Estado del LIBRO (ABIERTO/CERRADO), para
 *        reconciliar la columna "Estado" — ver `formatFolioEstadoDisplay`.
 */
export const createFoliosTableColumns = ({
  onView,
  showCarrera = false,
  showMotivo = false,
  libroEstado = null,
}) => [
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
  ...(showCarrera
    ? [
        {
          title: 'Carrera',
          key: 'carrera',
          width: 200,
          render: (_, record) => (
            <CarreraDotCell
              nombre={record.carreraCodigo || record.carreraNombre}
              colorHex={sanitizeDocenteColorHex(record.carreraColorHex)}
            />
          ),
          sorter: (a, b) => (a.carreraNombre || '').localeCompare(b.carreraNombre || ''),
        },
      ]
    : []),
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
      <StatusPill
        label={formatFolioEstadoDisplay(estado, libroEstado)}
        className={getFolioEstadoDisplayPillClass(estado, libroEstado)}
      />
    ),
  },
  ...(showMotivo
    ? [
        {
          title: 'Motivo',
          dataIndex: 'observaciones',
          render: (motivo) => <TableCell>{motivo || '—'}</TableCell>,
        },
      ]
    : []),
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
