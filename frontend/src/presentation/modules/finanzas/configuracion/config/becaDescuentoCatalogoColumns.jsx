/**
 * Columnas de la tabla del catálogo maestro Becas y descuentos (Config. de
 * pagos · Finanzas, tab "Becas y descuentos"). NOTA: nombre de archivo
 * distinto a `becasTableColumns.jsx` (a propósito, ya existen dos archivos con
 * ese nombre en el proyecto — `estudiantes/config/` y `finanzas/reportes/config/`
 * — para las becas ASIGNADAS a estudiantes; este es el CATÁLOGO maestro).
 *
 * Columnas propias (no `createSimpleCatalogTableColumns`: hay campos de
 * negocio ricos), máx 6, sin `fixed`: # · Identidad · Porcentaje · Reglas ·
 * Estado · Acciones.
 */

import { Flex } from 'antd';
import { IdentidadCelda, StatusPill } from '@atoms';
import { TableActions } from '@molecules';
import { getActivoPill } from './configPagosPills';
import { BECA_DESCUENTO_PERMISO } from './becaDescuentoPermisos';

const TIPO_AUTOMATICA_LABEL = {
  PROMEDIO_90: 'Por promedio (≥ 90)',
  MANUAL: 'Manual',
};

/** Pills de reglas de aplicación (solo las que apliquen). */
const renderReglas = (record) => {
  const pills = [
    record.requiereDocumentacion
      ? { key: 'doc', label: 'Requiere documentación', className: 'cfg-pagos-pill cfg-pagos-pill--neutral' }
      : null,
    record.requiereAprobacionRector
      ? { key: 'rector', label: 'Requiere Rector', className: 'cfg-pagos-pill cfg-pagos-pill--neutral' }
      : null,
    record.esAutomatica
      ? {
          key: 'auto',
          label: `Automática: ${TIPO_AUTOMATICA_LABEL[record.tipoAutomatica] || record.tipoAutomatica || '—'}`,
          className: 'cfg-pagos-pill cfg-pagos-pill--activo',
        }
      : null,
  ].filter(Boolean);

  if (!pills.length) return <span className="sd-field__value">—</span>;

  return (
    <Flex vertical align="flex-start" gap={4}>
      {pills.map((pill) => (
        <StatusPill key={pill.key} label={pill.label} className={pill.className} />
      ))}
    </Flex>
  );
};

/**
 * Crea las columnas del catálogo maestro de becas y descuentos.
 * @param {Object} args
 * @param {Function} args.onVer - (record) => void (navega a la ficha de detalle)
 * @param {Function} args.onEditar - (record) => void (navega al formulario de edición)
 * @param {Function} [args.eliminarBeca] - (id) => Promise<{success, error?}>
 * @param {Function} [args.refetch] - recarga el catálogo tras eliminar.
 * @returns {Array}
 */
export const createBecaDescuentoCatalogoColumns = ({ onVer, onEditar, eliminarBeca, refetch }) => [
  {
    title: '#',
    key: 'nro',
    width: 56,
    align: 'center',
    render: (_value, _record, index, rowOffset = 0) => rowOffset + index + 1,
  },
  {
    title: 'Identidad',
    dataIndex: 'nombre',
    key: 'identidad',
    ellipsis: true,
    render: (_nombre, record) => (
      <IdentidadCelda codigo={record.codigo} nombre={(record.nombre || '—').toUpperCase()} />
    ),
    sorter: true,
    sortCompare: (a, b) =>
      (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }),
  },
  {
    title: 'Porcentaje',
    dataIndex: 'porcentaje',
    key: 'porcentaje',
    width: 130,
    align: 'center',
    sorter: true,
    sortCompare: (a, b) => (a.porcentaje ?? 0) - (b.porcentaje ?? 0),
    render: (porcentaje) =>
      porcentaje != null ? (
        <StatusPill label={`${porcentaje}%`} className="cfg-pagos-pill cfg-pagos-pill--neutral" />
      ) : (
        '—'
      ),
  },
  {
    title: 'Reglas',
    key: 'reglas',
    render: (_, record) => renderReglas(record),
  },
  {
    title: 'Estado',
    dataIndex: 'activo',
    key: 'activo',
    width: 120,
    align: 'center',
    sorter: true,
    sortCompare: (a, b) => Number(!!a.activo) - Number(!!b.activo),
    render: (activo) => {
      const pill = getActivoPill(!!activo);
      return <StatusPill label={pill.label} className={pill.className} />;
    },
  },
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
