/**
 * Catálogos del wizard: estudiante, carrera, periodos, paralelos y materias.
 */

import { useMemo } from 'react';
import { useInscripcionNuevaPageData } from '../../features/useInscripcionNuevaPageData';
import { useInscripcionNuevaStudentSearch } from '../../features/useInscripcionNuevaStudentSearch';
import { useInscripcionNuevaCarreras } from '../../features/useInscripcionNuevaCarreras';
import { useInscripcionNuevaPeriodos } from '../../features/useInscripcionNuevaPeriodos';
import { useInscripcionNuevaParalelos } from '../../features/useInscripcionNuevaParalelos';
import { useInscripcionNuevaMaterias } from '../../features/useInscripcionNuevaMaterias';
import { useInscripcionNuevaMateriasByPeriods } from '../../features/useInscripcionNuevaMateriasByPeriods';
import { useInscripcionNuevaHistorialPrevio } from '../../features/useInscripcionNuevaHistorialPrevio';
import { computeConcludedPeriods } from '@application-inscripciones/utils/historialPrevioHelpers';

export const useMatriculaWizardCatalogos = (mode, { studentId, editData }) => {
  const studentSearch = useInscripcionNuevaStudentSearch({
    studentId: studentId || editData?.studentId,
  });

  const tipoAdmision =
    editData?.tipoAdmision ?? studentSearch?.selectedStudent?.tipoAdmision ?? null;

  const pageData = useInscripcionNuevaPageData({ mode, tipoAdmision });

  const initialCarreraId = useMemo(() => {
    if (editData?.carreraId) return editData.carreraId;
    const student = studentSearch?.selectedStudent;
    if (!student) return null;
    const tipo = String(student.tipoAdmision ?? '').toUpperCase();
    if (tipo !== 'TRASPASO' && tipo !== 'TRANSITABILIDAD') return null;
    return student.careerId ?? student.carreraId ?? student.career_id ?? student.carrera_id ?? null;
  }, [editData?.carreraId, studentSearch?.selectedStudent]);

  const carrerasData = useInscripcionNuevaCarreras({ initialCarreraId });

  const carreraIdForParalelos = useMemo(() => {
    if (editData?.carreraId) return editData.carreraId;
    const studentCareerId =
      studentSearch.selectedStudent?.careerId ||
      studentSearch.selectedStudent?.carreraId ||
      studentSearch.selectedStudent?.career_id ||
      studentSearch.selectedStudent?.carrera_id;
    if (studentCareerId) return studentCareerId;
    return carrerasData.selectedCarrera?.id;
  }, [editData?.carreraId, studentSearch.selectedStudent, carrerasData.selectedCarrera]);

  const anioCursadoTraspaso =
    tipoAdmision === 'TRASPASO'
      ? (editData?.traspasoAnioCursado ?? studentSearch?.selectedStudent?.traspasoAnioCursado ?? null)
      : null;

  const periodosData = useInscripcionNuevaPeriodos({
    carreraId: carreraIdForParalelos ?? undefined,
    tipoAdmision: tipoAdmision ?? undefined,
    anioCursadoTraspaso: anioCursadoTraspaso ?? undefined,
    initialPeriodId: editData?.periodoId ?? undefined,
    initialSelectedPeriodIds: editData?.selectedPeriodIds ?? undefined,
  });

  const periodoIdsForParalelos = useMemo(() => {
    if (periodosData.selectedPeriodIds?.length) return periodosData.selectedPeriodIds;
    if (Array.isArray(editData?.selectedPeriodIds) && editData.selectedPeriodIds.length > 0) {
      return editData.selectedPeriodIds;
    }
    if (editData?.periodoId != null) return [editData.periodoId];
    return undefined;
  }, [periodosData.selectedPeriodIds, editData?.periodoId, editData?.selectedPeriodIds]);

  const paralelosData = useInscripcionNuevaParalelos({
    carreraId: carreraIdForParalelos,
    periodoIds: periodoIdsForParalelos,
    periodoId: periodosData.selectedPeriod?.id ?? editData?.periodoId,
    initialParaleloId: editData?.paraleloId,
    initialParallelIdsByPeriod: editData?.parallelIdsByPeriod ?? undefined,
  });

  const materiasData = useInscripcionNuevaMaterias({
    periodoId: periodosData.selectedPeriod?.id,
  });

  const concludedPeriodsForLoad = useMemo(
    () =>
      computeConcludedPeriods({
        tipoAdmision,
        periodos: periodosData.periodos ?? [],
        selectedPeriodIds: periodosData.selectedPeriodIds ?? [],
        periodosDisabledByTraspaso: periodosData.periodosDisabledByTraspaso ?? null,
      }),
    [
      tipoAdmision,
      periodosData.periodos,
      periodosData.selectedPeriodIds,
      periodosData.periodosDisabledByTraspaso,
    ],
  );

  const periodIdsForMateriasLoad = useMemo(() => {
    const ids = new Set([
      ...(periodosData.selectedPeriodIds ?? []).map(Number),
      ...concludedPeriodsForLoad.map((p) => Number(p.periodId)),
    ]);
    return [...ids].filter((id) => !Number.isNaN(id) && id > 0);
  }, [periodosData.selectedPeriodIds, concludedPeriodsForLoad]);

  const materiasByPeriodsData = useInscripcionNuevaMateriasByPeriods(
    periodIdsForMateriasLoad,
    carreraIdForParalelos ?? null,
  );

  const historialPrevioData = useInscripcionNuevaHistorialPrevio({
    tipoAdmision,
    periodos: periodosData.periodos ?? [],
    selectedPeriodIds: periodosData.selectedPeriodIds ?? [],
    periodosDisabledByTraspaso: periodosData.periodosDisabledByTraspaso ?? null,
    materiasByPeriod: materiasByPeriodsData.materiasByPeriod ?? {},
    materiasLoading: materiasByPeriodsData.loading ?? false,
    initialPriorHistories: editData?.priorEnrollmentHistories ?? null,
    isEditMode: Boolean(editData?.inscripcionId),
  });

  return {
    pageData,
    tipoAdmision,
    studentSearch,
    carrerasData,
    carreraIdForParalelos,
    periodosData,
    paralelosData,
    materiasData,
    materiasByPeriodsData,
    historialPrevioData,
  };
};
