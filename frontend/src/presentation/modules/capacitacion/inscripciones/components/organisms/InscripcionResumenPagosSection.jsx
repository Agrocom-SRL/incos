/**
 * Organismo: «Datos de la inscripción» (gemelo de «Datos del aporte» de Finanzas): UNA
 * sola tarjeta con los conceptos SEPARADOS por un título: «Matrícula (instituto)» y
 * «Costo del curso (entidad certificadora)». Los valores van en columnas (monto,
 * pagado, saldo y estado). El pagado se deriva (monto − saldo). Un concepto no cobrado (monto 0) no se
 * muestra; sin ninguno cobrado se rotula «Curso gratuito». Recibe la
 * inscripción ya mapeada.
 *
 * Curso EXTERNO (`pagoCursoExterno`): el costo del curso se deposita a la
 * entidad certificadora, no se cobra en el instituto. El bloque muestra el
 * monto y «Pagado a la entidad» / «Pendiente de acreditar con depósito» (según
 * el requisito que acredita el depósito), sin pagado ni saldo en Bs.
 */

import { DollarOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField, StatusPill } from '@atoms';
import CursoGratuitoPill from '@capacitacion/components/atoms/CursoGratuitoPill';
import { formatBs } from '@application/utils/formatters';
import {
  CONCEPTO_PAGO,
  formatConceptoPago,
} from '@application-capacitacion/utils/capacitacionCatalogos';
import {
  formatEstadoCursoExterno,
  formatEstadoPagoCap,
  getEstadoCursoExternoPillClass,
  getEstadoPagoCapPillClass,
  getSaldoCapPillClass,
} from '@application-capacitacion/utils/capacitacionPills';

/** Bloque de un concepto cobrado en el instituto: título + monto, pagado, saldo y estado. */
const ConceptoPagoBloque = ({ concepto, monto, saldo, estadoPago }) => (
  <>
    <h4 className="sd-card__subtitle">{formatConceptoPago(concepto)}</h4>
    <DetailField label="Monto">Bs {formatBs(monto)}</DetailField>
    <DetailField label="Pagado">Bs {formatBs(Math.max(monto - saldo, 0))}</DetailField>
    <DetailField label="Saldo">
      <StatusPill
        label={saldo > 0 ? `Bs ${formatBs(saldo)}` : 'Saldado'}
        className={getSaldoCapPillClass(saldo)}
      />
    </DetailField>
    <DetailField label="Estado">
      <StatusPill
        label={formatEstadoPagoCap(estadoPago)}
        className={getEstadoPagoCapPillClass(estadoPago)}
      />
    </DetailField>
  </>
);

/** Costo del curso que se paga a la entidad certificadora (sin saldo en Bs). */
const CursoExternoBloque = ({ inscripcion }) => (
  <>
    <h4 className="sd-card__subtitle">{formatConceptoPago(CONCEPTO_PAGO.CURSO)}</h4>
    <DetailField label="Monto">Bs {formatBs(inscripcion.montoObligatorio)}</DetailField>
    <DetailField label="Estado">
      <StatusPill
        label={formatEstadoCursoExterno(inscripcion.estadoPagoCurso)}
        className={getEstadoCursoExternoPillClass(inscripcion.estadoPagoCurso)}
      />
    </DetailField>
    {inscripcion.requisitoAcreditaPagoCurso?.descripcion ? (
      <DetailField label="Se acredita con" span={2}>
        {inscripcion.requisitoAcreditaPagoCurso.descripcion}
      </DetailField>
    ) : null}
  </>
);

const InscripcionResumenPagosSection = ({ inscripcion }) => (
  <DetailInfoCard title="Datos de la inscripción" icon={<DollarOutlined />} cols={4}>
    {inscripcion.montoMatricula > 0 ? (
      <ConceptoPagoBloque
        concepto={CONCEPTO_PAGO.MATRICULA}
        monto={inscripcion.montoMatricula}
        saldo={inscripcion.saldoMatricula}
        estadoPago={inscripcion.estadoPagoMatricula}
      />
    ) : null}
    {inscripcion.montoObligatorio > 0 && inscripcion.pagoCursoExterno ? (
      <CursoExternoBloque inscripcion={inscripcion} />
    ) : null}
    {inscripcion.montoObligatorio > 0 && !inscripcion.pagoCursoExterno ? (
      <ConceptoPagoBloque
        concepto={CONCEPTO_PAGO.CURSO}
        monto={inscripcion.montoObligatorio}
        saldo={inscripcion.saldoCurso}
        estadoPago={inscripcion.estadoPagoCurso}
      />
    ) : null}
    {inscripcion.montoTotal <= 0 ? <CursoGratuitoPill /> : null}
  </DetailInfoCard>
);

export default InscripcionResumenPagosSection;
