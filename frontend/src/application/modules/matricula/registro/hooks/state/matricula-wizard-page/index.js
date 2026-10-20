import { useMatriculaWizardPageContext } from './useMatriculaWizardPageContext';
import { useMatriculaWizardPageNavigation } from './useMatriculaWizardPageNavigation';
import { useMatriculaWizardPageWizardInit } from './useMatriculaWizardPageWizardInit';
import { useMatriculaWizardPageWizardValidation } from './useMatriculaWizardPageWizardValidation';

/**
 * Orquestación de la pantalla del wizard de matrícula (crear / editar).
 * Debe usarse dentro de InscripcionesNuevaProvider.
 */
export const useMatriculaWizardPage = () => {
  const {
    context,
    editData,
    studentIdFromState,
    isNuevoEstudiante,
    isTraspasoOrTransitabilidad,
  } = useMatriculaWizardPageContext();

  const {
    pageTitle,
    breadcrumbItems,
    wizardSteps,
    form,
    loading = false,
    error = null,
    handleFinish,
    handleSave,
    inscripcionResult,
    paymentRequiredStudentId,
    clearPaymentRequiredDialog,
    materiasStepInvalid,
    setMateriasStepInvalid,
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
    wizardStepMeta,
    matriculaContexto,
    hasPreselectedStudent,
  } = context;

  const navigation = useMatriculaWizardPageNavigation({
    studentIdFromState,
    inscripcionResult,
    paymentRequiredStudentId,
    clearPaymentRequiredDialog,
  });

  const wizardInit = useMatriculaWizardPageWizardInit({
    editData,
    isNuevoEstudiante,
    studentSearch,
    carrerasData,
    form,
    wizardStepMeta,
    hasPreselectedStudent,
  });

  const validation = useMatriculaWizardPageWizardValidation({
    studentSearch,
    editData,
    carrerasData,
    periodosData,
    selectedMateriaIdsByPeriod,
    paralelosData,
    historialPrevioData,
    wizardStepMeta,
  });

  return {
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
    materiasStepInvalid,
    setMateriasStepInvalid,
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
    wizardStepMeta,
    matriculaContexto,
    hasPreselectedStudent,
    ...navigation,
    ...wizardInit,
    ...validation,
  };
};
