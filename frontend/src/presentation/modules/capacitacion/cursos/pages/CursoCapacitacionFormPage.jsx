/**
 * ABM de curso de capacitación (alta y edición) — workspace alineado a CFG
 * Académico. Gemelo de `PlanFormPage`: UNA tarjeta con secciones internas
 * (`CursoCapacitacionFormSections`, prop `sections` de `CfgFormWorkspace`),
 * botón guardar en el footer de la tarjeta.
 *
 * Página "dumb": la orquestación vive en `useCursoCapacitacionFormPage`.
 */
import { useCallback } from 'react';
import { Alert, Flex, Form, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton } from '@atoms';
import { FormWorkspaceSection, WizardForm } from '@organisms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useCursoCapacitacionFormPage } from '@application-capacitacion/cursos/hooks/state/useCursoCapacitacionFormPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import CursoGruposEditor from '../components/molecules/CursoGruposEditor';
import CursoRequisitosEditor from '../components/molecules/CursoRequisitosEditor';
import HorarioCrearModal from '../components/organisms/HorarioCrearModal';
import '@presentation/styles/pages/detail-page.css';
import '@configuracion/academico/styles/academico-form-page.css';

const CursoCapacitacionFormPage = ({ mode = 'create' }) => {
  const {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    loading,
    submitLoading,
    error,
    wizardSteps,
    initialStep,
    onValidateBeforeNext,
    handleValidationError,
    stepError,
    horarioOptions,
    horarioDias,
    loadingHorarios,
    errorHorarios,
    creandoHorario,
    horarioCrear,
    aulas,
    loadingAulas,
    aulasDisponible,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  } = useCursoCapacitacionFormPage(mode);

  /**
   * Todas las secciones se pintan con `FormWorkspaceSection` (el mismo contenedor plano de la
   * admisión de estudiantes: título y texto de ayuda a la izquierda, etiquetas arriba y campos a
   * ancho completo), porque el `FormSection` por defecto de `WizardForm` cambia la composición y
   * no reenvía la descripción. Pasos 2 y 3: editores propios con sub-secciones.
   */
  const renderSectionContent = useCallback(
    (_stepIndex, sectionKey, section) => {
      if (sectionKey === 'datosCurso' || sectionKey === 'costos') {
        return (
          <FormWorkspaceSection
            key={sectionKey}
            title={section.title}
            description={section.description}
            fields={section.fields}
            form={form}
            resolveOptions={() => []}
          />
        );
      }
      if (sectionKey === 'gruposHorarios') {
        return (
          <CursoGruposEditor
            key={sectionKey}
            title={section.title}
            description={section.description}
            horarioOptions={horarioOptions}
            horarioDias={horarioDias}
            loadingHorarios={loadingHorarios}
            errorHorarios={errorHorarios}
            onCrearHorario={horarioCrear.abrirCrear}
            aulaOptions={aulas}
            loadingAulas={loadingAulas}
            aulasDisponible={aulasDisponible}
          />
        );
      }
      if (sectionKey === 'requisitos') {
        return (
          <CursoRequisitosEditor
            key={sectionKey}
            title={section.title}
            description={section.description}
          />
        );
      }
      return null;
    },
    [
      form,
      horarioOptions,
      horarioDias,
      loadingHorarios,
      errorHorarios,
      horarioCrear.abrirCrear,
      aulas,
      loadingAulas,
      aulasDisponible,
    ],
  );

  const header = (
    <PageHeaderArea>
      <PageHeader
        title={pageTitle}
        breadcrumbItems={breadcrumbItems}
        actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
      />
    </PageHeaderArea>
  );

  if (isInvalidEditId) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        {header}
        <DashboardPageShell>
          <MainContent>
            <Alert type="error" showIcon title="Identificador de curso inválido" />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  return (
    <PermisoGuard
      codigo={CAPACITACION_PERMISOS.curso}
      accion={permisoAccion}
      fallback={
        <Typography.Text type="danger">No tiene permiso para guardar cursos de capacitación.</Typography.Text>
      }
    >
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        {header}

        <DashboardPageShell>
          <MainContent>
            <Spin spinning={loading} tip="Cargando curso…">
              <Flex vertical gap="middle" className="cfg-academico-page__stack">
                {error ? <Alert type="error" showIcon title={error} /> : null}

                <WizardForm
                  variant="tabs"
                  steps={wizardSteps}
                  form={form}
                  loading={submitLoading || loading}
                  viewMode={false}
                  resolveOptions={() => []}
                  initialStep={initialStep}
                  onFinish={handleSubmit}
                  showSaveButton={false}
                  renderSectionContent={renderSectionContent}
                  onValidateBeforeNext={onValidateBeforeNext}
                  onValidationError={handleValidationError}
                  errorMessage={stepError}
                  finishLabel="Guardar curso"
                  nextLabel="Siguiente"
                  prevLabel="Anterior"
                />
              </Flex>

              <HorarioCrearModal
                open={horarioCrear.crearOpen}
                creando={creandoHorario}
                error={horarioCrear.errorCrear}
                onCrear={horarioCrear.handleCrearHorario}
                onCancel={horarioCrear.cerrarCrear}
              />
            </Spin>
          </MainContent>
        </DashboardPageShell>
      </Flex>
    </PermisoGuard>
  );
};

export default CursoCapacitacionFormPage;
