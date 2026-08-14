/**
 * InscripcionesNueva — Matrícula nueva/edición (solo UI).
 * Orquestación: useMatriculaWizardPage + InscripcionesNuevaProvider (useMatriculaWizardContext).
 *
 * Shell de página igual al registro de estudiantes (EstudiantesRegister):
 * PageHeaderArea + PageHeader + BackButton, DashboardPageShell + MainContent y
 * WizardForm variant="tabs" con navegación estricta hacia adelante.
 *
 * Sin franja ni Alerts del estudiante encima del wizard: los datos del
 * estudiante elegido se ven en la propia fila seleccionada del paso «Buscar»
 * y el resto del contexto (carrera, plan, gestión) en sus pasos.
 */

import { useCallback, useMemo } from 'react';
import { Alert, Flex, Modal, Typography } from 'antd';
import { DollarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton } from '@atoms';
import { WizardForm, FormWorkspaceSection } from '@organisms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import {
  InscripcionesCarreraStepContent,
  InscripcionesPeriodoParalelosStepContent,
  InscripcionesPeriodoMateriasStepContent,
  InscripcionesHistorialPrevioStepContent,
  InscripcionSeleccionResumen,
} from '@matricula/registro/components/organisms';
import { WIZARD_SECTION_HISTORIAL } from '@application-matricula/registro/utils/matriculaWizardStepConfig';
import { useMatriculaWizardPage } from '@application-matricula/registro/hooks';
import '@configuracion/academico/styles/academico-form-page.css';

const { Paragraph } = Typography;

// Secciones "planas" (solo fields, sin componente visual propio): buscador del paso 1.
// Se pintan con FormWorkspaceSection (sin Card anidada).
const FLAT_FORM_SECTION_KEYS = ['buscarEstudiante'];

const InscripcionesNueva = () => {
  const {
    editData,
    pageTitle,
    breadcrumbItems,
    wizardSteps,
    form,
    loading,
    error,
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
    selectedMateriaIdsByPeriod,
    onToggleMaterias,
    onSelectParalelo,
    historialPrevioData,
    onSelectCarrera,
    tipoAdmision,
    anioCursadoTraspaso,
    isNuevoEstudiante,
    isTraspasoOrTransitabilidad,
    initialStep,
    initialValues,
    handleValidateBeforeNext,
    wizardStepMeta,
    materiasStepInvalid,
    setMateriasStepInvalid,
    matriculaContexto,
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

  // Índices dinámicos del wizard (matriz §2): «carrera»/«historial» pueden ser
  // null cuando el paso está excluido — no usar números mágicos aquí.
  const stepIndices = useMemo(
    () =>
      wizardStepMeta?.indices ?? {
        buscar: 0,
        carrera: 1,
        periodo: 2,
        paralelo: 3,
        historial: null,
      },
    [wizardStepMeta?.indices],
  );

  const selectedStudent = studentSearch?.selectedStudent ?? null;
  const contexto = matriculaContexto?.contexto ?? null;

  // La planilla del paso «Periodo y materias» necesita saber si ya hay carrera
  // (fija del estudiante o elegida en el paso Carrera) para su hint inicial.
  const hasCarrera = Boolean(
    contexto?.carrera?.id ??
      carrerasData?.selectedCarrera?.id ??
      selectedStudent?.carreraId ??
      editData?.carreraId ??
      null,
  );

  // Al fallar la validación del paso, desplazar la vista al primer campo con error.
  // Las validaciones custom (carrera/periodo/paralelo/historial) rechazan sin errorFields
  // y ya muestran su propio message.error, por lo que aquí no se hace nada en ese caso.
  const onValidationError = useCallback(
    (err) => {
      const firstErrorField = err?.errorFields?.[0]?.name;
      if (firstErrorField) {
        form.scrollToField(firstErrorField, { behavior: 'smooth', block: 'center' });
      }
    },
    [form],
  );

  const renderSectionContent = useCallback(
    (stepIndex, sectionKey, section, formInstance) => {
      if (stepIndices.carrera != null && stepIndex === stepIndices.carrera && sectionKey === 'carrera') {
        return (
          <InscripcionesCarreraStepContent
            key={sectionKey}
            form={formInstance}
            section={section}
            carreras={carrerasData?.carreras ?? []}
            carrerasLoading={carrerasData?.loading ?? false}
            carrerasError={carrerasData?.error ?? null}
            selectedStudent={selectedStudent}
            onCarreraChange={(carrera) => onSelectCarrera?.(carrera?.id)}
            readOnly={!!editData || isTraspasoOrTransitabilidad}
            isEditMode={!!editData}
            planData={matriculaContexto}
          />
        );
      }
      if (stepIndex === stepIndices.periodo && sectionKey === 'periodoYMaterias') {
        return (
          <InscripcionesPeriodoMateriasStepContent
            key={sectionKey}
            section={section}
            matriculaContexto={matriculaContexto}
            tipoAdmision={tipoAdmision}
            traspasoAnioCursado={anioCursadoTraspaso}
            hasCarrera={hasCarrera}
            selectedMateriaIdsByPeriod={selectedMateriaIdsByPeriod}
            onToggleMaterias={handleToggleMaterias}
            readOnly={!!editData && isNuevoEstudiante}
            materiasInvalid={materiasStepInvalid}
            materiasInvalidHint={materiasInvalidHint}
          />
        );
      }
      if (stepIndex === stepIndices.paralelo && sectionKey === 'resumen') {
        return (
          <InscripcionSeleccionResumen
            key={sectionKey}
            section={section}
            contexto={contexto}
            tipoAdmision={tipoAdmision}
            esNuevoSistema={matriculaContexto?.esNuevoSistema ?? null}
            traspasoAnioCursado={anioCursadoTraspaso}
            selectedMateriaIdsByPeriod={selectedMateriaIdsByPeriod}
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
        sectionKey === WIZARD_SECTION_HISTORIAL
      ) {
        return (
          <InscripcionesHistorialPrevioStepContent
            key={sectionKey}
            section={section}
            historialPrevioData={historialPrevioData}
          />
        );
      }
      if (FLAT_FORM_SECTION_KEYS.includes(sectionKey)) {
        return (
          <FormWorkspaceSection
            key={sectionKey}
            title={section?.title}
            description={section?.description}
            fields={section?.fields}
            form={formInstance}
            resolveOptions={() => []}
            readOnly={false}
          />
        );
      }
      // Ninguna sección del wizard debería llegar hasta acá; se deja el fallback de
      // WizardForm (FormSection con Card) solo como defensa ante una sección futura sin caso propio.
      return null;
    },
    [
      stepIndices,
      editData,
      isTraspasoOrTransitabilidad,
      isNuevoEstudiante,
      carrerasData,
      selectedStudent,
      onSelectCarrera,
      matriculaContexto,
      contexto,
      tipoAdmision,
      anioCursadoTraspaso,
      hasCarrera,
      periodosData,
      paralelosData,
      selectedMateriaIdsByPeriod,
      handleToggleMaterias,
      materiasStepInvalid,
      materiasInvalidHint,
      onSelectParalelo,
      historialPrevioData,
    ],
  );

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
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

      <PageHeaderArea>
        <PageHeader
          title={pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={
            <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
              Volver
            </BackButton>
          }
        />
      </PageHeaderArea>

      <DashboardPageShell>
        <MainContent>
          {editData?.completarSoloHistorialPrevio ? (
            <Alert
              type="warning"
              showIcon
              title="Completar historial de notas"
              description="Esta inscripción es de tipo antiguo, traspaso o transitabilidad y aún no tiene registradas las notas de periodos anteriores. Use el paso «Historial de notas» (último del asistente) para ingresar las notas y finalizar. Puede volver a pasos anteriores si también desea ajustar periodos, materias o paralelos."
            />
          ) : null}
          <WizardForm
            variant="tabs"
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
            onValidationError={onValidationError}
            strictForwardNavigation
            errorMessage={error}
          />
        </MainContent>
      </DashboardPageShell>
    </Flex>
  );
};

export default InscripcionesNueva;
