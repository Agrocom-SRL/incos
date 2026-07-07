/**
 * Columnas — tab Aulas (CFG Recursos académicos). Columnas propias (no
 * `createSimpleCatalogTableColumns`: hay campos de negocio ricos — categoría,
 * capacidad, observaciones), máx 6 columnas, sin `fixed`:
 * # · Identidad · Categoría y capacidad · Observaciones · Estado · Acciones.
 *
 * El aula desactivada a propósito (`LAB-2 / Sala de Docentes`, capacidad=0)
 * se muestra con `StatusPill` inactivo (el listado ya pide `incluirInactivos`),
 * nunca se oculta.
 */
import { TagOutlined, TeamOutlined } from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, StatusPill, TruncatedTextCell } from '@atoms';
import { TableActions } from '@molecules';
import { aulaDetallePath, aulaEditarPath } from '@application-configuracion/recursos/config/paths';
import { getAulaCategoriaLabel } from '@application-configuracion/recursos/config/aulaCategoriaOptions';

export const createAulasTableColumns = ({ navigate, listNavState, refetch }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_v, _r, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Aula',
    dataIndex: 'nombre',
    ellipsis: true,
    render: (_nombre, record) => (
      <IdentidadCelda codigo={record.codigo} nombre={(record.nombre || 'Sin nombre').toUpperCase()} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Categoría y capacidad',
    key: 'categoriaCapacidad',
    width: 220,
    render: (_, record) => (
      <InfoLinesCell
        lines={[
          { icon: <TagOutlined />, label: getAulaCategoriaLabel(record.categoria) },
          {
            icon: <TeamOutlined />,
            label: record.capacidad != null ? `Capacidad: ${record.capacidad}` : null,
          },
        ]}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => (a.capacidad ?? 0) - (b.capacidad ?? 0),
  },
  {
    title: 'Observaciones',
    dataIndex: 'observaciones',
    width: 260,
    ellipsis: false,
    render: (observaciones) => <TruncatedTextCell text={observaciones} />,
  },
  {
    title: 'Estado',
    dataIndex: 'activo',
    key: 'activo',
    width: 110,
    align: 'center',
    sorter: true,
    sortCompare: (a, b) => Number(!!a.activo) - Number(!!b.activo),
    render: (activo) => (
      <StatusPill
        label={activo ? 'Activa' : 'Inactiva'}
        className={activo ? 'cfg-materia-pill cfg-materia-pill--activa' : 'cfg-materia-pill cfg-materia-pill--inactiva'}
      />
    ),
  },
  {
    title: 'Acciones',
    key: 'acciones',
    width: 140,
    align: 'right',
    render: (_, record) => {
      const nombre = (record.nombre || 'Sin nombre').toUpperCase();
      const itemDetails = [
        { label: 'Código', value: record.codigo },
        { label: 'Nombre', value: nombre },
        { label: 'Categoría', value: getAulaCategoriaLabel(record.categoria) },
        { label: 'Capacidad', value: record.capacidad != null ? String(record.capacidad) : null },
      ].filter((d) => d.value != null && d.value !== '');

      return (
        <TableActions
          record={record}
          navigate={navigate}
          onView={(r) => navigate(aulaDetallePath(r.id), { state: listNavState })}
          onEdit={(r) => navigate(aulaEditarPath(r.id), { state: listNavState })}
          useCaseKey="eliminarAula"
          refetch={refetch}
          itemName={`el aula ${record.codigo ? `${record.codigo} — ${nombre}` : nombre}`}
          itemDetails={itemDetails}
          permisos={{
            ver: { codigo: 'configuracion.aula', accion: 'DETALLE' },
            editar: { codigo: 'configuracion.aula', accion: 'EDITAR' },
            eliminar: { codigo: 'configuracion.aula', accion: 'ELIMINAR' },
          }}
        />
      );
    },
  },
];
