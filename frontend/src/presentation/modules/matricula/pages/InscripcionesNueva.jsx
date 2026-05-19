/**
 * InscripcionesNueva — Matrícula nueva/edición (solo UI).
 * Orquestación: useMatriculaWizardPage + InscripcionesNuevaProvider (useMatriculaWizardContext).
 */

import { useCallback, useMemo } from 'react';
import { Alert, Modal, Typography } from 'antd';
import { DollarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { WizardForm } from '@organisms';
import {
  InscripcionesCarreraStepContent,
  InscripcionesPeriodoParalelosStepContent,
  InscripcionesPeriodoMateriasStepContent,
  InscripcionesHistorialPrevioStepContent,
} from '@inscripciones/components/organisms';
import { WIZARD_SECTION_HISTORIAL } from '@application-inscripciones/utils/matriculaWizardStepConfig';
import { requiereHistorialPrevio } from '@application-inscripciones/utils/historialPrevioHelpers';
import { useMatriculaWizardPage } from '@application-inscripciones/hooks';

const { Paragraph } = Typography;

const InscripcionesNueva = () => {
  const {
    editData,
    pageTitle,
    breadcrumbItems,
    wizardSteps,
    form,
    loading,
    handleFinish,
    handleSave,
    paymentRequiredStudentId,
    clearPaymentRequiredDialog,
    handleGoToRegistrarPago,
    handleVolver,
    studentSearch,
    carrerasData,
    periodosData,
    paralelosData,
    materiasByPeriodsData,
    selectedMateriaIdsByPeriod,
    onToggleMaterias,
    onSelectParalelo,
    historialPrevioData,
    onSelectCarrera,
    isNuevoEstudiante,
    isTraspasoOrTransitabilidad,
    initialStep,
    initialValues,
    handleValidateBeforeNext,
    wizardStepMeta,
    materiasStepInvalid,
    setMateriasStepInvalid,
  } = useMatriculaWizardPage();

  const handleToggleMaterias = useCallback(
    (periodId, ids) => {
      setMateriasStepInvalid?.(false);
      onToggleMaterias?.(periodId, ids);
    },
    [onToggleMaterias, setMateriasStepInvalid],
  );

  const materiasInvalidHint = useMemo(
    () =>
      materiasStepInvalid
        ? 'Revise periodo, paralelo y materias: al menos una materia no tiene docente asignado vigente en esta gestión.'
        : null,
    [materiasStepInvalid],
  );

  const stepIndices = wizardStepMeta?.indices ?? {
    carrera: 1,
    periodo: 2,
    paralelo: 3,
    historial: null,
  };
  const needsHistorialStep = requiereHistorialPrevio(
    studentSearch?.selectedStudent?.tipoAdmision ?? editData?.tipoAdmision,
  );

  const renderSectionContent = useCallback(
    (stepIndex, sectionKey, section, formInstance) => {
      if (stepIndex === stepIndices.carrera && sectionKey === 'carrera') {
        return (
          <InscripcionesCarreraStepContent
            key={sectionKey}
            form={formInstance}
            section={section}
            carreras={carrerasData?.carreras ?? []}
            carrerasLoading={carrerasData?.loading ?? false}
            carrerasError={carrerasData?.error ?? null}
            selectedStudent={studentSearch?.selectedStudent ?? null}
            onCarreraChange={(carrera) => onSelectCarrera?.(carrera?.id)}
            readOnly={!!editData || isTraspasoOrTransitabilidad}
          />
        );
      }
      if (stepIndex === stepIndices.periodo && sectionKey === 'periodoYMaterias') {
        return (
          <InscripcionesPeriodoMateriasStepContent
            key={sectionKey}
            form={formInstance}
            section={section}
            periodosData={periodosData}
            materiasByPeriodsData={materiasByPeriodsData}
            selectedMateriaIdsByPeriod={selectedMateriaIdsByPeriod}
            onToggleMaterias={handleToggleMaterias}
            studentSearch={studentSearch}
            resolveOptions={() => []}
            readOnly={!!editData && isNuevoEstudiante}
            isEditModeAntiguo={!!editData && !isNuevoEstudiante}
            materiasInvalid={materiasStepInvalid}
            materiasInvalidHint={materiasInvalidHint}
          />
        );
      }
      if (stepIndex === stepIndices.paralelo && sectionKey === 'paralelos') {
        return (
          <InscripcionesPeriodoParalelosStepContent
            key={sectionKey}
            form={formInstance}
            section={section}
            periodosData={periodosData}
            paralelosData={paralelosData}
            carrerasData={carrerasData}
            onSelectParalelo={onSelectParalelo}
            resolveOptions={() => []}
          />
        );
      }
      if (
        stepIndices.historial != null &&
        stepIndex === stepIndices.historial &&
        sectionKey === WIZARD_SECTION_HISTORIAL &&
        needsHistorialStep
      ) {
        return (
          <InscripcionesHistorialPrevioStepContent
            key={sectionKey}
            section={section}
            historialPrevioData={historialPrevioData}
          />
        );
      }
      return null;
    },
    [
      stepIndices,
      needsHistorialStep,
      editData,
      isTraspasoOrTransitabilidad,
      isNuevoEstudiante,
      carrerasData,
      studentSearch,
      onSelectCarrera,
      periodosData,
      paralelosData,
      materiasByPeriodsData,
      selectedMateriaIdsByPeriod,
      handleToggleMaterias,
      materiasStepInvalid,
      materiasInvalidHint,
      onSelectParalelo,
      historialPrevioData,
    ],
  );

  return (
    <>
      <Modal
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarOutlined style={{ color: '#faad14', fontSize: 28 }} />
            Pago de aporte requerido
          </span>
        }
        open={!!paymentRequiredStudentId}
        onCancel={clearPaymentRequiredDialog}
        onOk={handleGoToRegistrarPago}
        okText="Ir a registrar pago"
        cancelText="Cancelar"
        width={480}
        closable
      >
        <Paragraph style={{ marginBottom: 0 }}>
          El estudiante no ha realizado el pago del aporte académico para esta gestión. Debe registrar el pago antes de
          inscribirse.
        </Paragraph>
        <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
          ¿Desea ir a registrar el pago de este estudiante ahora?
        </Paragraph>
      </Modal>

      <PageTemplate
        header={
          <PageHeader
            title={pageTitle}
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
        {editData?.completarSoloHistorialPrevio ? (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            title="Completar historial de notas"
            description="Esta inscripción es de tipo antiguo, traspaso o transitabilidad y aún no tiene registradas las notas de periodos anteriores. Use el paso «Historial de notas» (último del asistente) para ingresar las notas y finalizar. Puede volver a pasos anteriores si también desea ajustar periodos, materias o paralelos."
          />
        ) : null}
        <WizardForm
          steps={wizardSteps}
          loading={loading}
          viewMode={false}
          resolveOptions={() => []}
          initialValues={initialValues}
          form={form}
          onFinish={handleFinish}
          onSave={handleSave}
          showSaveButton={false}
          initialStep={initialStep}
          renderSectionContent={renderSectionContent}
          onValidateBeforeNext={handleValidateBeforeNext}
        />
      </PageTemplate>
    </>
  );
};

export default InscripcionesNueva;
