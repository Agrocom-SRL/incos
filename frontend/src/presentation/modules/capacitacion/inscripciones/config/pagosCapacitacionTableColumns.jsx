/**
 * Columnas del historial de pagos de una inscripción (ficha CAP).
 *
 * Tabla embebida en `InscripcionPagosSection` (gemela de «Cuotas registradas» de la
 * ficha de aporte de Finanzas): solo los datos principales por columna (recibo, fecha,
 * concepto, monto, método); cuenta, observaciones y comprobante van en la fila
 * expandible (botón «+»). Acciones de fila con `TableActions`: descargar recibo PDF,
 * editar y eliminar pago (capacitacion.inscripcion EDITAR). Los pagos eliminados (anulados con motivo)
 * no llegan aquí: la sección los filtra. Montos Bs SIN decimales (formatBs).
 */

import { FilePdfOutlined, StopOutlined } from '@ant-design/icons';
import { TableActions } from '@molecules';
import { formatBs } from '@application/utils/formatters';
import { formatConceptoPago } from '@application-capacitacion/utils/capacitacionCatalogos';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';

/**
 * @param {Object} [comprobante] - permisos y handlers del recibo
 *   `{ puedeDescargarRecibo, reciboDescargandoId, onDescargarRecibo }`
 * @param {Object} [acciones] - corrección de pagos
 *   `{ evaluarPago(pago) → {permitido, motivo}, onEditar(pago), onAnular(pago) }`
 */
export const createPagosCapacitacionTableColumns = (comprobante = {}, acciones = null) => {
  const columns = [
    {
      title: 'Recibo',
      dataIndex: 'numeroRecibo',
      width: 130,
      render: (v) => v || '—',
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaPagoLabel',
      width: 120,
      render: (v) => v || '—',
    },
    {
      title: 'Concepto',
      dataIndex: 'concepto',
      render: (concepto) => formatConceptoPago(concepto),
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      width: 120,
      align: 'right',
      render: (monto) => `Bs ${formatBs(monto)}`,
    },
    {
      title: 'Método de pago',
      dataIndex: 'metodoPagoNombre',
      render: (v) => v || '—',
    },
  ];

  const recibo = comprobante.onDescargarRecibo
    ? (pago) => ({
        key: 'recibo',
        icon: <FilePdfOutlined />,
        variant: 'view',
        tooltip: pago.anulado ? 'Un pago anulado no emite recibo' : 'Descargar recibo PDF',
        permiso: CAPACITACION_PERMISOS.inscripcion,
        accion: 'DETALLE',
        disabled: !comprobante.puedeDescargarRecibo || pago.anulado,
        loading: comprobante.reciboDescargandoId === pago.id,
        onClick: () => comprobante.onDescargarRecibo(pago.id),
      })
    : null;

  if (acciones || recibo) {
    columns.push({
      title: 'Acciones',
      key: 'acciones',
      width: 150,
      align: 'right',
      className: 'cfg-estado-col',
      render: (_, pago) => {
        const { permitido, motivo } = acciones?.evaluarPago(pago) ?? {};
        const extraActions = [
          ...(recibo ? [recibo(pago)] : []),
          ...(acciones
            ? [
                {
                  key: 'eliminar-pago',
                  icon: <StopOutlined />,
                  variant: 'error',
                  tooltip: permitido ? 'Eliminar pago' : motivo,
                  permiso: CAPACITACION_PERMISOS.inscripcion,
                  accion: 'EDITAR',
                  disabled: !permitido,
                  onClick: () => acciones.onAnular(pago),
                },
              ]
            : []),
        ];
        return (
          <TableActions
            record={pago}
            itemName="el pago"
            onEdit={acciones ? () => acciones.onEditar(pago) : undefined}
            editDisabled={!permitido}
            editTitle="Editar pago"
            editDisabledTitle={motivo}
            extraActions={extraActions}
            permisos={{ editar: { codigo: CAPACITACION_PERMISOS.inscripcion, accion: 'EDITAR' } }}
          />
        );
      },
    });
  }

  return columns;
};
