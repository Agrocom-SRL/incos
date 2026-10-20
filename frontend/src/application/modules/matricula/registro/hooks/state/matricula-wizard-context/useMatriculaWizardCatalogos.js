/**
 * Catálogos del wizard: estudiante, carrera, contexto de matrícula, selección
 * de materias, periodos (derivados del contexto) y paralelos.
 *
 * Cadena de datos (§4-C1 del plan): el contexto de matrícula entrega periodos
 * con asignaturas (sigla, horas, prerrequisito, estadoHistorial) y de ahí salen
 * la planilla, la selección implícita de periodos y las materias del historial
 * previo. GET /paralelos queda SOLO para el paso Paralelo.
 */

import { useMemo } from 'react';
import { useInscripcionNuevaPageData } from '../../features/useInscripcionNuevaPageData';
import { useInscripcionNuevaStudentSearch } from '../../features/useInscripcionNuevaStudentSearch';
import { useInscripcionNuevaCarreras } from '../../features/useInscripcionNuevaCarreras';
import { useInscripcionNuevaPeriodos } from '../../features/useInscripcionNuevaPeriodos';
import { useInscripcionNuevaParalelos } from '../../features/useInscripcionNuevaParalelos';
import { useInscripcionNuevaHistorialPrevio } from '../../features/useInscripcionNuevaHistorialPrevio';
import { useMatriculaWizardContexto } from './useMatriculaWizardContexto';
import { useMatriculaWizardMateriasSelection } from './useMatriculaWizardMateriasSelection';
import {
  buildMateriasPlanillaModel,
  PLANILLA_ROW_ESTADOS,
} from '@application-matricula/registro/utils/materiasPlanillaRules';

export const useMatriculaWizardCatalogos = (mode, { studentId, editData }) => {
  const studentSearch = useInscripcionNuevaStudentSearch({
    studentId: studentId || editData?.studentId,
  });

  const pageData = useInscripcionNuevaPageData({ mode });

  // Estudiante preseleccionado desde el connector (detalle del estudiante o edición):
  // el paso Buscar se reduce a título + franja (step0EnrichmentStrategy).
  const hasPreselectedStudent = Boolean(studentId || editData?.studentId);

  const initialCarreraId = useMemo(() => {
    if (editData?.carreraId) return editData.carreraId;
    const student = studentSearch?.selectedStudent;
    if (!student) return null;
    const tipo = String(student.tipoAdmision ?? '').toUpperCase();
    if (tipo !== 'TRASPASO' && tipo !== 'TRANSITABILIDAD') return null;
    return student.careerId ?? student.carreraId ?? student.career_id ?? student.carrera_id ?? null;
  }, [editData?.carreraId, studentSearch?.selectedStudent]);

  const carrerasData = useInscripcionNuevaCarreras({ initialCarreraId });

  // Contexto de matrícula (gestión, planes, plan resuelto, periodos con
  // asignaturas y flags esNuevoSistema/tieneHistorialSistema). Se dispara al
  // elegir carrera o al montar con carrera fija.
  const matriculaContexto = useMatriculaWizardContexto({
    selectedStudent: studentSearch?.selectedStudent ?? null,
    selectedCarreraId: carrerasData.selectedCarrera?.id ?? null,
    editData,
  });
  const contexto = matriculaContexto.contexto ?? null;

  // El contexto es la fuente autoritativa del perfil; el estudiante de la
  // búsqueda y editData son fallback mientras el contexto carga.
  const tipoAdmision =
    contexto?.estudiante?.tipoAdmision ??
    editData?.tipoAdmision ??
    studentSearch?.selectedStudent?.tipoAdmision ??
    null;

  const anioCursadoTraspaso =
    String(tipoAdmision ?? '').toUpperCase() === 'TRASPASO'
      ? (contexto?.estudiante?.traspasoAnioCursado ??
        editData?.traspasoAnioCursado ??
        studentSearch?.selectedStudent?.traspasoAnioCursado ??
        null)
      : null;

  // Selección de materias por periodo (planilla): siembra por editData o por
  // las reglas del contexto (NUEVO bloque completo, pendientes a nivelar).
  const materiasSelection = useMatriculaWizardMateriasSelection({
    editData,
    contexto,
    tipoAdmision,
    esNuevoSistema: matriculaContexto.esNuevoSistema,
    traspasoAnioCursado: anioCursadoTraspaso,
  });

  const carreraIdForParalelos = useMemo(() => {
    if (editData?.carreraId) return editData.carreraId;
    const studentCareerId =
      studentSearch.selectedStudent?.careerId ||
      studentSearch.selectedStudent?.carreraId ||
      studentSearch.selectedStudent?.career_id ||
      studentSearch.selectedStudent?.carrera_id;
    if (studentCareerId) return studentCareerId;
    return carrerasData.selectedCarrera?.id;
  }, [editData, studentSearch, carrerasData]);

  const periodosData = useInscripcionNuevaPeriodos({
    contexto,
    loading: matriculaContexto.contextoLoading,
    error: matriculaContexto.contextoError,
    tipoAdmision,
    anioCursadoTraspaso,
    selectedMateriaIdsByPeriod: materiasSelection.selectedMateriaIdsByPeriod,
  });

  const periodoIdsForParalelos = useMemo(() => {
    if (periodosData.selectedPeriodIds?.length) return periodosData.selectedPeriodIds;
    if (Array.isArray(editData?.selectedPeriodIds) && editData.selectedPeriodIds.length > 0) {
      return editData.selectedPeriodIds;
    }
    if (editData?.periodoId != null) return [editData.periodoId];
    return undefined;
  }, [periodosData, editData]);

  const paralelosData = useInscripcionNuevaParalelos({
    carreraId: carreraIdForParalelos,
    periodoIds: periodoIdsForParalelos,
    periodoId: periodosData.selectedPeriod?.id ?? editData?.periodoId,
    initialParaleloId: editData?.paraleloId,
    initialParallelIdsByPeriod: editData?.parallelIdsByPeriod ?? undefined,
  });

  // Modelo de la planilla (mismas reglas que el paso «Periodo y materias»):
  // aquí solo se usa para saber qué asignaturas pueden pedir historial.
  const planillaModel = useMemo(
    () =>
      buildMateriasPlanillaModel({
        contexto,
        seleccion: materiasSelection.selectedMateriaIdsByPeriod,
        tipoAdmision,
        esNuevoSistema: matriculaContexto.esNuevoSistema,
        traspasoAnioCursado: anioCursadoTraspaso,
      }),
    [
      contexto,
      materiasSelection.selectedMateriaIdsByPeriod,
      tipoAdmision,
      matriculaContexto.esNuevoSistema,
      anioCursadoTraspaso,
    ],
  );

  // Materias por periodo candidatas a historial (mismo shape { id, sigla, nombre }
  // que consumía el historial previo cuando llamaba a GET /materias). Quedan fuera:
  // - las ya aprobadas/convalidadas en el kardex (no se vuelven a registrar);
  // - las bloqueadas por prerrequisito, cuyo requisito el estudiante cursa en esta
  //   misma gestión: no puede haberlas vencido antes, así que no se les pide nota.
  const materiasByPeriod = useMemo(() => {
    const byPeriod = {};
    if (planillaModel) {
      planillaModel.periodos.forEach((periodo) => {
        byPeriod[Number(periodo.id)] = periodo.rows
          .filter(
            (row) =>
              row.materiaId != null &&
              row.estado !== PLANILLA_ROW_ESTADOS.APROBADA &&
              row.estado !== PLANILLA_ROW_ESTADOS.BLOQUEADA_PRERREQUISITO,
          )
          .map((row) => ({ id: Number(row.materiaId), sigla: row.sigla, nombre: row.nombre }));
      });
      return byPeriod;
    }
    (contexto?.periodos ?? []).forEach((periodo) => {
      byPeriod[Number(periodo.id)] = (periodo.asignaturas ?? [])
        .filter((a) => a?.materiaId != null)
        .map((a) => ({ id: Number(a.materiaId), sigla: a.sigla ?? null, nombre: a.nombre ?? null }));
    });
    return byPeriod;
  }, [planillaModel, contexto?.periodos]);

  const historialPrevioData = useInscripcionNuevaHistorialPrevio({
    tipoAdmision,
    esNuevoSistema: matriculaContexto.esNuevoSistema,
    periodos: periodosData.periodos ?? [],
    selectedPeriodIds: periodosData.selectedPeriodIds ?? [],
    periodosDisabledByTraspaso: periodosData.periodosDisabledByTraspaso ?? null,
    selectedMateriaIdsByPeriod: materiasSelection.selectedMateriaIdsByPeriod,
    materiasByPeriod,
    materiasLoading: matriculaContexto.contextoLoading ?? false,
    contexto,
    initialPriorHistories: editData?.priorEnrollmentHistories ?? null,
    isEditMode: Boolean(editData?.inscripcionId),
  });

  return {
    pageData,
    tipoAdmision,
    anioCursadoTraspaso,
    hasPreselectedStudent,
    studentSearch,
    carrerasData,
    carreraIdForParalelos,
    periodosData,
    paralelosData,
    materiasSelection,
    historialPrevioData,
    matriculaContexto,
  };
};
