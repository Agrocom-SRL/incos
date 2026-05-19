import { useMemo } from 'react';
import { useMatriculaWizardFormHandlers } from '../../features/matricula-wizard-form';
import { useMatriculaWizardCatalogos } from './useMatriculaWizardCatalogos';
import { useMatriculaWizardMateriasSelection } from './useMatriculaWizardMateriasSelection';
import { useMatriculaWizardEnrichment } from './useMatriculaWizardEnrichment';

/**
 * Valor del contexto del wizard de matrícula (crear / editar).
 * Usado por InscripcionesNuevaProvider.
 */
export const useMatriculaWizardContext = (mode = 'nuevo', options = {}) => {
  const { studentId = null, editData = null } = options;

  const catalogos = useMatriculaWizardCatalogos(mode, { studentId, editData });
  const materiasSelection = useMatriculaWizardMateriasSelection(editData);

  const formHandlers = useMatriculaWizardFormHandlers(mode, {
    selectedStudent: catalogos.studentSearch.selectedStudent,
    selectedParalelo: catalogos.paralelosData.selectedParalelo,
    selectedPeriod: catalogos.periodosData.selectedPeriod,
    selectedPeriodIds: catalogos.periodosData?.selectedPeriodIds ?? [],
    selectedParalelosByPeriod: catalogos.paralelosData.selectedParalelosByPeriod ?? {},
    selectedMateriaIdsByPeriod: materiasSelection.selectedMateriaIdsByPeriod,
    inscripcionId: editData?.inscripcionId ?? null,
    buildPriorHistory: catalogos.historialPrevioData.buildPayload,
    validatePriorHistory: catalogos.historialPrevioData.validate,
    historialPrevioHasRows: catalogos.historialPrevioData.hasRows,
    completarSoloHistorialPrevio: Boolean(editData?.completarSoloHistorialPrevio),
  });

  const enrichment = useMatriculaWizardEnrichment({
    wizardSteps: catalogos.pageData.wizardSteps,
    ...catalogos,
    selectedMateriaIdsByPeriod: materiasSelection.selectedMateriaIdsByPeriod,
    handleToggleMaterias: materiasSelection.handleToggleMaterias,
  });

  return useMemo(
    () => ({
      ...catalogos.pageData,
      wizardSteps: enrichment.enrichedWizardSteps,
      ...formHandlers,
      onSelectCarrera: enrichment.handleSelectCarrera,
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
      materiasData: {
        materias: catalogos.materiasData.materias,
        loading: catalogos.materiasData.loading,
        error: catalogos.materiasData.error,
        selectedMateria: catalogos.materiasData.selectedMateria,
      },
      materiasByPeriodsData: {
        materiasByPeriod: catalogos.materiasByPeriodsData.materiasByPeriod,
        loading: catalogos.materiasByPeriodsData.loading,
        error: catalogos.materiasByPeriodsData.error,
      },
      selectedMateriaIdsByPeriod: materiasSelection.selectedMateriaIdsByPeriod,
      onToggleMaterias: materiasSelection.handleToggleMaterias,
      historialPrevioData: catalogos.historialPrevioData,
      editData,
    }),
    [catalogos, enrichment, formHandlers, materiasSelection, editData],
  );
};
