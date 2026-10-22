/**
 * Columnas del historial de pagos de una inscripción (ficha CAP).
 *
 * Tabla embebida en `InscripcionPagosSection` (gemela de las cuotas de la
 * ficha de pago de Finanzas). Por fila: descargar recibo PDF, comprobante
 * (opcional), y las acciones «Editar pago» y «Anular pago»
 * (capacitacion.inscripcion EDITAR, vía `TableActions`). Un pago ANULADO se
 * conserva como historial: texto tachado y atenuado, pill «Anulado» con motivo
 * y fecha, y todas sus acciones deshabilitadas. Montos Bs SIN decimales (formatBs).
 */

import { Typography } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { TableActions } from '@molecules';
import { formatBs } from '@application/utils/formatters';
import { formatConceptoPago } from '@application-capacitacion/utils/capacitacionCatalogos';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import { PAGO_ANULADO_PILL_CLASS } from '@application-capacitacion/utils/capacitacionPills';
import PagoReciboCell from '@capacitacion/inscripciones/components/molecules/PagoReciboCell';
import PagoComprobanteCell from '@capacitacion/inscripciones/components/molecules/PagoComprobanteCell';

const { Text } = Typography;

/** Clase de fila atenuada (la misma de los catálogos inactivos; excluye `.cfg-estado-col`). */
export const pagoRowClassName = (pago) => (pago.anulado ? 'cfg-table-row--inactiva' : '');

/** Texto de la celda: tachado si el pago está anulado. */
const textoPago = (pago, contenido) =>
  pago.anulado ? (
    <Text delete type="secondary">
      {contenido}
    </Text>
  ) : (
    contenido
  );

/**
 * @param {Object} [comprobante] - permisos y handlers del comprobante y el recibo
 *   `{ puedeDescargar, puedeAdjuntar, subiendo, onDescargar, onAdjuntar,
 *   puedeDescargarRecibo, reciboDescargandoId, onDescargarRecibo }`
 * @param {Object} [acciones] - corrección de pagos
 *   `{ evaluarPago(pago) → {permitido, motivo}, onEditar(pago), onAnular(pago) }`
 */
export const createPagosCapacitacionTableColumns = (comprobante = {}, acciones = null) => {
  const columns = [
    {
      title: '#',
      key: 'nro',
      width: 56,
      align: 'center',
      render: (_value, pago, index) => textoPago(pago, index + 1),
    },
    {
      title: 'Recibo',
      dataIndex: 'numeroRecibo',
      width: 190,
      render: (v, pago) => (
        <PagoReciboCell
          pago={pago}
          puedeDescargar={Boolean(comprobante.puedeDescargarRecibo) && !pago.anulado}
          descargandoId={comprobante.reciboDescargandoId}
          onDescargar={comprobante.onDescargarRecibo}
        />
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'fechaPagoLabel',
      width: 120,
      render: (v, pago) => textoPago(pago, v || '—'),
    },
    {
      title: 'Concepto',
      dataIndex: 'concepto',
      width: 200,
      render: (concepto, pago) => textoPago(pago, formatConceptoPago(concepto)),
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      width: 120,
      align: 'right',
      render: (monto, pago) => textoPago(pago, `Bs ${formatBs(monto)}`),
    },
    {
      title: 'Método',
      dataIndex: 'metodoPagoNombre',
      width: 140,
      render: (v, pago) => textoPago(pago, v || '—'),
    },
    {
      title: 'Cuenta',
      dataIndex: 'cuentaLabel',
      width: 200,
      render: (v, pago) => textoPago(pago, v || '—'),
    },
    {
      title: 'Observaciones',
      dataIndex: 'observaciones',
      render: (v, pago) => textoPago(pago, v || '—'),
    },
    {
      title: 'Comprobante',
      key: 'comprobante',
      width: 240,
      render: (_, pago) => (
        <PagoComprobanteCell
          pago={pago}
          {...comprobante}
          puedeAdjuntar={Boolean(comprobante.puedeAdjuntar) && !pago.anulado}
        />
      ),
    },
    {
      // `cfg-estado-col`: la fila anulada se atenúa pero esta celda (pill + motivo) conserva legibilidad.
      title: 'Estado',
      key: 'estado',
      width: 240,
      className: 'cfg-estado-col',
      render: (_, pago) =>
        pago.anulado ? (
          <div>
            <StatusPill label="Anulado" className={PAGO_ANULADO_PILL_CLASS} />
            {pago.fechaAnulacionLabel ? (
              <div>
                <Text type="secondary">{pago.fechaAnulacionLabel}</Text>
              </div>
            ) : null}
            {pago.motivoAnulacion ? (
              <div>
                <Text type="secondary">Motivo: {pago.motivoAnulacion}</Text>
              </div>
            ) : null}
          </div>
        ) : (
          <StatusPill label="Vigente" className="cfg-materia-pill cfg-materia-pill--success" />
        ),
    },
  ];

  if (acciones) {
    columns.push({
      title: 'Acciones',
      key: 'acciones',
      width: 110,
      align: 'right',
      className: 'cfg-estado-col',
      render: (_, pago) => {
        const { permitido, motivo } = acciones.evaluarPago(pago);
        return (
          <TableActions
            record={pago}
            itemName="el pago"
            onEdit={() => acciones.onEditar(pago)}
            editDisabled={!permitido}
            editTitle="Editar pago"
            editDisabledTitle={motivo}
            extraActions={[
              {
                key: 'anular-pago',
                icon: <StopOutlined />,
                variant: 'error',
                tooltip: permitido ? 'Anular pago' : motivo,
                permiso: CAPACITACION_PERMISOS.inscripcion,
                accion: 'EDITAR',
                disabled: !permitido,
                onClick: () => acciones.onAnular(pago),
              },
            ]}
            permisos={{ editar: { codigo: CAPACITACION_PERMISOS.inscripcion, accion: 'EDITAR' } }}
          />
        );
      },
    });
  }

  return columns;
};
