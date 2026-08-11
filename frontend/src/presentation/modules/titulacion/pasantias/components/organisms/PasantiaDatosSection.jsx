/**
 * Organismo: tab "Datos" de la ficha-hub del trámite de pasantía (TIT) —
 * datos del trámite y del estudiante. La info de empresa/puesto, contrato de
 * trabajo (convalidación) y supervisión se separó a `PasantiaEmpresaSection`
 * (extensión 2026-08-11, pedido explícito del usuario): son datos de un
 * tercero (la empresa), no del trámite en sí ni del estudiante.
 *
 * DetailInfoCard + DetailField (patrón ProyectoDatosSection). Recibe el
 * trámite ya mapeado (vista 168); no llama hooks.
 */

import { IdcardOutlined, SolutionOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { DetailField, StatusPill } from '@atoms';
import {
  formatEstadoPasantia,
  formatTipoPasantia,
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
  </div>
);

export default PasantiaDatosSection;
