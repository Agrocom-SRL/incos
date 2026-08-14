import { useMemo } from 'react';
import { useMatriculaWizardFormHandlers } from '../../features/matricula-wizard-form';
import { useMatriculaWizardCatalogos } from './useMatriculaWizardCatalogos';
import { useMatriculaWizardEnrichment } from './useMatriculaWizardEnrichment';

/**
 * Valor del contexto del wizard de matrícula (crear / editar).
 * Usado por InscripcionesNuevaProvider.
 */
export const useMatriculaWizardContext = (mode = 'nuevo', options = {}) => {
  const { studentId = null, editData = null } = options;

  const catalogos = useMatriculaWizardCatalogos(mode, { studentId, editData });
  const { materiasSelection } = catalogos;

  const formHandlers = useMatriculaWizardFormHandlers(mode, {
    selectedStudent: catalogos.studentSearch.selectedStudent,
    selectedParalelo: catalogos.paralelosData.selectedParalelo,
    selectedPeriod: catalogos.periodosData.selectedPeriod,
    selectedPeriodIds: catalogos.periodosData?.selectedPeriodIds ?? [],
    selectedParalelosByPeriod: catalogos.paralelosData.selectedParalelosByPeriod ?? {},
    selectedMateriaIdsByPeriod: materiasSelection.selectedMateriaIdsByPeriod,
    // Plan efectivo del contexto (elección del selector o plan resuelto):
    // viaja como plan_estudio_id en el payload (§3 dataKey == dataFieldName).
    planEstudioId: catalogos.matriculaContexto?.planEstudioId ?? null,
    inscripcionId: editData?.inscripcionId ?? null,
    buildPriorHistory: catalogos.historialPrevioData.buildPayload,
    validatePriorHistory: catalogos.historialPrevioData.validate,
    historialPrevioHasRows: catalogos.historialPrevioData.hasRows,
    completarSoloHistorialPrevio: Boolean(editData?.completarSoloHistorialPrevio),
  });

  const enrichment = useMatriculaWizardEnrichment({
    tipoAdmision: catalogos.tipoAdmision,
    esNuevoSistema: catalogos.matriculaContexto?.esNuevoSistema ?? null,
    hasPreselectedStudent: catalogos.hasPreselectedStudent,
    studentSearch: catalogos.studentSearch,
    carrerasData: catalogos.carrerasData,
    periodosData: catalogos.periodosData,
    paralelosData: catalogos.paralelosData,
    carreraIdForParalelos: catalogos.carreraIdForParalelos,
  });

  return useMemo(
    () => ({
      ...catalogos.pageData,
      wizardSteps: enrichment.enrichedWizardSteps,
      wizardStepMeta: enrichment.wizardStepMeta,
      ...formHandlers,
      onSelectCarrera: enrichment.handleSelectCarrera,
      tipoAdmision: catalogos.tipoAdmision,
      anioCursadoTraspaso: catalogos.anioCursadoTraspaso,
      periodosData: {
        periodos: catalogos.periodosData.periodos,
        loading: catalogos.periodosData.loading,
        error: catalogos.periodosData.error,
        selectedPeriod: catalogos.periodosData.selectedPeriod,
        selectedPeriodIds: catalogos.periodosData.selectedPeriodIds || [],
      },
      studentSearch: {
        students: catalogos.studentSearch.students,
        loading: catalogos.studentSearch.loading,
        error: catalogos.studentSearch.error,
        selectedStudent: catalogos.studentSearch.selectedStudent,
      },
      carrerasData: {
        carreras: catalogos.carrerasData.carreras,
        loading: catalogos.carrerasData.loading,
        error: catalogos.carrerasData.error,
        selectedCarrera: catalogos.carrerasData.selectedCarrera,
      },
      paralelosData: {
        paralelos: catalogos.paralelosData.paralelos,
        loading: catalogos.paralelosData.loading,
        error: catalogos.paralelosData.error,
        selectedParalelo: catalogos.paralelosData.selectedParalelo,
        selectedParalelosByPeriod: catalogos.paralelosData.selectedParalelosByPeriod ?? {},
      },
      onSelectParalelo: enrichment.handleSelectParalelo,
      selectedMateriaIdsByPeriod: materiasSelection.selectedMateriaIdsByPeriod,
      onToggleMaterias: materiasSelection.handleToggleMaterias,
      historialPrevioData: catalogos.historialPrevioData,
      // Contexto de matrícula (gestión, planes, plan, periodos, flags de perfil):
      // consumido por la franja del estudiante, el paso «Carrera y plan» y la
      // planilla del paso «Periodo y materias».
      matriculaContexto: catalogos.matriculaContexto,
      hasPreselectedStudent: catalogos.hasPreselectedStudent,
      editData,
    }),
    [catalogos, enrichment, formHandlers, materiasSelection, editData],
  );
};
