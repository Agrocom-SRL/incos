/**
 * Organismo: resumen de contexto de la inscripción en el flujo "Registrar
 * pago" — participante, curso y montos (mismos campos que
 * `InscripcionPagosSection`). Recibe la inscripción ya mapeada; no llama hooks.
 */

import { UserOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField, StatusPill } from '@atoms';
import { formatBs } from '@application/utils/formatters';
import { getSaldoCapPillClass } from '@application-capacitacion/utils/capacitacionPills';

const InscripcionPagoResumenCard = ({ inscripcion }) => (
  <DetailInfoCard title="Inscripción" icon={<UserOutlined />} cols={3}>
    <DetailField label="Participante">{inscripcion.participanteNombreCompleto}</DetailField>
    <DetailField label="Curso">{inscripcion.capacitacionTitulo}</DetailField>
    <DetailField label="Costo del curso">Bs {formatBs(inscripcion.costo)}</DetailField>
    <DetailField label="Total pagado">Bs {formatBs(inscripcion.totalPagado)}</DetailField>
    <DetailField label="Saldo">
      <StatusPill
        label={inscripcion.saldo > 0 ? `Bs ${formatBs(inscripcion.saldo)}` : 'Saldado'}
        className={getSaldoCapPillClass(inscripcion.saldo)}
      />
    </DetailField>
  </DetailInfoCard>
);

export default InscripcionPagoResumenCard;
