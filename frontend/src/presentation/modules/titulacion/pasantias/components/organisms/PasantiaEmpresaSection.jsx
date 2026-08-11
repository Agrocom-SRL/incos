/**
 * Organismo: tab "Empresa" de la ficha-hub del trámite de pasantía (TIT) —
 * empresa/puesto, contrato de trabajo (camino CONVALIDACION) y supervisión.
 * Separada de `PasantiaDatosSection` (extensión 2026-08-11, pedido explícito
 * del usuario): la ficha mezclaba datos del trámite/estudiante con datos de
 * un tercero (la empresa y su responsable), que ahora vive en su propia tab.
 *
 * DetailInfoCard + DetailField (mismo patrón que `PasantiaDatosSection`).
 * Recibe el trámite ya mapeado (vista 168); no llama hooks.
 */

import { ShopOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField } from '@atoms';
import { formatTipoContrato, formatTipoSocietario } from '@application-titulacion/utils/pasantiasPills';

const PasantiaEmpresaSection = ({ pasantia }) => (
  <div className="sd-tab-body">
    <DetailInfoCard title="Empresa y puesto" icon={<ShopOutlined />} cols={3}>
      <DetailField label="Empresa">{pasantia.empresaNombre || 'Sin empresa asignada'}</DetailField>
      <DetailField label="Tipo societario">
        {pasantia.empresaTipoSocietario
          ? formatTipoSocietario(pasantia.empresaTipoSocietario)
          : '—'}
      </DetailField>
      <DetailField label="NIT">{pasantia.empresaNit || '—'}</DetailField>
      <DetailField label="Dirección">{pasantia.empresaDireccion || '—'}</DetailField>
      <DetailField label="Teléfono">{pasantia.empresaTelefono || '—'}</DetailField>
      <DetailField label="Sector / actividad">{pasantia.empresaSectorActividad || '—'}</DetailField>
      <DetailField label="Área / departamento">{pasantia.areaDepartamento || '—'}</DetailField>
      <DetailField label="Cargo / puesto">{pasantia.cargoPuesto || '—'}</DetailField>
      <DetailField label="En funcionamiento">
        {pasantia.empresaEnFuncionamiento == null
          ? '—'
          : pasantia.empresaEnFuncionamiento
            ? 'Sí'
            : 'No'}
      </DetailField>
      {pasantia.funciones ? (
        <DetailField label="Funciones" span={3}>
          {pasantia.funciones}
        </DetailField>
      ) : null}
    </DetailInfoCard>

    {pasantia.tipo === 'CONVALIDACION' ? (
      <DetailInfoCard title="Contrato de trabajo (convalidación)" icon={<SolutionOutlined />} cols={3}>
        <DetailField label="Tipo de contrato">
          {pasantia.tipoContrato ? formatTipoContrato(pasantia.tipoContrato) : '—'}
        </DetailField>
        <DetailField label="Detalle del contrato">{pasantia.tipoContratoDetalle || '—'}</DetailField>
      </DetailInfoCard>
    ) : null}

    <DetailInfoCard title="Supervisión" icon={<UserOutlined />} cols={3}>
      <DetailField label="Docente supervisor">
        {pasantia.docenteSupervisorNombre || 'Sin supervisor asignado'}
      </DetailField>
      <DetailField label="Responsable en la empresa">
        {pasantia.responsableEmpresa || '—'}
      </DetailField>
      <DetailField label="Cargo del responsable">{pasantia.cargoResponsable || '—'}</DetailField>
      <DetailField label="Teléfono del responsable">
        {pasantia.telefonoResponsable || '—'}
      </DetailField>
      <DetailField label="Último seguimiento">
        {pasantia.ultimoSeguimientoFechaLabel || 'Sin registros'}
      </DetailField>
    </DetailInfoCard>
  </div>
);

export default PasantiaEmpresaSection;
