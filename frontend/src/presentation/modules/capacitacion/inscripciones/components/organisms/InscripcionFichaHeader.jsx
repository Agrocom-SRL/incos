/**
 * Organismo: cabecera de la ficha de inscripción de capacitación (CAP).
 *
 * Gemelo de `PagoFichaHeader` (shell compartido `sd-profile`): participante +
 * curso, estado de pago (StatusPill derivado por el backend) y métricas de
 * costo/pagado/saldo. Montos Bs sin decimales. Recibe props ya mapeadas.
 */

import { DollarOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { formatBs } from '@application/utils/formatters';
import {
  formatEstadoPagoCap,
  getEstadoPagoCapPillClass,
  getSaldoCapPillClass,
} from '@application-capacitacion/utils/capacitacionPills';

const InscripcionFichaHeader = ({ inscripcion }) => {
  const subtitleParts = [
    inscripcion.participanteCiCompleto ? `CI ${inscripcion.participanteCiCompleto}` : null,
    inscripcion.capacitacionTitulo,
  ].filter(Boolean);

  return (
    <div className="sd-profile">
      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div className="sd-profile__avatar sd-profile__avatar--pago" aria-hidden>
            <DollarOutlined />
          </div>
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{inscripcion.participanteNombreCompleto}</h1>
          <div className="sd-profile__meta">
            <p className="sd-profile__sub">
              {subtitleParts.join(' · ') || 'Inscripción de capacitación'}
            </p>
            <StatusPill
              label={formatEstadoPagoCap(inscripcion.estadoPago)}
              className={getEstadoPagoCapPillClass(inscripcion.estadoPago)}
            />
            {inscripcion.estado === 'RETIRADO' ? (
              <StatusPill label="Retirado" className="cfg-materia-pill cfg-materia-pill--inactiva" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="sd-profile__divider" />

      <div className="sd-profile__stats">
        <div className="sd-stat">
          <span className="sd-stat__label">Costo del curso</span>
          <span className="sd-stat__value sd-stat__value--primary">
            Bs {formatBs(inscripcion.costo)}
          </span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Total pagado</span>
          <span className="sd-stat__value">Bs {formatBs(inscripcion.totalPagado)}</span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Saldo</span>
          <span className="sd-stat__value">
            <StatusPill
              label={inscripcion.saldo > 0 ? `Bs ${formatBs(inscripcion.saldo)}` : 'Saldado'}
              className={getSaldoCapPillClass(inscripcion.saldo)}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default InscripcionFichaHeader;
