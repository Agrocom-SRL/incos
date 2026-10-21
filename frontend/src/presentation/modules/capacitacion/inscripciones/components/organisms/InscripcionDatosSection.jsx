/**
 * Organismo: pestaña «Información» de la ficha de inscripción (CAP) — participante y curso
 * (con grupo, horarios y compromiso de pago). Solo lectura; recibe la inscripción ya mapeada.
 */

import { Flex } from 'antd';
import { allSpacing } from '@theme/tokens';
import { BookOutlined, UserOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField, StatusPill } from '@atoms';
import {
  formatEstadoCurso,
  formatEstadoInscripcionCap,
  getEstadoInscripcionCapPillClass,
} from '@application-capacitacion/utils/capacitacionPills';

const InscripcionDatosSection = ({ inscripcion }) => (
  <>
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
        <StatusPill
          label={formatEstadoInscripcionCap(inscripcion.estado)}
          className={getEstadoInscripcionCapPillClass(inscripcion.estado)}
        />
      </DetailField>
    </DetailInfoCard>

    <DetailInfoCard title="Curso" icon={<BookOutlined />} cols={3}>
      <DetailField label="Curso">{inscripcion.capacitacionTitulo}</DetailField>
      <DetailField label="Estado del curso">
        {formatEstadoCurso(inscripcion.capacitacionEstado)}
      </DetailField>
      <DetailField label="Fechas">{inscripcion.capacitacionFechasLabel || '—'}</DetailField>
      <DetailField label="Grupo">{inscripcion.grupoNombre || 'Sin grupo elegido'}</DetailField>
      <DetailField label="Horarios del grupo">
        {inscripcion.grupoHorariosEtiqueta || '—'}
      </DetailField>
      {inscripcion.fechaCompromisoLabel ? (
        <DetailField label="Compromiso de pago">
          <Flex align="center" gap={allSpacing.marginSM}>
            {inscripcion.fechaCompromisoLabel}
            {inscripcion.pagoVencido ? (
              <StatusPill label="Vencido" className="cfg-materia-pill cfg-materia-pill--danger" />
            ) : null}
          </Flex>
        </DetailField>
      ) : null}
    </DetailInfoCard>
  </>
);

export default InscripcionDatosSection;
