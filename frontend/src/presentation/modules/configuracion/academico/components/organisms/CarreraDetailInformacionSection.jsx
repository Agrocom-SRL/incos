/**
 * Organismo: tab Información — detalle de carrera.
 */

import { AppstoreOutlined, TeamOutlined } from '@ant-design/icons';
import DetailField from '@atoms/DetailField';
import DetailInfoCard from '@molecules/DetailInfoCard';
import StatusPill from '@atoms/StatusPill';
import {
  getMateriaEstadoLabel,
  getMateriaEstadoPillClass,
} from '@application-configuracion/academico/config/materiaTipoPill';

const CarreraDetailInformacionSection = ({ carrera, planVigente }) => {
  if (!carrera) return null;

  return (
    <DetailInfoCard title="Datos de la carrera" icon={<TeamOutlined />} cols={2}>
      <DetailField label="Código">{carrera.codigo}</DetailField>
      <DetailField label="Nombre">{carrera.nombre}</DetailField>
      <DetailField label="Área de formación">
        <span className="cfg-carrera-area-desc__area">
          <AppstoreOutlined className="cfg-carrera-area-desc__icon" aria-hidden />
          {carrera.areaFormacion || '—'}
        </span>
      </DetailField>
      <DetailField label="Estado">
        <StatusPill
          label={getMateriaEstadoLabel(carrera.activo)}
          className={getMateriaEstadoPillClass(carrera.activo)}
        />
      </DetailField>
      <DetailField label="Título otorgado" span={2}>
        {carrera.tituloOtorgado || '—'}
      </DetailField>
      {carrera.descripcion ? (
        <DetailField label="Descripción" span={2}>
          {carrera.descripcion}
        </DetailField>
      ) : null}
      {planVigente ? (
        <DetailField label="Plan vigente" span={2}>
          {planVigente.nombre || '—'}
        </DetailField>
      ) : null}
    </DetailInfoCard>
  );
};

export default CarreraDetailInformacionSection;
