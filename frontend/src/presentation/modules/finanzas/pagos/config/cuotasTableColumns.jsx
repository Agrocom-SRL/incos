/**
 * Columnas de la tabla de cuotas de un pago de aporte (ficha — módulo Finanzas).
 *
 * Lenguaje visual del listado: celdas con `TableCell`, montos con `PagoMontoCell` y
 * `StatusPill` para el método/dato con color; acciones de fila con `TableActions`
 * (recibo PDF [EXPORTAR] · editar [EDITAR] · eliminar [ELIMINAR]).
 *
 * Permisos: cuota/recibo siguen en `finanzas.pago.*` (EXPORTAR el recibo, EDITAR y
 * ELIMINAR la cuota) — NO usan el permiso de compromiso. Fail-closed: si no llega el
 * handler o el permiso, la acción no se pinta.
 */

import { FilePdfOutlined } from '@ant-design/icons';
import { TableCell, TableActions } from '@molecules';
import { StatusPill } from '@atoms';
import PagoMontoCell from '@finanzas/pagos/components/atoms/PagoMontoCell';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';

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
 * @param {(id: number) => Promise<{success:boolean,error?:string}>} params.onEliminarCuota -
 *        deleteFn de la cuota; `TableActions` muestra la confirmación y el feedback.
 * @param {Function} [params.refetch] - Recarga la ficha tras eliminar.
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
  refetch,
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
      render: (_, record) => <PagoMontoCell valor={formatBolivianos(record.monto)} />,
    },
    {
      title: 'Método de pago',
      key: 'metodoNombre',
      render: (_, record) =>
        record.metodoNombre ? (
          <TableCell subtext={record.cuenta || null}>
            <StatusPill
              label={record.metodoNombre}
              className="pago-pill pago-pill--parcial"
            />
          </TableCell>
        ) : (
          <TableCell>—</TableCell>
        ),
    },
  ];

  const showAcciones =
    Boolean(onGenerarRecibo) || Boolean(onEditarCuota) || Boolean(onEliminarCuota);
  if (showAcciones) {
    columns.push({
      title: 'Acciones',
      key: 'acciones',
      width: 160,
      align: 'right',
      render: (_, record) => {
        const reciboKey = record.id ?? record.numeroRecibo;
        const nombreCuota = record.numeroRecibo
          ? `la cuota del recibo ${record.numeroRecibo}`
          : 'esta cuota de pago';

        const extraActions =
          puedeExportarRecibo && onGenerarRecibo
            ? [
                {
                  key: 'recibo',
                  icon: <FilePdfOutlined />,
                  variant: 'view',
                  tooltip: 'Descargar recibo PDF',
                  permiso: FINANZAS_PERMISOS.pagoVer,
                  accion: 'EXPORTAR',
                  disabled: descargandoRecibo && reciboCuotaId === reciboKey,
                  onClick: () => onGenerarRecibo(record),
                },
              ]
            : [];

        const itemDetails = [
          { label: 'Recibo', value: record.numeroRecibo || '—' },
          { label: 'Fecha', value: formatFecha(record.fechaPago) },
          { label: 'Monto', value: formatBolivianos(record.monto) },
        ];

        return (
          <TableActions
            record={record}
            refetch={refetch}
            itemName={nombreCuota}
            itemDetails={itemDetails}
            onEdit={puedeEditarCuota && onEditarCuota ? () => onEditarCuota(record) : undefined}
            editTitle="Editar cuota"
            deleteFn={puedeEliminarCuota && onEliminarCuota ? onEliminarCuota : undefined}
            extraActions={extraActions}
            permisos={{
              editar: { codigo: FINANZAS_PERMISOS.pagoEditar, accion: 'EDITAR' },
              eliminar: { codigo: FINANZAS_PERMISOS.pagoEditar, accion: 'ELIMINAR' },
            }}
          />
        );
      },
    });
  }

  return columns;
};

export { formatBolivianos as formatCuotaMonto };
export default createCuotasTableColumns;
