/**
 * Organismo: cabecera de la ficha de pago (resumen estudiante + montos + estado).
 *
 * Espejo del `DocenteProfileSummary` / cabecera de pago legacy, reusando el shell
 * compartido `sd-profile` (detail-page.css, prefijos sd-* solo para layout). Recibe
 * props ya mapeadas; no llama hooks de fetch.
 */

import { Tag } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

/** Formatea un monto en bolivianos (Bs 1.234,50). */
const formatBolivianos = (value) => {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return `Bs ${safe.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Mapa estado → color de preset AntD (sin #hex). */
const ESTADO_TAG = {
  PENDIENTE: { color: 'warning', label: 'Pendiente' },
  PARCIAL: { color: 'processing', label: 'Parcial' },
  CANCELADO: { color: 'success', label: 'Cancelado' },
};

const renderEstadoTag = (estado) => {
  if (!estado) return '—';
  const key = String(estado).toUpperCase();
  const cfg = ESTADO_TAG[key] || { color: 'default', label: estado };
  return (
    <Tag color={cfg.color} style={{ margin: 0 }}>
      {cfg.label}
    </Tag>
  );
};

const PagoFichaHeader = ({
  nombreCompleto,
  codigoEstudiante,
  gestionLabel,
  montoObligatorio,
  totalPagado,
  saldoPendiente,
  estado,
}) => {
  const subtitleParts = [codigoEstudiante, gestionLabel].filter(Boolean);

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
            {estado ? renderEstadoTag(estado) : null}
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
          <span className="sd-stat__value">{formatBolivianos(saldoPendiente)}</span>
        </div>
      </div>
    </div>
  );
};

export default PagoFichaHeader;
