/**
 * Organismo: cabecera de la ficha de inscripción de capacitación (CAP).
 *
 * Gemelo de `PagoFichaHeader` (shell compartido `sd-profile`): participante +
 * curso, estado de la inscripción y estado de pago (StatusPill, resolver
 * único del módulo — ver `capacitacionPills.js`) y métricas de
 * costo/pagado/saldo. Montos Bs sin decimales. Recibe props ya mapeadas.
 */

import { DollarOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { formatBs } from '@application/utils/formatters';
import {
  formatEstadoCursoExterno,
  getEstadoCursoExternoPillClass,
  formatEstadoInscripcionCap,
  formatEstadoPagoCap,
  getEstadoInscripcionCapPillClass,
  getEstadoPagoCapPillClass,
  getSaldoCapPillClass,
} from '@application-capacitacion/utils/capacitacionPills';
import CostoCursoLabel from '@capacitacion/components/atoms/CostoCursoLabel';
import CursoGratuitoPill from '@capacitacion/components/atoms/CursoGratuitoPill';

const InscripcionFichaHeader = ({ inscripcion }) => {
  const { saldoTotal } = inscripcion;
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
              label={formatEstadoInscripcionCap(inscripcion.estado)}
              className={getEstadoInscripcionCapPillClass(inscripcion.estado)}
            />
            <StatusPill
              label={formatEstadoPagoCap(inscripcion.estadoPago)}
              className={getEstadoPagoCapPillClass(inscripcion.estadoPago)}
            />
          </div>
        </div>
      </div>

      <div className="sd-profile__divider" />

      <div className="sd-profile__stats">
        {inscripcion.montoMatricula > 0 ? (
          <div className="sd-stat">
            <span className="sd-stat__label">Matrícula</span>
            <span className="sd-stat__value sd-stat__value--primary">
              <CostoCursoLabel costo={inscripcion.montoMatricula} />
            </span>
          </div>
        ) : null}
        {inscripcion.montoObligatorio > 0 ? (
          <div className="sd-stat">
            <span className="sd-stat__label">Costo del curso</span>
            <span className="sd-stat__value sd-stat__value--primary">
              <CostoCursoLabel costo={inscripcion.montoObligatorio} />
            </span>
            {inscripcion.pagoCursoExterno ? (
              <StatusPill
                label={formatEstadoCursoExterno(inscripcion.estadoPagoCurso)}
                className={getEstadoCursoExternoPillClass(inscripcion.estadoPagoCurso)}
              />
            ) : null}
          </div>
        ) : null}
        {inscripcion.montoTotal <= 0 ? (
          <div className="sd-stat">
            <span className="sd-stat__label">Costo</span>
            <span className="sd-stat__value">
              <CursoGratuitoPill />
            </span>
          </div>
        ) : null}
        <div className="sd-stat">
          <span className="sd-stat__label">Total pagado</span>
          <span className="sd-stat__value">Bs {formatBs(inscripcion.totalPagado)}</span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Saldo total</span>
          <span className="sd-stat__value">
            <StatusPill
              label={saldoTotal > 0 ? `Bs ${formatBs(saldoTotal)}` : 'Saldado'}
              className={getSaldoCapPillClass(saldoTotal)}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default InscripcionFichaHeader;
