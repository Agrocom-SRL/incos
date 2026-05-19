/**
 * InscripcionesNueva — Matrícula nueva/edición (solo UI).
 * Orquestación: useMatriculaWizardPage + InscripcionesNuevaProvider (useMatriculaWizardContext).
 */

import { useCallback } from 'react';
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
} from '@inscripciones/components/organisms';
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
  } = useMatriculaWizardPage();

  const renderSectionContent = useCallback(
    (stepIndex, sectionKey, section, formInstance) => {
      if (stepIndex === 1 && sectionKey === 'carrera') {
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
      if (stepIndex === 2 && sectionKey === 'periodoYMaterias') {
        return (
          <InscripcionesPeriodoMateriasStepContent
            key={sectionKey}
            form={formInstance}
            section={section}
            periodosData={periodosData}
            materiasByPeriodsData={materiasByPeriodsData}
            selectedMateriaIdsByPeriod={selectedMateriaIdsByPeriod}
            onToggleMaterias={onToggleMaterias}
            studentSearch={studentSearch}
            resolveOptions={() => []}
            readOnly={!!editData && isNuevoEstudiante}
            isEditModeAntiguo={!!editData && !isNuevoEstudiante}
            historialPrevioData={
              !isNuevoEstudiante && historialPrevioData?.needsHistorial
                ? historialPrevioData
                : null
            }
          />
        );
      }
      if (stepIndex === 3 && sectionKey === 'paralelos') {
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
      return null;
    },
    [
      editData,
      isTraspasoOrTransitabilidad,
      isNuevoEstudiante,
      carrerasData,
      studentSearch?.selectedStudent,
      onSelectCarrera,
      periodosData,
      paralelosData,
      materiasByPeriodsData,
      selectedMateriaIdsByPeriod,
      onToggleMaterias,
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
            title="Completar historial previo"
            description="Esta inscripción es de tipo antiguo, traspaso o transitabilidad y aún no tiene registradas las notas de periodos anteriores. Ingrese la nota (61–100) o estado convalidado según corresponda y guarde. Puede continuar al paso de materias si también desea ajustar la matrícula actual."
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
