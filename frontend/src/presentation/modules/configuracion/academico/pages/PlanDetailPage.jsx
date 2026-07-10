/**
 * Ficha-hub del plan de estudio (Fase 10) — orquestación UI (ficha sd-profile + documento).
 * Patrón: gemelo de `CarreraDetailPage`/`MateriaDetailPage` en la cabecera
 * (`DetailProfileCard`, acciones «Editar»/«Publicar vigente»/«Nueva versión
 * (RM)»), pero el cuerpo ya NO usa tabs: se reemplazó por
 * `PlanEstudioDocumentoView` (mismo documento estilo RM 0210/2023 del tab
 * «Planes», ver `PlanesTabPanel.jsx`) en modo `editable`, con un lápiz por
 * columna de periodo que navega al builder drag & drop
 * (`PlanPeriodoAsignaturasPage`, `planPeriodoAsignaturasPath`). El alta de
 * periodo («+ Periodo») se resuelve aquí mismo con `PeriodoFormModal`; editar
 * o eliminar un periodo existente vive en el builder de ese periodo.
 */

import { useMemo, useState } from 'react';
import { Alert, Popconfirm } from 'antd';
import { BookOutlined, CopyOutlined, EditOutlined, PlusOutlined, RocketOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailProfileCard from '@organisms/DetailProfileCard';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { ActionButton } from '@atoms';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import { usePlanDetallePage } from '@application-configuracion/academico/hooks';
import {
  PLAN_ESTUDIO_PERMISO,
  PLAN_PERIODOS_PERMISO,
} from '@application-configuracion/academico/config/planEstudioPermisos';
import {
  getPlanVigenciaLabel,
  getPlanVigenciaPillClass,
} from '@application-configuracion/academico/config/planVigenciaPill';
import { buildPlanDocumentoThemeVars } from '@application-configuracion/academico/utils/planDocumentoTheme';
import PlanEstudioDocumentoView from '@configuracion/academico/components/organisms/PlanEstudioDocumentoView';
import PeriodoFormModal from '@configuracion/academico/components/molecules/PeriodoFormModal';
import StatusPill from '@atoms/StatusPill';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';
import '../styles/plan-documento.css';

const PlanDetailPage = () => {
  const {
    plan,
    planMetaRaw,
    carrera,
    periodos,
    prereqSiglaByAsignaturaId,
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
    handleEditarPeriodo,
    handlePublicar,
    handleNuevaVersion,
    handleCrearPeriodo,
    refetch,
  } = usePlanDetallePage();

  const [periodoModalOpen, setPeriodoModalOpen] = useState(false);

  const accent = sanitizeDocenteColorHex(avatarColor) || undefined;

  const themeVars = useMemo(
    () => buildPlanDocumentoThemeVars(carrera?.colorHex),
    [carrera?.colorHex],
  );

  const handleSubmitPeriodo = async (values) => {
    const ok = await handleCrearPeriodo(values);
    if (ok) setPeriodoModalOpen(false);
    return ok;
  };

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
        permiso={PLAN_PERIODOS_PERMISO}
        accion="CREAR"
        variant="info"
        icon={<PlusOutlined />}
        onClick={() => setPeriodoModalOpen(true)}
      >
        Periodo
      </ActionButton>

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

            <PlanEstudioDocumentoView
              carrera={carrera}
              planMeta={planMetaRaw}
              periodos={periodos}
              prereqSiglaByAsignaturaId={prereqSiglaByAsignaturaId}
              themeVars={themeVars}
              editable
              onEditarPeriodo={handleEditarPeriodo}
            />

            <PeriodoFormModal
              open={periodoModalOpen}
              mode="create"
              loading={guardando}
              initialValues={{ numero: (periodos.length || 0) + 1 }}
              onCancel={() => setPeriodoModalOpen(false)}
              onSubmit={handleSubmitPeriodo}
            />
          </>
        ) : null}
      </DetailPageShell>
    </PageTemplate>
  );
};

export default PlanDetailPage;
