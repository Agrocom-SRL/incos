/**
 * Organismo: sección "Información" de la ficha de empresa (TIT).
 *
 * Compone `DetailInfoCard` + `DetailField` (patrón de fichas del sistema,
 * gemelo de `CursoInformacionSection`). Recibe la empresa ya mapeada; no
 * llama hooks de fetch.
 */

import { EnvironmentOutlined, InfoCircleOutlined, PhoneOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField } from '@atoms';
import { formatTipoSocietario } from '@application-titulacion/utils/pasantiasPills';

const PasantiaEmpresaInformacionSection = ({ empresa }) => (
  <div className="sd-tab-body">
    <DetailInfoCard title="Datos de la empresa" icon={<InfoCircleOutlined />} cols={3}>
      <DetailField label="Nombre o razón social">{empresa.nombre || '—'}</DetailField>
      <DetailField label="Nombre comercial">{empresa.nombreComercial || '—'}</DetailField>
      <DetailField label="Tipo societario">
        {empresa.tipoSocietario ? formatTipoSocietario(empresa.tipoSocietario) : '—'}
      </DetailField>
      <DetailField label="NIT">{empresa.nit || '—'}</DetailField>
      <DetailField label="En funcionamiento">
        {empresa.enFuncionamiento === false ? 'No' : 'Sí'}
      </DetailField>
      <DetailField label="Sector / actividad">{empresa.sectorActividad || '—'}</DetailField>
      <DetailField label="Registro activo">{empresa.activo ? 'Sí' : 'No'}</DetailField>
    </DetailInfoCard>

    <DetailInfoCard title="Contacto" icon={<EnvironmentOutlined />} cols={2}>
      <DetailField label="Dirección">{empresa.direccion || '—'}</DetailField>
      <DetailField label="Teléfono">
        {empresa.telefono ? (
          <>
            <PhoneOutlined /> {empresa.telefono}
          </>
        ) : (
          '—'
        )}
      </DetailField>
    </DetailInfoCard>

    {empresa.observaciones ? (
      <DetailInfoCard title="Observaciones" icon={<InfoCircleOutlined />} cols={1}>
        <DetailField label="Detalle">{empresa.observaciones}</DetailField>
      </DetailInfoCard>
    ) : null}
  </div>
);

export default PasantiaEmpresaInformacionSection;
