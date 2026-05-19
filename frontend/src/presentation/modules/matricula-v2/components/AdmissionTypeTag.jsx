/**
 * Tag de tipo de inscripción con colores del sistema (admissionTypeColors).
 * @param {{ tipo: string, className?: string }} props
 */
import { Tag } from 'antd';
import { getAdmissionTypeTagStyle, mapInscripcionTipoToAdmission } from '../utils/mapAdmissionTipo';

const AdmissionTypeTag = ({ tipo, className = 'matricula-v2-table-tag' }) => {
  const label = String(tipo || '—').toUpperCase();
  const admissionKey = mapInscripcionTipoToAdmission(tipo);

  return (
    <Tag className={className} style={getAdmissionTypeTagStyle(admissionKey ?? undefined)}>
      {label}
    </Tag>
  );
};

export default AdmissionTypeTag;
