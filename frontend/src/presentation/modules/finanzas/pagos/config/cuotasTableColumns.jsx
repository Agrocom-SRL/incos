/**
 * Columnas de la tabla de cuotas de un pago de aporte (ficha — módulo Finanzas).
 *
 * Espejo de `tableColumns.jsx` del listado: columnas en archivo dedicado, celdas con
 * `TableCell`. Las acciones por fila (Recibo PDF [EXPORTAR] · Eliminar [ELIMINAR]) se
 * resuelven con permisos `finanzas.pago.*` resueltos en la página (fail-closed: si no
 * llega el handler, el botón no se pinta).
 */

import { Button, Space, Tooltip } from 'antd';
import { DeleteOutlined, EditOutlined, FilePdfOutlined } from '@ant-design/icons';
import { TableCell } from '@molecules';
import { Text } from '@atoms';

/** Formatea un monto en bolivianos (Bs 1.234,50). */
const formatBolivianos = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `Bs ${safe.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatFecha = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString('es-BO', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

/**
 * @param {Object} params
 * @param {boolean} params.puedeExportarRecibo - Permiso EXPORTAR (recibo PDF).
 * @param {boolean} params.puedeEditarCuota - Permiso EDITAR (cuota).
 * @param {boolean} params.puedeEliminarCuota - Permiso ELIMINAR (cuota).
 * @param {(cuota: Object) => void} params.onGenerarRecibo - Descarga el recibo PDF.
 * @param {(cuota: Object) => void} params.onEditarCuota - Abre el modal de edición de la cuota.
 * @param {(cuota: Object) => void} params.onEliminarCuota - Elimina la cuota (con confirmación).
 * @param {number|string|null} params.reciboCuotaId - Cuota cuyo recibo se descarga (feedback).
 * @param {boolean} params.descargandoRecibo - Estado de descarga global.
 */
export const createCuotasTableColumns = ({
  puedeExportarRecibo,
  puedeEditarCuota,
  puedeEliminarCuota,
  onGenerarRecibo,
  onEditarCuota,
  onEliminarCuota,
  reciboCuotaId,
  descargandoRecibo,
}) => {
  const columns = [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, _record, index) => index + 1,
    },
    {
      title: 'Recibo',
      key: 'numeroRecibo',
      width: 120,
      render: (_, record) => <TableCell>{record.numeroRecibo || '—'}</TableCell>,
    },
    {
      title: 'Fecha',
      key: 'fechaPago',
      width: 140,
      render: (_, record) => <TableCell>{formatFecha(record.fechaPago)}</TableCell>,
    },
    {
      title: 'Monto',
      key: 'monto',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <TableCell align="right" strong>
          {formatBolivianos(record.monto)}
        </TableCell>
      ),
    },
    {
      title: 'Método de pago',
      key: 'metodoNombre',
      render: (_, record) => (
        <TableCell subtext={record.cuenta || null}>{record.metodoNombre || '—'}</TableCell>
      ),
    },
  ];

  const showAcciones =
    Boolean(onGenerarRecibo) || Boolean(onEditarCuota) || Boolean(onEliminarCuota);
  if (showAcciones) {
    columns.push({
      title: 'Acciones',
      key: 'acciones',
      width: 180,
      align: 'right',
      render: (_, record) => {
        const reciboKey = record.id ?? record.numeroRecibo;
        return (
          <Space size="small">
            {puedeExportarRecibo && onGenerarRecibo ? (
              <Tooltip title="Descargar recibo PDF">
                <Button
                  type="text"
                  size="small"
                  icon={<FilePdfOutlined />}
                  aria-label="Descargar recibo PDF"
                  loading={descargandoRecibo && reciboCuotaId === reciboKey}
                  onClick={() => onGenerarRecibo(record)}
                />
              </Tooltip>
            ) : null}
            {puedeEditarCuota && onEditarCuota ? (
              <Tooltip title="Editar cuota">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  aria-label="Editar cuota"
                  onClick={() => onEditarCuota(record)}
                />
              </Tooltip>
            ) : null}
            {puedeEliminarCuota && onEliminarCuota ? (
              <Tooltip title="Eliminar cuota">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  aria-label="Eliminar cuota"
                  onClick={() => onEliminarCuota(record)}
                />
              </Tooltip>
            ) : null}
          </Space>
        );
      },
    });
  }

  return columns;
};

export { formatBolivianos as formatCuotaMonto };
export default createCuotasTableColumns;
