/**
 * Organismo: resumen de pagos de la ficha de inscripción (CAP), con los dos
 * conceptos SEPARADOS: «Matrícula (instituto)» y «Costo del curso (entidad
 * certificadora)». Cada tarjeta muestra monto, pagado, saldo y estado. El
 * pagado se deriva (monto − saldo). Un concepto no cobrado (monto 0) no se
 * muestra; sin ninguno cobrado se rotula «Curso gratuito». Recibe la
 * inscripción ya mapeada.
 */

import { BankOutlined, DollarOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField, StatusPill } from '@atoms';
import CursoGratuitoPill from '@capacitacion/components/atoms/CursoGratuitoPill';
import { formatBs } from '@application/utils/formatters';
import {
  CONCEPTO_PAGO,
  formatConceptoPago,
} from '@application-capacitacion/utils/capacitacionCatalogos';
import {
  formatEstadoPagoCap,
  getEstadoPagoCapPillClass,
  getSaldoCapPillClass,
} from '@application-capacitacion/utils/capacitacionPills';

const ConceptoPagoCard = ({ concepto, icon, monto, saldo, estadoPago }) => (
  <DetailInfoCard title={formatConceptoPago(concepto)} icon={icon} cols={4}>
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
  </DetailInfoCard>
);

const InscripcionResumenPagosSection = ({ inscripcion }) => (
  <>
    {inscripcion.montoMatricula > 0 ? (
      <ConceptoPagoCard
      concepto={CONCEPTO_PAGO.MATRICULA}
      icon={<BankOutlined />}
      monto={inscripcion.montoMatricula}
      saldo={inscripcion.saldoMatricula}
      estadoPago={inscripcion.estadoPagoMatricula}
      />
    ) : null}
    {inscripcion.montoObligatorio > 0 ? (
      <ConceptoPagoCard
      concepto={CONCEPTO_PAGO.CURSO}
      icon={<DollarOutlined />}
      monto={inscripcion.montoObligatorio}
      saldo={inscripcion.saldoCurso}
      estadoPago={inscripcion.estadoPagoCurso}
      />
    ) : null}
    {inscripcion.montoTotal <= 0 ? <CursoGratuitoPill /> : null}
  </>
);

export default InscripcionResumenPagosSection;
