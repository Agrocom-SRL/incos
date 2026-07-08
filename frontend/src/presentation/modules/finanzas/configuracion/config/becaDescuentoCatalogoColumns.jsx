/**
 * Columnas de la tabla del catálogo maestro Becas y descuentos (Config. de
 * pagos · Finanzas, tab "Becas y descuentos"). NOTA: nombre de archivo
 * distinto a `becasTableColumns.jsx` (a propósito, ya existen dos archivos con
 * ese nombre en el proyecto — `estudiantes/config/` y `finanzas/reportes/config/`
 * — para las becas ASIGNADAS a estudiantes; este es el CATÁLOGO maestro).
 *
 * Columnas propias (no `createSimpleCatalogTableColumns`: hay campos de
 * negocio ricos), sin `fixed`: # · Identidad · Descripción · Porcentaje ·
 * Reglas · Asignaciones · Estado · Acciones. Porcentaje con pill semántica
 * POR RANGO (`getPorcentajePill`), Reglas apiladas (`BecaReglasCell`, gemela
 * de DocumentacionRequisitosCell), «Asignaciones» = concurrencia de
 * estudiantes con la beca (`cantidadAsignaciones` del backend) y Estado con
 * toggle rápido (`createCatalogoEstadoColumn`, PATCH /:id/estado, ACTIVAR).
 */

import { TeamOutlined } from '@ant-design/icons';
import { IdentidadCelda, StatusPill, TruncatedTextCell } from '@atoms';
import { TableActions } from '@molecules';
import { createCatalogoEstadoColumn } from '@presentation/utils/tableColumns/createSimpleCatalogTableColumns';
import ConcurrenciaCell from '@finanzas/configuracion/components/atoms/ConcurrenciaCell';
import BecaReglasCell from '@finanzas/configuracion/components/atoms/BecaReglasCell';
import { getPorcentajePill } from './configPagosPills';
import { BECA_DESCUENTO_PERMISO } from './becaDescuentoPermisos';

/**
 * Crea las columnas del catálogo maestro de becas y descuentos.
 * @param {Object} args
 * @param {Function} args.onVer - (record) => void (navega a la ficha de detalle)
 * @param {Function} args.onEditar - (record) => void (navega al formulario de edición)
 * @param {Function} [args.eliminarBeca] - (id) => Promise<{success, error?}>
 * @param {Function} [args.refetch] - recarga el catálogo tras eliminar.
 * @param {Function} [args.onToggleEstado] - (record, nuevoActivo) => Promise (toggle de la columna Estado)
 * @returns {Array}
 */
export const createBecaDescuentoCatalogoColumns = ({
  onVer,
  onEditar,
  eliminarBeca,
  refetch,
  onToggleEstado,
}) => [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'identidad',
      width: 280,
      render: (_nombre, record) => (
        <IdentidadCelda codigo={record.codigo} nombre={(record.nombre || '—').toUpperCase()} />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Descripción',
      dataIndex: 'descripcion',
      key: 'descripcion',
      width: 260,
      ellipsis: false,
      render: (descripcion) => <TruncatedTextCell text={descripcion} />,
      sorter: true,
      sortCompare: (a, b) =>
        (a.descripcion || '').localeCompare(b.descripcion || '', 'es', { sensitivity: 'base' }),
    },
    {
      title: 'Porcentaje',
      dataIndex: 'porcentaje',
      key: 'porcentaje',
      width: 120,
      align: 'center',
      sorter: true,
      sortCompare: (a, b) => (a.porcentaje ?? 0) - (b.porcentaje ?? 0),
      render: (porcentaje, descripcion) => {
        const pill = getPorcentajePill(porcentaje);
        return pill ?
          <>
            <TruncatedTextCell text={descripcion} />
            <StatusPill label={pill.label} className={pill.className} />
          </>
          : '—';
      },
    },
    {
      title: 'Reglas',
      key: 'reglas',
      render: (_, record) => (
        <BecaReglasCell
          esAutomatica={record.esAutomatica}
          promedioMinimo={record.promedioMinimo}
          tipoAutomatica={record.tipoAutomatica}
          requiereDocumentacion={record.requiereDocumentacion}
          requiereAprobacionRector={record.requiereAprobacionRector}
        />
      ),
    },
    {
      title: 'Asignaciones',
      key: 'asignaciones',
      width: 160,
      render: (_, record) => (
        <ConcurrenciaCell
          lineas={[
            {
              key: 'estudiantes',
              icon: <TeamOutlined />,
              cantidad: record.cantidadAsignaciones,
              singular: 'estudiante',
              plural: 'estudiantes',
            },
          ]}
        />
      ),
      sorter: true,
      sortCompare: (a, b) =>
        (Number(a.cantidadAsignaciones) || 0) - (Number(b.cantidadAsignaciones) || 0),
    },
    ...(onToggleEstado
      ? [
        createCatalogoEstadoColumn({
          permisoCodigo: BECA_DESCUENTO_PERMISO,
          onToggle: onToggleEstado,
        }),
      ]
      : []),
    {
      title: 'Acciones',
      key: 'acciones',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <TableActions
          record={record}
          refetch={refetch}
          onView={() => onVer?.(record)}
          onEdit={() => onEditar?.(record)}
          editTitle="Editar beca o descuento"
          deleteFn={eliminarBeca ? (id) => eliminarBeca(id) : null}
          itemName={record.nombre ? `la beca o descuento ${record.nombre}` : 'esta beca o descuento'}
          permisos={{
            ver: { codigo: BECA_DESCUENTO_PERMISO, accion: 'DETALLE' },
            editar: { codigo: BECA_DESCUENTO_PERMISO, accion: 'EDITAR' },
            eliminar: { codigo: BECA_DESCUENTO_PERMISO, accion: 'ELIMINAR' },
          }}
        />
      ),
    },
  ];

export default createBecaDescuentoCatalogoColumns;
