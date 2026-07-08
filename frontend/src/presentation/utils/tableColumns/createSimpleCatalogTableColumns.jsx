/**
 * Factory de columnas para catálogos simples de Configuración (nombre + descripción,
 * sin columnas de negocio propias). Plantilla exacta: `materiasTableColumns.jsx`
 * (Configuración → Académico), columnas `#`, identidad con `IdentidadCelda`,
 * `StatusPill` (vía extraColumns si el catálogo lo necesita) y `TableActions` con
 * `itemDetails` para el diálogo de borrado.
 *
 * Uso típico: catálogos como "Tipo de discapacidad", "Idioma", etc. — un único
 * permiso (`permisoCodigo`) para ver/editar/eliminar, sin columnas particulares.
 * Si el catálogo tiene columnas de negocio (estado, tipo, clasificación…), pásalas
 * en `extraColumns` (se insertan entre la identidad y las acciones).
 */
import { EstadoTogglePill, IdentidadCelda, TruncatedTextCell } from '@atoms';
import { TableActions } from '@molecules';

/** Un registro de catálogo se considera activo salvo `activo` explícitamente falso. */
const esRegistroActivo = (record) => record?.activo !== false && record?.activo !== 0;

/**
 * rowClassName para el TableListView de los catálogos con toggle de estado:
 * atenúa las filas inactivas (clase global `cfg-table-row--inactiva`, ver
 * `styles/components/atoms/table-cells.css`).
 */
export const catalogoEstadoRowClassName = (record) =>
  esRegistroActivo(record) ? '' : 'cfg-table-row--inactiva';

/**
 * Columna "Estado" con toggle rápido activo/inactivo (átomo `EstadoTogglePill`,
 * `PATCH /:id/estado` en el backend). Única fuente de la column def: la usa este
 * factory y los configs de columnas propias (Aulas, Paralelos) que no pasan por
 * `createSimpleCatalogTableColumns`.
 *
 * @param {Object} params
 * @param {string} params.permisoCodigo - Código de permiso (acción ACTIVAR), ej. 'configuracion.aula'
 * @param {Function} params.onToggle - (record, nuevoActivo) => Promise; persiste y recarga
 *   (viene del feature hook de la página). Sin permiso ACTIVAR la pill se renderiza estática.
 */
export const createCatalogoEstadoColumn = ({ permisoCodigo, onToggle }) => ({
  title: 'Estado',
  key: 'estado',
  width: 150,
  align: 'center',
  // `cfg-estado-col`: la celda de Estado no se atenúa en filas inactivas
  // (conserva la affordance de reactivación; ver table-cells.css).
  className: 'cfg-estado-col',
  render: (_, record) => (
    <EstadoTogglePill
      activo={esRegistroActivo(record)}
      permiso={permisoCodigo}
      accion="ACTIVAR"
      onToggle={(nuevoActivo) => onToggle(record, nuevoActivo)}
    />
  ),
  sorter: true,
  sortCompare: (a, b) => Number(esRegistroActivo(b)) - Number(esRegistroActivo(a)),
});

/**
 * @param {Object} params
 * @param {Function} params.navigate - Navegación (react-router)
 * @param {Object} [params.listNavState] - Estado a propagar al navegar a detalle/editar
 * @param {Function} [params.refetch] - Recargar el listado tras eliminar
 * @param {string} params.entidad - Texto humano singular, ej. 'el tipo de discapacidad'
 * @param {string} params.permisoCodigo - Código de permiso, ej. 'configuracion.complementario.discapacidad'
 * @param {Function} params.getDetallePath - (record) => string, ruta de detalle
 * @param {Function} params.getEditarPath - (record) => string, ruta de edición
 * @param {string} params.useCaseKey - Clave del use case de eliminación en el container
 * @param {string|null} [params.codigoField] - Campo de código mostrado en `IdentidadCelda` (si aplica)
 * @param {string|null} [params.descripcionField] - Campo de la columna secundaria "Descripción"
 *   (no reemplaza el nombre principal: `IdentidadCelda` siempre usa `record.nombre`)
 * @param {Array} [params.extraColumns] - Column defs adicionales, insertadas entre identidad y acciones
 * @param {Function} [params.itemDetailsExtra] - (record) => Array de detalles extra para el diálogo de borrado
 * @param {Object} [params.estadoToggle] - Opt-in de la columna "Estado" con toggle rápido
 *   activo/inactivo (átomo `EstadoTogglePill`, `PATCH /:id/estado` en el backend):
 *   `{ permisoCodigo?, onToggle }` donde `onToggle(record, nuevoActivo) => Promise` persiste
 *   el cambio y recarga el listado (viene del feature hook de la página). `permisoCodigo`
 *   (acción ACTIVAR) usa `params.permisoCodigo` por defecto. Sin permiso ACTIVAR la pill se
 *   renderiza estática. La columna se inserta entre `extraColumns` y "Acciones"; combinar
 *   con `catalogoEstadoRowClassName` en el `TableListView` para atenuar las filas inactivas.
 */
export const createSimpleCatalogTableColumns = ({
  navigate,
  listNavState,
  refetch,
  entidad,
  permisoCodigo,
  getDetallePath,
  getEditarPath,
  useCaseKey,
  codigoField = null,
  descripcionField = 'descripcion',
  extraColumns = [],
  itemDetailsExtra = () => [],
  estadoToggle = null,
}) => {
  const nombreColumn = {
    title: 'Nombre',
    dataIndex: 'nombre',
    ellipsis: true,
    render: (_nombre, record) => (
      <IdentidadCelda
        codigo={codigoField ? record[codigoField] : undefined}
        nombre={(record.nombre || 'Sin nombre').toUpperCase()}
      />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
  };

  const descripcionColumn = descripcionField
    ? {
        title: 'Descripción',
        dataIndex: descripcionField,
        width: 420,
        ellipsis: false,
        render: (valor) => <TruncatedTextCell text={valor} />,
        sorter: true,
        sortCompare: (a, b) =>
          (a[descripcionField] || '').localeCompare(b[descripcionField] || '', 'es', {
            sensitivity: 'base',
          }),
      }
    : null;

  const estadoColumn = estadoToggle
    ? createCatalogoEstadoColumn({
        permisoCodigo: estadoToggle.permisoCodigo || permisoCodigo,
        onToggle: estadoToggle.onToggle,
      })
    : null;

  const accionesColumn = {
    title: 'Acciones',
    key: 'acciones',
    width: 140,
    align: 'right',
    render: (_, record) => {
      const nombre = (record.nombre || 'Sin nombre').toUpperCase();
      const codigo =
        codigoField && record[codigoField] ? String(record[codigoField]).toUpperCase() : null;
      const itemName = codigo ? `${entidad} ${codigo} — ${nombre}` : `${entidad} ${nombre}`;
      const itemDetails = [
        { label: 'Nombre', value: nombre },
        codigoField ? { label: 'Código', value: codigo } : null,
        descripcionField ? { label: 'Descripción', value: record[descripcionField] } : null,
        ...itemDetailsExtra(record),
      ].filter((d) => d && d.value != null && d.value !== '' && d.value !== '—');

      return (
        <TableActions
          record={record}
          navigate={navigate}
          viewPath="/:id"
          onView={(r) => navigate(getDetallePath(r), { state: listNavState })}
          onEdit={(r) => navigate(getEditarPath(r), { state: listNavState })}
          useCaseKey={useCaseKey}
          refetch={refetch}
          itemName={itemName}
          itemDetails={itemDetails}
          permisos={{
            ver: { codigo: permisoCodigo, accion: 'DETALLE' },
            editar: { codigo: permisoCodigo, accion: 'EDITAR' },
            eliminar: { codigo: permisoCodigo, accion: 'ELIMINAR' },
          }}
        />
      );
    },
  };

  return [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    nombreColumn,
    ...(descripcionColumn ? [descripcionColumn] : []),
    ...extraColumns,
    ...(estadoColumn ? [estadoColumn] : []),
    accionesColumn,
  ];
};
