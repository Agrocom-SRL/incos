/**
 * Columnas — listado unificado de documentación (los 9 tipos del ENUM en una
 * sola pantalla). Columnas propias (no `createSimpleCatalogTableColumns`,
 * precedente `aulasTableColumns.jsx`: la celda de nombre lleva el nivel
 * base/reemplazo debajo y el tipo tiene celda rica propia):
 *
 *   # · Documento (nombre + nivel) · Tipo y descripción · Requisitos · Estado · Acciones.
 *
 * Columna "Estado" = toggle rápido activo/inactivo (`createCatalogoEstadoColumn`,
 * átomo `EstadoTogglePill`, permiso ACTIVAR de `configuracion.documentacion`).
 * El documento desactivado nunca se oculta (el listado pide `incluirInactivos`);
 * combinar con `catalogoEstadoRowClassName` en la página.
 */
import { TableActions } from '@molecules';
import { createCatalogoEstadoColumn } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import {
  documentacionDetallePath,
  documentacionEditarPath,
} from '@application-configuracion/documentacion/config/paths';
import { getTipoDocumentoLabel } from '@application-configuracion/documentacion/config/tipos';
import DocumentacionNombreCell from '@configuracion/documentacion/components/atoms/DocumentacionNombreCell';
import DocumentacionTipoDescripcionCell from '@configuracion/documentacion/components/atoms/DocumentacionTipoDescripcionCell';
import DocumentacionRequisitosCell from '@configuracion/documentacion/components/atoms/DocumentacionRequisitosCell';

/** Documento BASE = sin padre (primer orden); con padre = reemplazo (segundo orden). */
const esDocumentoBase = (record) => record?.documentoPadreId == null;

export const createDocumentacionTableColumns = ({ navigate, listNavState, refetch, toggleEstado }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_v, _r, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Documento',
    dataIndex: 'nombre',
    width: 320,
    // Sin `ellipsis` de AntD (fuerza una sola línea nowrap): el nombre largo se
    // corta a 2 líneas vía clamp en la celda (`cfg-doc-nombre`, table-cells.css).
    render: (_nombre, record) => (
      <DocumentacionNombreCell nombre={record.nombre} esBase={esDocumentoBase(record)} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Tipo y descripción',
    key: 'tipoDescripcion',
    width: 360,
    ellipsis: false,
    render: (_, record) => (
      <DocumentacionTipoDescripcionCell
        tipoDocumento={record.tipoDocumento}
        descripcion={record.descripcion}
      />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      getTipoDocumentoLabel(a.tipoDocumento).localeCompare(
        getTipoDocumentoLabel(b.tipoDocumento),
        'es',
        { sensitivity: 'base' },
      ),
  },
  {
    title: 'Requisitos',
    key: 'requisitos',
    width: 180,
    render: (_, record) => (
      <DocumentacionRequisitosCell
        requerido={record.requerido !== false}
        aceptaFotocopia={Boolean(record.aceptaFotocopia)}
      />
    ),
    sorter: true,
    sortCompare: (a, b) => Number(b.requerido !== false) - Number(a.requerido !== false),
  },
  // Columna "Estado" con toggle rápido (permiso ACTIVAR de configuracion.documentacion)
  ...(toggleEstado
    ? [
      createCatalogoEstadoColumn({
        permisoCodigo: 'configuracion.documentacion',
        onToggle: toggleEstado,
      }),
    ]
    : []),
  {
    title: 'Acciones',
    key: 'acciones',
    width: 140,
    align: 'right',
    render: (_, record) => {
      const nombre = (record.nombre || 'Sin nombre').toUpperCase();
      const itemDetails = [
        { label: 'Nombre', value: nombre },
        { label: 'Tipo', value: getTipoDocumentoLabel(record.tipoDocumento) },
        { label: 'Nivel', value: esDocumentoBase(record) ? 'Documento base' : 'Reemplazo' },
        { label: 'Requerido', value: record.requerido !== false ? 'Sí' : 'No' },
        { label: 'Acepta fotocopia', value: record.aceptaFotocopia ? 'Sí' : 'No' },
        { label: 'Descripción', value: record.descripcion },
      ].filter((d) => d.value != null && d.value !== '');

      return (
        <TableActions
          record={record}
          navigate={navigate}
          onView={(r) => navigate(documentacionDetallePath(r.id), { state: listNavState })}
          onEdit={(r) => navigate(documentacionEditarPath(r.id), { state: listNavState })}
          useCaseKey="eliminarDocumentacion"
          refetch={refetch}
          itemName={`el documento ${nombre}`}
          itemDetails={itemDetails}
          permisos={{
            ver: { codigo: 'configuracion.documentacion', accion: 'DETALLE' },
            editar: { codigo: 'configuracion.documentacion', accion: 'EDITAR' },
            eliminar: { codigo: 'configuracion.documentacion', accion: 'ELIMINAR' },
          }}
        />
      );
    },
  },
];
