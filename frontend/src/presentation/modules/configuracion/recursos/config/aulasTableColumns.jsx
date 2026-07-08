/**
 * Columnas — tab Aulas (CFG Recursos académicos). Columnas propias (no
 * `createSimpleCatalogTableColumns`: hay campos de negocio ricos — categoría,
 * capacidad, observaciones), máx 6 columnas, sin `fixed`:
 * # · Identidad · Categoría y capacidad · Observaciones · Estado · Acciones.
 *
 * Columna "Estado" = toggle rápido activo/inactivo (`createCatalogoEstadoColumn`,
 * átomo `EstadoTogglePill`, permiso ACTIVAR de `configuracion.aula`). El aula
 * desactivada nunca se oculta (el listado pide `incluirInactivos`).
 */
import { TagOutlined, TeamOutlined } from '@ant-design/icons';
import { IdentidadCelda, InfoLinesCell, TruncatedTextCell } from '@atoms';
import { TableActions } from '@molecules';
import { createCatalogoEstadoColumn } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import { aulaDetallePath, aulaEditarPath } from '@application-configuracion/recursos/config/paths';
import { getAulaCategoriaLabel } from '@application-configuracion/recursos/config/aulaCategoriaOptions';

export const createAulasTableColumns = ({ navigate, listNavState, refetch, toggleEstado }) => [
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
    width: 360,
    ellipsis: false,
    render: (observaciones) => <TruncatedTextCell text={observaciones} />,
  },
  // Columna "Estado" con toggle rápido (permiso ACTIVAR de configuracion.aula)
  ...(toggleEstado
    ? [createCatalogoEstadoColumn({ permisoCodigo: 'configuracion.aula', onToggle: toggleEstado })]
    : []),
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
