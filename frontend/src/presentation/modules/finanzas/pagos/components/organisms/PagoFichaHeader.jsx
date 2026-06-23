/**
 * Organismo: cabecera de la ficha de pago (resumen estudiante + montos + estado).
 *
 * Reusa el shell compartido `sd-profile` (detail-page.css, prefijos sd-* solo para
 * layout). El estado del aporte se muestra con `StatusPill` (gemelo del listado) y el
 * saldo pendiente teñido por severidad. Recibe props ya mapeadas; no llama hooks de fetch.
 */

import { DollarOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import {
  derivarEstadoPago,
  formatEstadoPago,
  getEstadoPagoPillClass,
  getSaldoPillClass,
} from '@application-finanzas/utils/pagosPills';

/** Formatea un monto en bolivianos (Bs 1.234,50). */
const formatBolivianos = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `Bs ${safe.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const PagoFichaHeader = ({
  nombreCompleto,
  codigoEstudiante,
  gestionLabel,
  montoObligatorio,
  totalPagado,
  saldoPendiente,
  cantidadPagos,
}) => {
  const subtitleParts = [codigoEstudiante, gestionLabel].filter(Boolean);
  // Estado derivado (mismo criterio que el listado): "Sin pagos"/"Cancelado"/"Parcial".
  const estadoKey = derivarEstadoPago({ cantidadPagos, totalPagado, saldoPendiente });

  return (
    <div className="sd-profile">
      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div className="sd-profile__avatar sd-profile__avatar--pago" aria-hidden>
            <DollarOutlined />
          </div>
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{nombreCompleto || 'Pago de aporte'}</h1>
          <div className="sd-profile__meta">
            <p className="sd-profile__sub">{subtitleParts.join(' · ') || 'Aporte académico'}</p>
            <StatusPill
              label={formatEstadoPago(estadoKey)}
              className={getEstadoPagoPillClass(estadoKey)}
            />
          </div>
        </div>
      </div>

      <div className="sd-profile__divider" />

      <div className="sd-profile__stats">
        <div className="sd-stat">
          <span className="sd-stat__label">Monto a pagar</span>
          <span className="sd-stat__value sd-stat__value--primary">
            {formatBolivianos(montoObligatorio)}
          </span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Total pagado</span>
          <span className="sd-stat__value">{formatBolivianos(totalPagado)}</span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Saldo pendiente</span>
          <span className="sd-stat__value">
            <StatusPill
              label={formatBolivianos(saldoPendiente)}
              className={getSaldoPillClass(saldoPendiente)}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default PagoFichaHeader;
