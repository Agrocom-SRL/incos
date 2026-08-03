/**
 * Organismo: tab "Datos" de la ficha-hub del trámite de pasantía (TIT).
 *
 * DetailInfoCard + DetailField (patrón ProyectoDatosSection). Recibe el
 * trámite ya mapeado (vista 168); no llama hooks. La sección de contrato
 * solo se muestra en el camino CONVALIDACION.
 */

import { IdcardOutlined, ShopOutlined, SolutionOutlined, UserOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField, StatusPill } from '@atoms';
import {
  formatEstadoPasantia,
  formatTipoContrato,
  formatTipoPasantia,
  formatTipoSocietario,
  getEstadoPasantiaPillClass,
} from '@application-titulacion/utils/pasantiasPills';

const PasantiaDatosSection = ({ pasantia }) => (
  <div className="sd-tab-body">
    <DetailInfoCard title="Datos del trámite" icon={<SolutionOutlined />} cols={3}>
      <DetailField label="Camino">{formatTipoPasantia(pasantia.tipo)}</DetailField>
      <DetailField label="Estado">
        <StatusPill
          label={formatEstadoPasantia(pasantia.estado)}
          className={getEstadoPasantiaPillClass(pasantia.estado)}
        />
      </DetailField>
      <DetailField label="Gestión">{pasantia.gestionLabel || '—'}</DetailField>
      <DetailField label="Fecha de inicio">{pasantia.fechaInicioLabel || '—'}</DetailField>
      <DetailField label="Fecha de finalización">
        {pasantia.fechaFinalizacionLabel || '—'}
      </DetailField>
      <DetailField label="Horas (cumplidas / requeridas)">{pasantia.horasLabel || '—'}</DetailField>
      <DetailField label="Registrado el">{pasantia.createdAtLabel || '—'}</DetailField>
      {pasantia.observaciones ? (
        <DetailField label="Observaciones" span={3}>
          {pasantia.observaciones}
        </DetailField>
      ) : null}
    </DetailInfoCard>

    <DetailInfoCard title="Estudiante" icon={<IdcardOutlined />} cols={3}>
      <DetailField label="Nombre completo">{pasantia.estudianteNombre || '—'}</DetailField>
      <DetailField label="Código de estudiante">{pasantia.codigoEstudiante || '—'}</DetailField>
      <DetailField label="C.I.">{pasantia.estudianteCi || '—'}</DetailField>
      <DetailField label="Carrera">{pasantia.carreraNombre || '—'}</DetailField>
      <DetailField label="Celular">{pasantia.estudianteCelular || '—'}</DetailField>
    </DetailInfoCard>

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

export default PasantiaDatosSection;
