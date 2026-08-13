/**
 * EstudiantesAsignarBeca - Página para asignar (o editar) una beca a un estudiante
 *
 * Single Responsibility: Orquestar el wizard de asignación de beca
 *
 * Atomic Design: Page
 * - Shell alineado al ABM de referencia (CarreraFormPage / ParaleloFormPage):
 *   PageHeaderArea (PageHeader + BackButton) + DashboardPageShell + MainContent.
 * - El contenido es un `WizardForm variant="tabs"` de 2 pasos (patrón UsuarioCreatePage:
 *   pasos 100% custom vía `renderSectionContent` y `config` vacío por sección):
 *   1. "Beca o descuento" → grilla de selección (`BecaSelectionSection`). Elegir
 *      una card completa el paso: tras una pausa breve se avanza solo a
 *      "Confirmación" (goToStep vía ref, sin pulsar "Siguiente").
 *   2. "Confirmación" → resumen compacto estudiante | beca + motivo
 *      (`AsignacionBecaResumen` dentro de `FormWorkspaceSection`).
 * - En modo edición el wizard abre directo en "Confirmación" (`initialStep={1}`);
 *   el paso 1 queda navegable hacia atrás para cambiar de beca.
 * - RBAC: el contenido va dentro de `PermisoGuard` (`matricula.beca.asignar`,
 *   CREAR/EDITAR según modo), ya que el botón Finalizar del wizard reemplaza
 *   al `ActionButton` con permiso del footer anterior.
 *
 * Arquitectura:
 * Page → shell global + WizardForm (organismo compartido)
 * - Toda la lógica vive en AsignarBecaProvider (useAsignarBecaContext).
 */

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, App, Flex, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { BackButton, Button } from '@atoms';
import { FormWorkspaceSection, WizardForm } from '@organisms';
import DashboardPageShell from '@presentation/modules/dashboard/components/organisms/DashboardPageShell';
import { useStudentDetailContext } from '@application-matricula/admision/hooks';
import { useAsignarBecaContext } from '@application-matricula/becas/hooks/context/useAsignarBecaContext';
import BecaSelectionSection from '@matricula/becas/components/organisms/BecaSelectionSection';
import AsignacionBecaResumen from '@matricula/becas/components/organisms/AsignacionBecaResumen';
import BecaCardContent from '@matricula/becas/components/molecules/BecaCardContent';
import '@configuracion/academico/styles/academico-form-page.css';

// Pausa entre elegir una beca y avanzar solo a "Confirmación": deja ver el
// estado seleccionado sin frenar el flujo (el pedido de UX fija < 2 s).
const AUTO_ADVANCE_DELAY_MS = 900;

const EstudiantesAsignarBeca = () => {
  const location = useLocation();
  const { message } = App.useApp();

  // Obtener studentId del estado de navegación
  const studentId = location.state?.studentId || null;

  // Obtener datos del estudiante
  const studentDetailContext = useStudentDetailContext();
  const student = studentDetailContext?.student?.student || null;
  const loadingStudent = studentDetailContext?.loading || false;

  // Obtener TODO del contexto de asignar beca (toda la lógica está aquí)
  const {
    pageTitle,
    breadcrumbItems,
    handleVolver,
    form,
    handleFinish,
    loading: loadingAsignar,
    error: submitError,
    becasDescuentosData,
    isEditMode,
  } = useAsignarBecaContext();

  const backAction = (
    <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver}>
      Volver
    </BackButton>
  );

  // Card de beca con su estado de selección (pinta el check de confirmación)
  const selectedBecaId = becasDescuentosData.selectedBecaDescuento?.id ?? null;
  const renderBecaCard = useCallback(
    (beca) => <BecaCardContent beca={beca} selected={beca.id === selectedBecaId} />,
    [selectedBecaId]
  );

  // Elegir una beca completa el paso 1: tras una pausa breve se avanza solo a
  // "Confirmación" vía la API imperativa del wizard. goToStep no corre
  // onValidateBeforeNext, pero la selección recién hecha ya deja el paso válido.
  const wizardRef = useRef(null);
  const autoAdvanceTimerRef = useRef(null);
  const { handleSelectBeca } = becasDescuentosData;
  const handleSelectBecaAndAdvance = useCallback(
    (beca) => {
      handleSelectBeca(beca);
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = setTimeout(() => {
        wizardRef.current?.goToStep(1);
      }, AUTO_ADVANCE_DELAY_MS);
    },
    [handleSelectBeca]
  );

  useEffect(() => () => clearTimeout(autoAdvanceTimerRef.current), []);

  // Pasos del wizard: config vacío por sección, todo el contenido es custom
  // vía renderSectionContent (patrón UsuarioCreatePage).
  const wizardSteps = useMemo(
    () => [
      {
        title: 'Beca o descuento',
        formTitle: 'Seleccione la beca o el descuento',
        description: 'Elija la beca o el descuento que se asignará al estudiante.',
        sections: ['seleccion'],
        config: { seleccion: {} },
      },
      {
        title: 'Confirmación',
        formTitle: 'Confirme la asignación',
        description: 'Verifique los datos del estudiante y registre el motivo de la solicitud.',
        sections: ['confirmacion'],
        config: { confirmacion: {} },
      },
    ],
    []
  );

  // Compuerta de avance (botón Siguiente y click de pestaña en modo estricto):
  // no avanzar del paso 1 sin una beca seleccionada. Mismo patrón custom que
  // useMatriculaWizardPageWizardValidation (selección vive en el contexto, no en el form).
  const onValidateBeforeNext = useCallback(
    (stepNumber) => {
      return new Promise((resolve, reject) => {
        if (stepNumber === 1 && !becasDescuentosData.selectedBecaDescuento) {
          message.error('Seleccione una beca o descuento antes de continuar.');
          reject(new Error('Beca o descuento no seleccionado'));
          return;
        }
        resolve();
      });
    },
    [becasDescuentosData.selectedBecaDescuento, message]
  );

  // Al fallar la validación del paso, desplazar la vista al primer campo con error.
  const onValidationError = useCallback(
    (err) => {
      const firstErrorField = err?.errorFields?.[0]?.name;
      if (firstErrorField) {
        form.scrollToField(firstErrorField, { behavior: 'smooth', block: 'center' });
      }
    },
    [form]
  );

  // Finalizar: validar el paso visible (Confirmación, incluye el motivo requerido)
  // y delegar en handleFinish del contexto (que ya inyecta la beca seleccionada).
  // El botón Finalizar del wizard pasa el número de paso, no los valores del form.
  const handleWizardFinish = useCallback(async () => {
    try {
      await form.validateFields();
    } catch (err) {
      onValidationError(err);
      return;
    }
    await handleFinish(form.getFieldsValue(true));
  }, [form, handleFinish, onValidationError]);

  // Contenido custom por sección (la página construye cada panel del wizard)
  const renderSectionContent = useCallback(
    (_stepIndex, sectionKey, _section, formInstance) => {
      if (sectionKey === 'seleccion') {
        return (
          <BecaSelectionSection
            becasDescuentosData={becasDescuentosData}
            onSelectBeca={handleSelectBecaAndAdvance}
            renderBecaCard={renderBecaCard}
          />
        );
      }
      if (sectionKey === 'confirmacion') {
        return (
          <FormWorkspaceSection
            title="Resumen de la asignación"
            description="Revise los datos del estudiante y de la beca, y registre el motivo de la solicitud."
            form={formInstance}
          >
            <AsignacionBecaResumen
              student={student}
              beca={becasDescuentosData.selectedBecaDescuento}
              isEditMode={isEditMode}
            />
          </FormWorkspaceSection>
        );
      }
      return null;
    },
    [becasDescuentosData, handleSelectBecaAndAdvance, renderBecaCard, student, isEditMode]
  );

  // Si no hay studentId, mostrar error con el mismo shell de página
  if (!studentId) {
    return (
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader
            title={pageTitle}
            breadcrumbItems={breadcrumbItems}
            actions={backAction}
          />
        </PageHeaderArea>
        <DashboardPageShell>
          <MainContent>
            <Alert
              type="error"
              showIcon
              title="Estudiante no especificado"
              description="No se proporcionó el identificador del estudiante. Seleccione un estudiante desde la lista para asignarle una beca."
              action={
                <Button size="small" variant="default" onClick={handleVolver}>
                  Ir a la lista de estudiantes
                </Button>
              }
            />
          </MainContent>
        </DashboardPageShell>
      </Flex>
    );
  }

  return (
    <PermisoGuard
      codigo="matricula.beca.asignar"
      accion={isEditMode ? 'EDITAR' : 'CREAR'}
      fallback={
        <Typography.Text type="danger">No tiene permiso para asignar becas.</Typography.Text>
      }
    >
      <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
        <PageHeaderArea>
          <PageHeader
            title={pageTitle}
            breadcrumbItems={breadcrumbItems}
            actions={backAction}
          />
        </PageHeaderArea>

        <DashboardPageShell>
          <MainContent>
            <Spin spinning={loadingStudent} tip="Cargando datos del estudiante…">
              <WizardForm
                ref={wizardRef}
                variant="tabs"
                steps={wizardSteps}
                form={form}
                loading={loadingAsignar}
                viewMode={false}
                resolveOptions={() => []}
                initialStep={isEditMode ? 1 : 0}
                onFinish={handleWizardFinish}
                showSaveButton={false}
                renderSectionContent={renderSectionContent}
                onValidateBeforeNext={onValidateBeforeNext}
                onValidationError={onValidationError}
                strictForwardNavigation
                errorMessage={typeof submitError === 'string' ? submitError : ''}
                finishLabel={isEditMode ? 'Guardar cambios' : 'Asignar beca'}
                nextLabel="Siguiente"
                prevLabel="Anterior"
              />
            </Spin>
          </MainContent>
        </DashboardPageShell>
      </Flex>
    </PermisoGuard>
  );
};

export default EstudiantesAsignarBeca;
