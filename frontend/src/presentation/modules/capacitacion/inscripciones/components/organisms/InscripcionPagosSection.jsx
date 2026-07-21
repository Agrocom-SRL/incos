/**
 * Organismo: sección de la ficha de inscripción (CAP) — datos + historial de
 * pagos. Gemelo de `PagoCuotasSection` (Finanzas): DetailInfoCard + tabla.
 * Estados vacíos cubiertos. Recibe props ya mapeadas; no llama hooks.
 */

import { Empty, Table } from 'antd';
import {
  BookOutlined,
  DollarOutlined,
  FileTextOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField, StatusPill } from '@atoms';
import { formatBs } from '@application/utils/formatters';
import {
  formatEstadoCurso,
  getSaldoCapPillClass,
} from '@application-capacitacion/utils/capacitacionPills';
import { createPagosCapacitacionTableColumns } from '@capacitacion/inscripciones/config/pagosCapacitacionTableColumns';
import CostoCursoLabel from '@capacitacion/components/atoms/CostoCursoLabel';

const InscripcionPagosSection = ({ inscripcion }) => {
  const columns = createPagosCapacitacionTableColumns();
  const pagos = inscripcion.pagos ?? [];

  return (
    <div className="sd-tab-body">
      <DetailInfoCard title="Participante" icon={<UserOutlined />} cols={3}>
        <DetailField label="Nombre completo">
          {inscripcion.participanteNombreCompleto}
        </DetailField>
        <DetailField label="C.I.">{inscripcion.participanteCiCompleto || '—'}</DetailField>
        <DetailField label="Celular">{inscripcion.participanteCelular || '—'}</DetailField>
        <DetailField label="Correo">{inscripcion.participanteEmail || '—'}</DetailField>
        <DetailField label="Fecha de inscripción">
          {inscripcion.fechaInscripcionLabel || '—'}
        </DetailField>
        <DetailField label="Estado de la inscripción">
          {inscripcion.estado === 'RETIRADO' ? 'Retirado' : 'Inscrito'}
        </DetailField>
      </DetailInfoCard>

      <DetailInfoCard title="Curso" icon={<BookOutlined />} cols={3}>
        <DetailField label="Curso">{inscripcion.capacitacionTitulo}</DetailField>
        <DetailField label="Estado del curso">
          {formatEstadoCurso(inscripcion.capacitacionEstado)}
        </DetailField>
        <DetailField label="Fechas">{inscripcion.capacitacionFechasLabel || '—'}</DetailField>
        <DetailField label="Costo">
          <CostoCursoLabel costo={inscripcion.costo} />
        </DetailField>
        <DetailField label="Total pagado">Bs {formatBs(inscripcion.totalPagado)}</DetailField>
        <DetailField label="Saldo">
          <StatusPill
            label={inscripcion.saldo > 0 ? `Bs ${formatBs(inscripcion.saldo)}` : 'Saldado'}
            className={getSaldoCapPillClass(inscripcion.saldo)}
          />
        </DetailField>
      </DetailInfoCard>

      <DetailInfoCard
        title={`Historial de pagos (${pagos.length})`}
        icon={<FileTextOutlined />}
        cols={1}
      >
        {pagos.length > 0 ? (
          <Table
            dataSource={pagos}
            columns={columns}
            rowKey={(record) => record.id ?? record.numeroRecibo}
            size="small"
            pagination={false}
          />
        ) : (
          <Empty description="La inscripción aún no tiene pagos registrados." />
        )}
      </DetailInfoCard>
    </div>
  );
};

export default InscripcionPagosSection;
