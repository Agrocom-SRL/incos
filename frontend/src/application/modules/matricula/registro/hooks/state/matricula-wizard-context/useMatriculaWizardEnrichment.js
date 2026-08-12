/**
 * Callbacks del wizard y enriquecimiento de pasos.
 */

import { useMemo, useCallback } from 'react';
import { useEnrichWizardSteps } from '@application-utils/hooks';
import { createInscripcionNuevaWizardSteps } from '@matricula/registro/config';
import { requiereHistorialPrevio } from '@application-matricula/registro/utils/historialPrevioHelpers';
import { resolveMatriculaWizardStepMeta } from '@application-matricula/registro/utils/matriculaWizardStepConfig';
import { matriculaWizardEnrichers } from '../../features/enrichers/wizardEnrichers';
import { step0EnrichmentStrategy } from './step0EnrichmentStrategy';

export const useMatriculaWizardEnrichment = ({
  tipoAdmision = null,
  studentSearch,
  carrerasData,
  periodosData,
  paralelosData,
  materiasData,
  materiasByPeriodsData,
  carreraIdForParalelos,
  selectedMateriaIdsByPeriod,
  handleToggleMaterias,
  historialPrevioData,
}) => {
  const handleSearchStudent = useCallback(
    (value) => {
      if (value?.trim() && studentSearch.searchStudent) {
        studentSearch.searchStudent(value.trim());
      }
    },
    [studentSearch.searchStudent],
  );

  const handleSelectStudent = useCallback(
    (student) => {
      if (student && studentSearch.onSelectStudent) {
        studentSearch.onSelectStudent(student);
      }
    },
    [studentSearch.onSelectStudent],
  );

  const handleSelectCarrera = useCallback(
    (value) => {
      const carrera = carrerasData.carreras?.find((c) => c.id === value);
      if (carrera && carrerasData.onSelectCarrera) {
        carrerasData.onSelectCarrera(carrera);
      }
    },
    [carrerasData.carreras, carrerasData.onSelectCarrera],
  );

  const handleSelectPeriod = useCallback(
    (value) => {
      const period = periodosData.periodos?.find((p) => p.id === value || p.id === Number(value));
      if (period && periodosData.onSelectPeriod) {
        periodosData.onSelectPeriod(period);
      }
    },
    [periodosData.periodos, periodosData.onSelectPeriod],
  );

  const handleTogglePeriods = useCallback(
    (checkedIds) => {
      if (periodosData.onTogglePeriods) {
        periodosData.onTogglePeriods(checkedIds);
      }
    },
    [periodosData.onTogglePeriods],
  );

  const handleSelectParalelo = useCallback(
    (paralelo) => {
      if (paralelo && paralelosData.onSelectParalelo) {
        paralelosData.onSelectParalelo(paralelo);
      }
    },
    [paralelosData.onSelectParalelo],
  );

  const handleSelectMateria = useCallback(
    (materia) => {
      if (materia && materiasData.onSelectMateria) {
        materiasData.onSelectMateria(materia);
      }
    },
    [materiasData.onSelectMateria],
  );

  const enrichContext = useMemo(
    () => ({
      onSearchStudent: handleSearchStudent,
      onSelectStudent: handleSelectStudent,
      onSelectPeriod: handleSelectPeriod,
      onTogglePeriods: handleTogglePeriods,
      onSelectCarrera: handleSelectCarrera,
      onSelectParalelo: handleSelectParalelo,
      onSelectMateria: handleSelectMateria,
      carreraIdForParalelos: carreraIdForParalelos ?? null,
      periodosData: {
        periodos: periodosData.periodos,
        loading: periodosData.loading,
        error: periodosData.error,
        selectedPeriod: periodosData.selectedPeriod,
        selectedPeriods: periodosData.selectedPeriods,
        selectedPeriodIds: periodosData.selectedPeriodIds || [],
        periodosDisabledByTraspaso: periodosData.periodosDisabledByTraspaso ?? null,
      },
      studentSearch: {
        students: studentSearch.students,
        loading: studentSearch.loading,
        error: studentSearch.error,
        selectedStudent: studentSearch.selectedStudent,
        selectionBlockedMessage: studentSearch.selectionBlockedMessage,
      },
      carrerasData: {
        carreras: carrerasData.carreras,
        loading: carrerasData.loading,
        error: carrerasData.error,
        selectedCarrera: carrerasData.selectedCarrera,
      },
      paralelosData: {
        paralelos: paralelosData.paralelos,
        loading: paralelosData.loading,
        error: paralelosData.error,
        selectedParalelo: paralelosData.selectedParalelo,
        selectedParalelosByPeriod: paralelosData.selectedParalelosByPeriod ?? {},
      },
      materiasData: {
        materias: materiasData.materias,
        loading: materiasData.loading,
        error: materiasData.error,
        selectedMateria: materiasData.selectedMateria,
      },
      materiasByPeriodsData: {
        materiasByPeriod: materiasByPeriodsData.materiasByPeriod,
        loading: materiasByPeriodsData.loading,
        error: materiasByPeriodsData.error,
      },
      selectedMateriaIdsByPeriod,
      onToggleMaterias: handleToggleMaterias,
      historialPrevioData,
    }),
    [
      handleSearchStudent,
      handleSelectStudent,
      handleSelectPeriod,
      handleTogglePeriods,
      handleSelectCarrera,
      handleSelectParalelo,
      handleSelectMateria,
      carreraIdForParalelos,
      periodosData,
      studentSearch,
      carrerasData,
      paralelosData,
      materiasData,
      materiasByPeriodsData,
      selectedMateriaIdsByPeriod,
      handleToggleMaterias,
      historialPrevioData,
    ],
  );

  const wizardStepsBase = useMemo(
    () => createInscripcionNuevaWizardSteps(requiereHistorialPrevio(tipoAdmision)),
    [tipoAdmision],
  );

  const wizardStepMeta = useMemo(
    () => resolveMatriculaWizardStepMeta(tipoAdmision),
    [tipoAdmision],
  );

  const enrichedWizardSteps = useEnrichWizardSteps(
    wizardStepsBase,
    matriculaWizardEnrichers,
    enrichContext,
    step0EnrichmentStrategy,
  );

  return {
    handleSelectCarrera,
    handleSelectParalelo,
    enrichedWizardSteps,
    wizardStepMeta,
  };
};
