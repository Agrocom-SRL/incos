/**
 * Asignación académica — wizard por pasos (mismo patrón que InscripcionesNueva + WizardForm).
 */

import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { WizardForm } from '@organisms';
import { useDocentesAsignacionAcademicaContext } from '@application-docentes/hooks';
import DocentesAsignacionPlanSection from '@docentes/components/organisms/DocentesAsignacionPlanSection';
import DocentesAsignacionPeriodoSection from '@docentes/components/organisms/DocentesAsignacionPeriodoSection';
import DocentesAsignacionParaleloSection from '@docentes/components/organisms/DocentesAsignacionParaleloSection';
import DocentesAsignacionCursoSection from '@docentes/components/organisms/DocentesAsignacionCursoSection';
import DocentesAsignacionConfirmarSection from '@docentes/components/organisms/DocentesAsignacionConfirmarSection';
import '@modules/seguridad/styles/seguridad.css';
import '@docentes/styles/docentes-asignacion-academica.css';

const DocentesAsignacionAcademica = () => {
  const {
    form,
    editingAssignmentId,
    initialStep,
    wizardSteps,
    submittingAsignacion,
    docenteId,
    docenteNombre,
    breadcrumbItems,
    handleVolver,
    onValidateBeforeNext,
    handleWizardFinish,
    planes,
    loadingPlanes,
    errorPlanes,
    gestionPlanId,
    handleGestionPlanChange,
    periodos,
    loadingPeriodos,
    errorPeriodos,
    periodoId,
    handleSelectPeriodo,
    periodoNombreActual,
    paralelos,
    loadingParalelos,
    errorParalelos,
    paraleloId,
    handleSelectParalelo,
    paraleloNombreParaHorario,
    paraleloTurnoParaHorario,
    carreraNombreActual,
    cursos,
    loadingCursos,
    errorCursos,
    cursoId,
    setCursoId,
    resumenPlanLabel,
    resumenPeriodoLabel,
    resumenParaleloLabel,
    resumenCursoLabel,
    cargaHorariaOpt,
    courseSchedulesDesdeBloques,
    loadingHorarios,
    errorHorarios,
  } = useDocentesAsignacionAcademicaContext();

  const renderSectionContent = useCallback(
    (stepIndex, sectionKey, _section, wizardForm) => {
      if (sectionKey !== 'panel') return null;
      switch (stepIndex) {
        case 0:
          return (
            <DocentesAsignacionPlanSection
              key="plan"
              form={wizardForm}
              planes={planes}
              gestionPlanId={gestionPlanId}
              onGestionPlanChange={handleGestionPlanChange}
              loadingPlanes={loadingPlanes}
              errorPlanes={errorPlanes}
            />
          );
        case 1:
          return (
            <DocentesAsignacionPeriodoSection
              key="periodo"
              periodos={periodos}
              loading={loadingPeriodos}
              error={errorPeriodos}
              selectedPeriodoId={periodoId}
              onSelectPeriodo={handleSelectPeriodo}
              disabled={!gestionPlanId}
            />
          );
        case 2:
          return (
            <DocentesAsignacionParaleloSection
              key="paralelo"
              periodoNombre={periodoNombreActual}
              paralelos={paralelos}
              loading={loadingParalelos}
              error={errorParalelos}
              selectedParaleloId={paraleloId}
              onSelectParalelo={handleSelectParalelo}
              disabled={!gestionPlanId || !periodoId}
            />
          );
        case 3:
          return (
            <DocentesAsignacionCursoSection
              key="curso"
              cursos={cursos}
              loading={loadingCursos}
              error={errorCursos}
              selectedCursoId={cursoId}
              onSelectCurso={setCursoId}
              disabled={!paraleloId}
              paraleloNombre={paraleloNombreParaHorario}
              paraleloTurno={paraleloTurnoParaHorario}
              carreraNombre={carreraNombreActual}
            />
          );
        case 4:
          return (
            <DocentesAsignacionConfirmarSection
              key="confirmar"
              planLabel={resumenPlanLabel}
              periodoLabel={resumenPeriodoLabel}
              paraleloLabel={resumenParaleloLabel}
              cursoLabel={resumenCursoLabel}
              docenteId={docenteId}
              docenteNombre={docenteNombre}
              cargaHorariaOpt={cargaHorariaOpt}
              courseSchedulesPreview={courseSchedulesDesdeBloques}
              loadingHorariosPreview={loadingHorarios}
              errorHorariosPreview={errorHorarios}
            />
          );
        default:
          return null;
      }
    },
    [
      planes,
      gestionPlanId,
      handleGestionPlanChange,
      loadingPlanes,
      errorPlanes,
      periodos,
      loadingPeriodos,
      errorPeriodos,
      periodoId,
      periodoNombreActual,
      paraleloNombreParaHorario,
      paraleloTurnoParaHorario,
      carreraNombreActual,
      paralelos,
      loadingParalelos,
      errorParalelos,
      paraleloId,
      cursos,
      loadingCursos,
      errorCursos,
      cursoId,
      resumenPlanLabel,
      resumenPeriodoLabel,
      resumenParaleloLabel,
      resumenCursoLabel,
      docenteId,
      docenteNombre,
      cargaHorariaOpt,
      courseSchedulesDesdeBloques,
      loadingHorarios,
      errorHorarios,
    ]
  );

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Asignación académica"
          breadcrumbItems={breadcrumbItems}
          actions={
            <Button variant="default" icon={<ArrowLeftOutlined />} onClick={handleVolver}>
              Volver
            </Button>
          }
        />
      }
      sidebar={null}
    >
      <div className="daa-shell daa-page--wizard">
        {!docenteId && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            title="Ningún docente preseleccionado"
            description={
              <>
                Elegí un docente desde la{' '}
                <Link to="/docentes/listar">lista de docentes</Link> (acción en la fila) o abrí esta pantalla desde la
                ficha del docente.
              </>
            }
          />
        )}

        <div className="daa-asignacion-wizard-wrap">
          <WizardForm
            key={editingAssignmentId ? `edit-${editingAssignmentId}` : 'create'}
            className="daa-asignacion-wizard"
            steps={wizardSteps}
            form={form}
            loading={submittingAsignacion}
            viewMode={false}
            resolveOptions={() => []}
            onFinish={handleWizardFinish}
            showSaveButton={false}
            renderSectionContent={renderSectionContent}
            onValidateBeforeNext={onValidateBeforeNext}
            initialStep={initialStep}
            finishLabel={editingAssignmentId ? 'Guardar cambios de asignación' : 'Registrar asignación'}
            nextLabel="Siguiente"
            prevLabel="Anterior"
          />
        </div>
      </div>
    </PageTemplate>
  );
};

export default DocentesAsignacionAcademica;
