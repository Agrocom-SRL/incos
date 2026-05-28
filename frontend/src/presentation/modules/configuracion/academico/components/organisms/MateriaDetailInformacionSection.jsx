/**
 * Organismo: tab Información — detalle de materia.
 */

import { BookOutlined } from '@ant-design/icons';
import DetailField from '@atoms/DetailField';
import DetailInfoCard from '@molecules/DetailInfoCard';
import StatusPill from '@atoms/StatusPill';
import {
  getMateriaClasificacionPillClass,
  getMateriaEstadoLabel,
  getMateriaEstadoPillClass,
  getMateriaTipoPillClass,
} from '@application-configuracion/academico/config/materiaTipoPill';

const MateriaDetailInformacionSection = ({ materia, tipoLabel }) => {
  if (!materia) return null;

  return (
    <DetailInfoCard title="Datos de la materia" icon={<BookOutlined />} cols={2}>
      <DetailField label="Sigla">{materia.sigla}</DetailField>
      <DetailField label="Nombre">{materia.nombre}</DetailField>
      <DetailField label="Tipo">
        <StatusPill label={tipoLabel} className={getMateriaTipoPillClass(materia.tipo)} />
      </DetailField>
      <DetailField label="Clasificación">
        {materia.clasificacion ? (
          <StatusPill
            label={materia.clasificacion}
            className={getMateriaClasificacionPillClass()}
          />
        ) : (
          '—'
        )}
      </DetailField>
      <DetailField label="Estado">
        <StatusPill
          label={getMateriaEstadoLabel(materia.activo)}
          className={getMateriaEstadoPillClass(materia.activo)}
        />
      </DetailField>
      {materia.objetivos ? (
        <DetailField label="Objetivos" span={2}>
          {materia.objetivos}
        </DetailField>
      ) : null}
    </DetailInfoCard>
  );
};

export default MateriaDetailInformacionSection;
