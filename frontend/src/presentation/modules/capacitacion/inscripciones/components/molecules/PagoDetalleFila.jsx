/**
 * Molécula: detalle oculto de un pago (fila expandible del historial CAP).
 *
 * Datos secundarios del pago: cuenta, observaciones y comprobante (solo descarga: adjuntar o
 * reemplazar se hace desde «Editar pago»). Presentacional: permisos y handlers por props.
 */

import { DetailField } from '@atoms';
import PagoComprobanteCell from '@capacitacion/inscripciones/components/molecules/PagoComprobanteCell';

const PagoDetalleFila = ({ pago, comprobante = {} }) => (
  <div className="sd-card__body sd-card__body--cols-3">
    <DetailField label="Cuenta">{pago.cuentaLabel || '—'}</DetailField>
    <DetailField label="Observaciones">{pago.observaciones || '—'}</DetailField>
    <DetailField label="Comprobante">
      <PagoComprobanteCell pago={pago} {...comprobante} />
    </DetailField>
  </div>
);

export default PagoDetalleFila;
