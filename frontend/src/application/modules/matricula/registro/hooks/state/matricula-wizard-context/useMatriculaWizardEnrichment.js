/**
 * Callbacks del wizard y enriquecimiento de pasos.
 *
 * Tras el rediseño (§4-C1) solo quedan enrichers para el paso Buscar
 * (studentEnrichers) y el paso Paralelo (paraleloEnrichers): los pasos
 * «Carrera y plan» y «Periodo y materias» los construye renderSectionContent
 * con organismos propios (CarreraCardPicker, MateriasPlanillaSelector).
 */

import { useMemo, useCallback } from 'react';
import { useEnrichWizardSteps } from '@application-utils/hooks';
import { createInscripcionNuevaWizardSteps } from '@matricula/registro/config';
import { resolveMatriculaWizardStepMeta } from '@application-matricula/registro/utils/matriculaWizardStepConfig';
import { matriculaWizardEnrichers } from '../../features/enrichers/wizardEnrichers';
import { step0EnrichmentStrategy } from './step0EnrichmentStrategy';

export const useMatriculaWizardEnrichment = ({
  tipoAdmision = null,
  // true/false desde vista 153 ampliada o contexto-matricula; null = sin dato
  // → los pasos dinámicos preservan el comportamiento histórico.
  esNuevoSistema = null,
  hasPreselectedStudent = false,
  studentSearch,
  carrerasData,
  periodosData,
  paralelosData,
  carreraIdForParalelos,
}) => {
  const handleSearchStudent = useCallback(
    (value) => {
      // Pasar también el término vacío: el hook de búsqueda lo usa para volver
      // a las sugerencias iniciales («Estudiantes nuevos sin matrícula»).
      studentSearch.searchStudent?.(value ?? '');
    },
    [studentSearch],
  );

  const handleSelectStudent = useCallback(
    (student) => {
      if (student && studentSearch.onSelectStudent) {
        studentSearch.onSelectStudent(student);
      }
    },
    [studentSearch],
  );

  const handleSelectCarrera = useCallback(
    (value) => {
      const carrera = carrerasData.carreras?.find((c) => c.id === value);
      if (carrera && carrerasData.onSelectCarrera) {
        carrerasData.onSelectCarrera(carrera);
      }
    },
    [carrerasData],
  );

  const handleSelectParalelo = useCallback(
    (paralelo) => {
      if (paralelo && paralelosData.onSelectParalelo) {
        paralelosData.onSelectParalelo(paralelo);
      }
    },
    [paralelosData],
  );

  const enrichContext = useMemo(
    () => ({
      onSearchStudent: handleSearchStudent,
      onSelectStudent: handleSelectStudent,
      onSelectCarrera: handleSelectCarrera,
      onSelectParalelo: handleSelectParalelo,
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
      hasPreselectedStudent,
      studentSearch: {
        students: studentSearch.students,
        loading: studentSearch.loading,
        error: studentSearch.error,
        selectedStudent: studentSearch.selectedStudent,
        isShowingSuggestions: studentSearch.isShowingSuggestions,
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
    }),
    [
      handleSearchStudent,
      handleSelectStudent,
      handleSelectCarrera,
      handleSelectParalelo,
      hasPreselectedStudent,
      carreraIdForParalelos,
      periodosData,
      studentSearch,
      carrerasData,
      paralelosData,
    ],
  );

  // Meta de pasos dinámicos (§2 del plan): con historial digital se excluyen
  // «Carrera y plan» e «Historial de notas»; los índices salen del orden del array.
  const wizardStepMeta = useMemo(
    () => resolveMatriculaWizardStepMeta(tipoAdmision, { esNuevoSistema }),
    [tipoAdmision, esNuevoSistema],
  );

  const wizardStepsBase = useMemo(
    () => createInscripcionNuevaWizardSteps(wizardStepMeta),
    [wizardStepMeta],
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
