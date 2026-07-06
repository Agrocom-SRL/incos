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
import { IdentidadCelda } from '@atoms';
import { TableActions, TableCell } from '@molecules';

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
}) => {
  const nombreColumn = {
    title: 'Nombre',
    dataIndex: 'nombre',
    fixed: 'left',
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
        ellipsis: true,
        render: (valor) => <TableCell fallback="—">{valor}</TableCell>,
        sorter: true,
        sortCompare: (a, b) =>
          (a[descripcionField] || '').localeCompare(b[descripcionField] || '', 'es', {
            sensitivity: 'base',
          }),
      }
    : null;

  const accionesColumn = {
    title: 'Acciones',
    key: 'acciones',
    fixed: 'right',
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
    accionesColumn,
  ];
};
