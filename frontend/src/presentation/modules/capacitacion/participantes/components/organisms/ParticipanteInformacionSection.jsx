/**
 * Organismo: tab "Información" de la ficha de participante (CAP).
 *
 * Compone `DetailInfoCard` + `DetailField` (patrón de fichas del sistema):
 * datos personales y de contacto. Recibe el participante ya mapeado.
 */

import { IdcardOutlined, PhoneOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField } from '@atoms';

const ParticipanteInformacionSection = ({ participante }) => (
  <div className="sd-tab-body">
    <DetailInfoCard title="Datos personales" icon={<IdcardOutlined />} cols={3}>
      <DetailField label="Cédula de identidad">{participante.ciCompleto || '—'}</DetailField>
      <DetailField label="Nombres">{participante.nombres || '—'}</DetailField>
      <DetailField label="Apellido paterno">{participante.apellidoPaterno || '—'}</DetailField>
      <DetailField label="Apellido materno">{participante.apellidoMaterno || '—'}</DetailField>
      <DetailField label="Fecha de registro">{participante.registradoLabel || '—'}</DetailField>
      <DetailField label="Registro activo">{participante.activo ? 'Sí' : 'No'}</DetailField>
    </DetailInfoCard>

    <DetailInfoCard title="Contacto" icon={<PhoneOutlined />} cols={3}>
      <DetailField label="Celular">{participante.celular || '—'}</DetailField>
      <DetailField label="Correo electrónico">{participante.email || '—'}</DetailField>
    </DetailInfoCard>
  </div>
);

export default ParticipanteInformacionSection;
