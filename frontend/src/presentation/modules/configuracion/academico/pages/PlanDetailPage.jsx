/**
 * Ficha-hub del plan de estudio (Fase 8) — orquestación UI (ficha sd-profile + tabs).
 * Patrón: gemelo de `CarreraDetailPage`/`MateriaDetailPage`, con acciones de
 * cabecera adicionales (publicar vigente / nueva versión por RM) igual que
 * `UsuarioDetailPage` (acciones gateadas por `ActionButton` en el tab «Rol y acceso»).
 */

import { useMemo } from 'react';
import { Alert, Popconfirm } from 'antd';
import { BookOutlined, CopyOutlined, EditOutlined, RocketOutlined, ScheduleOutlined, ShareAltOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailTabLabel from '@molecules/DetailTabLabel';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailTabsPanel from '@organisms/DetailTabsPanel';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { ActionButton } from '@atoms';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import { usePlanDetallePage } from '@application-configuracion/academico/hooks';
import { PLAN_ESTUDIO_PERMISO } from '@application-configuracion/academico/config/planEstudioPermisos';
import {
  getPlanVigenciaLabel,
  getPlanVigenciaPillClass,
} from '@application-configuracion/academico/config/planVigenciaPill';
import PlanDetailInformacionSection from '@configuracion/academico/components/organisms/PlanDetailInformacionSection';
import PlanMatrizEditorSection from '@configuracion/academico/components/organisms/PlanMatrizEditorSection';
import PlanPrerrequisitosSection from '@configuracion/academico/components/organisms/PlanPrerrequisitosSection';
import StatusPill from '@atoms/StatusPill';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';
import '../styles/plan-matriz.css';

const PlanDetailPage = () => {
  const {
    plan,
    carrera,
    periodos,
    horasTotalPlan,
    prerrequisitos,
    asignaturasFlat,
    materiasDisponiblesPorPeriodo,
    materiasLoading,
    loading,
    error,
    isInvalidId,
    avatarInitials,
    avatarColor,
    breadcrumbItems,
    publicando,
    creandoVersion,
    guardando,
    handleVolver,
    handleEditar,
    handlePublicar,
    handleNuevaVersion,
    handleCrearPeriodo,
    handleActualizarPeriodo,
    handleEliminarPeriodo,
    handleCrearAsignatura,
    handleActualizarAsignatura,
    handleEliminarAsignatura,
    handleCrearPrerrequisito,
    handleEliminarPrerrequisito,
    refetch,
  } = usePlanDetallePage();

  const accent = sanitizeDocenteColorHex(avatarColor) || undefined;

  const tabItems = useMemo(() => {
    if (!plan) return [];
    return [
      {
        key: 'informacion',
        label: <DetailTabLabel icon={<BookOutlined />}>Información</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <PlanDetailInformacionSection plan={plan} carrera={carrera} onEditar={handleEditar} />
          </div>
        ),
      },
      {
        key: 'matriz',
        label: <DetailTabLabel icon={<ScheduleOutlined />}>Periodos y asignaturas</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <PlanMatrizEditorSection
              periodos={periodos}
              horasTotalPlan={horasTotalPlan}
              materiasDisponiblesPorPeriodo={materiasDisponiblesPorPeriodo}
              materiasLoading={materiasLoading}
              guardando={guardando}
              onCrearPeriodo={handleCrearPeriodo}
              onActualizarPeriodo={handleActualizarPeriodo}
              onEliminarPeriodo={handleEliminarPeriodo}
              onCrearAsignatura={handleCrearAsignatura}
              onActualizarAsignatura={handleActualizarAsignatura}
              onEliminarAsignatura={handleEliminarAsignatura}
            />
          </div>
        ),
      },
      {
        key: 'prerrequisitos',
        label: <DetailTabLabel icon={<ShareAltOutlined />}>Prerrequisitos</DetailTabLabel>,
        children: (
          <div className="sd-tab-body">
            <PlanPrerrequisitosSection
              periodos={periodos}
              asignaturasFlat={asignaturasFlat}
              prerrequisitos={prerrequisitos}
              guardando={guardando}
              onCrearPrerrequisito={handleCrearPrerrequisito}
              onEliminarPrerrequisito={handleEliminarPrerrequisito}
            />
          </div>
        ),
      },
    ];
  }, [
    plan,
    carrera,
    periodos,
    horasTotalPlan,
    asignaturasFlat,
    prerrequisitos,
    materiasDisponiblesPorPeriodo,
    materiasLoading,
    guardando,
    handleEditar,
    handleCrearPeriodo,
    handleActualizarPeriodo,
    handleEliminarPeriodo,
    handleCrearAsignatura,
    handleActualizarAsignatura,
    handleEliminarAsignatura,
    handleCrearPrerrequisito,
    handleEliminarPrerrequisito,
  ]);

  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  if (isInvalidId) {
    return (
      <PageTemplate
        header={<PageHeader title="Detalle de plan" breadcrumbItems={breadcrumbItems} actions={headerActions} />}
      >
        <Alert type="error" showIcon title="Identificador de plan de estudio inválido" />
      </PageTemplate>
    );
  }

  const profileActions = plan ? (
    <>
      <ActionButton
        permiso={PLAN_ESTUDIO_PERMISO}
        accion="EDITAR"
        variant="warning"
        icon={<EditOutlined />}
        onClick={handleEditar}
      >
        Editar
      </ActionButton>

      {!plan.vigente ? (
        <Popconfirm
          title="Publicar como vigente"
          description="El plan vigente actual de esta carrera pasará a borrador (histórico). Los estudiantes ya inscritos no se migran. ¿Continuar?"
          okText="Publicar"
          okButtonProps={{ loading: publicando }}
          cancelText="Cancelar"
          onConfirm={handlePublicar}
        >
          <ActionButton
            permiso={PLAN_ESTUDIO_PERMISO}
            accion="ACTIVAR"
            variant="primary"
            icon={<RocketOutlined />}
            loading={publicando}
          >
            Publicar como vigente
          </ActionButton>
        </Popconfirm>
      ) : null}

      {plan.vigente ? (
        <ActionButton
          permiso={PLAN_ESTUDIO_PERMISO}
          accion="CREAR"
          variant="alternative"
          icon={<CopyOutlined />}
          loading={creandoVersion}
          onClick={handleNuevaVersion}
        >
          Nueva versión (RM)
        </ActionButton>
      ) : null}
    </>
  ) : null;

  return (
    <PageTemplate
      header={<PageHeader title="Detalle de plan de estudio" breadcrumbItems={breadcrumbItems} actions={headerActions} />}
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando plan de estudio…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && !plan}
        emptyDescription="No se encontró el plan de estudio solicitado"
      >
        {plan ? (
          <>
            <DetailProfileCard
              avatarInitials={avatarInitials}
              avatarStyle={accent ? { backgroundColor: accent } : undefined}
              active={plan.activo !== false}
              title={plan.nombrePlan}
              subtitle={
                <>
                  <BookOutlined /> {carrera?.nombre || '—'}
                  {plan.resolucionMinisterial ? ` · RM ${plan.resolucionMinisterial}` : ''}
                </>
              }
              metaExtra={
                <StatusPill
                  label={getPlanVigenciaLabel(plan.vigente)}
                  className={getPlanVigenciaPillClass(plan.vigente)}
                />
              }
              stats={[
                { label: 'Duración', value: plan.duracionAnios ? `${plan.duracionAnios} años` : '—', primary: true },
                { label: 'Periodos', value: periodos.length || '—' },
                { label: 'Carga horaria', value: plan.cargaHorariaTotal != null ? `${plan.cargaHorariaTotal} h` : '—' },
              ]}
              actions={profileActions}
            />

            <DetailTabsPanel items={tabItems} defaultActiveKey="informacion" />
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default PlanDetailPage;
