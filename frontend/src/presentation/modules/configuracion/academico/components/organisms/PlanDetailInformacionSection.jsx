/**
 * Organismo: tab Información — ficha-hub del plan de estudio.
 * Datos generales + badge de estado vigente/borrador + botón "Editar"
 * (acción EDITAR, navega a `planEditarPath`, gateado por `ActionButton`).
 */

import { BookOutlined, EditOutlined } from '@ant-design/icons';
import DetailField from '@atoms/DetailField';
import DetailInfoCard from '@molecules/DetailInfoCard';
import StatusPill from '@atoms/StatusPill';
import { ActionButton } from '@atoms';
import { PLAN_ESTUDIO_PERMISO } from '@application-configuracion/academico/config/planEstudioPermisos';
import {
  getPlanVigenciaLabel,
  getPlanVigenciaPillClass,
  getPlanActivoLabel,
  getPlanActivoPillClass,
} from '@application-configuracion/academico/config/planVigenciaPill';

const PlanDetailInformacionSection = ({ plan, carrera, onEditar }) => {
  if (!plan) return null;

  const carreraLabel = carrera ? (carrera.codigo ? `${carrera.codigo} — ${carrera.nombre}` : carrera.nombre) : '—';

  return (
    <DetailInfoCard
      title="Datos generales del plan"
      icon={<BookOutlined />}
      cols={3}
      extra={
        <ActionButton
          permiso={PLAN_ESTUDIO_PERMISO}
          accion="EDITAR"
          variant="warning"
          icon={<EditOutlined />}
          onClick={onEditar}
        >
          Editar
        </ActionButton>
      }
    >
      <DetailField label="Carrera">{carreraLabel}</DetailField>
      <DetailField label="Resolución ministerial">{plan.resolucionMinisterial || '—'}</DetailField>
      <DetailField label="Estado">
        <StatusPill
          label={getPlanVigenciaLabel(plan.vigente)}
          className={getPlanVigenciaPillClass(plan.vigente)}
        />
      </DetailField>
      <DetailField label="Registro">
        <StatusPill label={getPlanActivoLabel(plan.activo)} className={getPlanActivoPillClass(plan.activo)} />
      </DetailField>
      <DetailField label="Duración (años)">{plan.duracionAnios ?? '—'}</DetailField>
      <DetailField label="Carga horaria total">
        {plan.cargaHorariaTotal != null ? `${plan.cargaHorariaTotal} h` : '—'}
      </DetailField>
      <DetailField label="Horas / semana">{plan.horasSemana ?? '—'}</DetailField>
      <DetailField label="Horas / mes">{plan.horasMes ?? '—'}</DetailField>
      <DetailField label="Horas / año">{plan.horasAnio ?? '—'}</DetailField>
      <DetailField label="Título otorgado" span={3}>
        {carrera?.tituloOtorgado || '—'}
      </DetailField>
      {plan.observaciones ? (
        <DetailField label="Observaciones" span={3}>
          {plan.observaciones}
        </DetailField>
      ) : null}
    </DetailInfoCard>
  );
};

export default PlanDetailInformacionSection;
