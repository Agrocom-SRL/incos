/**
 * Contexto de matrícula del wizard (GET /v1/inscripciones/contexto-matricula).
 *
 * Se dispara al seleccionar carrera (o al montar con carrera fija) y guarda en
 * el estado del wizard: contexto completo (gestión, carrera, planes, plan,
 * periodos con asignaturas, resumenHistorial), el plan elegido por el usuario
 * y los flags esNuevoSistema / tieneHistorialSistema que gobiernan los pasos
 * dinámicos. La Fase C consume `contexto.periodos` y `planEstudioId` para el
 * paso «Periodo y materias» y el payload de POST /inscripciones.
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useGetMatriculaContexto } from '../../api/useGetMatriculaContexto';

/**
 * @param {Object} options
 * @param {Object|null} options.selectedStudent - Estudiante seleccionado en el paso Buscar
 * @param {number|null} options.selectedCarreraId - Carrera elegida en el paso Carrera (estudiante sin carrera fija)
 * @param {Object|null} options.editData - Datos de edición (studentId, carreraId) si aplica
 */
export const useMatriculaWizardContexto = ({
  selectedStudent = null,
  selectedCarreraId = null,
  editData = null,
} = {}) => {
  const { contexto, loading, error, getMatriculaContexto } = useGetMatriculaContexto();

  // Plan elegido por el usuario (null = usar el que resuelva el backend).
  const [planSeleccionadoId, setPlanSeleccionadoId] = useState(null);

  const estudianteId = selectedStudent?.id ?? editData?.studentId ?? null;
  const carreraFijaId =
    selectedStudent?.carreraId ?? selectedStudent?.careerId ?? editData?.carreraId ?? null;
  const carreraId = carreraFijaId ?? selectedCarreraId ?? null;

  // Cambio de estudiante o de carrera → el plan elegido deja de tener sentido.
  // Ajuste de estado durante render con comparación de prev (mismo patrón que
  // useWizard), en lugar de setState dentro de un effect (evita render en cascada).
  const resetKey = `${estudianteId ?? ''}|${carreraId ?? ''}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (prevResetKey !== resetKey) {
    setPrevResetKey(resetKey);
    if (planSeleccionadoId != null) setPlanSeleccionadoId(null);
  }

  // Edición: la inscripción que se edita se excluye del perfil del estudiante
  // (esNuevoSistema / yaMatriculadoGestionActual) — sin esto, editar la única
  // inscripción lo volvía "con historial digital" y desaparecían los pasos
  // Carrera e Historial de notas.
  const excluirInscripcionId = editData?.inscripcionId ?? null;

  // Disparo del contexto: al montar con carrera fija, al elegir carrera y al
  // cambiar de plan (el backend revalida plan contra carrera + gestion_plan).
  useEffect(() => {
    if (!estudianteId || !carreraId) return;
    getMatriculaContexto({
      estudianteId,
      carreraId,
      planEstudioId: planSeleccionadoId ?? undefined,
      excluirInscripcionId: excluirInscripcionId ?? undefined,
    });
  }, [estudianteId, carreraId, planSeleccionadoId, excluirInscripcionId, getMatriculaContexto]);

  const onSelectPlan = useCallback((planId) => {
    setPlanSeleccionadoId(planId != null ? Number(planId) : null);
  }, []);

  // Reintento manual (estado de error de la planilla): repite la última petición.
  const refetchContexto = useCallback(() => {
    if (!estudianteId || !carreraId) return;
    getMatriculaContexto({
      estudianteId,
      carreraId,
      planEstudioId: planSeleccionadoId ?? undefined,
      excluirInscripcionId: excluirInscripcionId ?? undefined,
    });
  }, [estudianteId, carreraId, planSeleccionadoId, excluirInscripcionId, getMatriculaContexto]);

  // Flags derivados (§2 del plan). null = dato aún no disponible → los
  // consumidores degradan al comportamiento histórico.
  const esNuevoSistema = useMemo(() => {
    if (contexto?.estudiante?.esNuevoSistema != null) {
      return !!contexto.estudiante.esNuevoSistema;
    }
    if (selectedStudent?.esNuevoSistema != null) {
      return !!selectedStudent.esNuevoSistema;
    }
    if (selectedStudent?.totalInscripciones != null) {
      return Number(selectedStudent.totalInscripciones) === 0;
    }
    return null;
  }, [contexto?.estudiante?.esNuevoSistema, selectedStudent?.esNuevoSistema, selectedStudent?.totalInscripciones]);

  const tieneHistorialSistema = esNuevoSistema === false;

  // Elección de plan (solo dentro del paso «Carrera y plan», que existe
  // únicamente para estudiantes nuevos en el sistema):
  // - tipo de admisión NUEVO → NO elige: se inscribe con el plan VIGENTE de la
  //   carrera (el backend lo resuelve al no pedir plan_estudio_id).
  // - otros tipos (ANTIGUO / TRASPASO / TRANSITABILIDAD) nuevos en el sistema →
  //   eligen el plan de la carrera que seleccionen, si hay más de uno habilitado.
  const tipoAdmision =
    contexto?.estudiante?.tipoAdmision ?? selectedStudent?.tipoAdmision ?? null;
  const esAdmisionNueva = String(tipoAdmision ?? '').toUpperCase() === 'NUEVO';

  const planes = useMemo(() => contexto?.planes ?? [], [contexto?.planes]);
  const mostrarSelectorPlan =
    esNuevoSistema !== false && !esAdmisionNueva && planes.length > 1;

  // Por qué no se pregunta el plan (lo traduce a texto el organismo del paso).
  const planFijoMotivo = mostrarSelectorPlan
    ? null
    : esAdmisionNueva
      ? 'ADMISION_NUEVA'
      : 'PLAN_UNICO';

  // Plan efectivo para la Fase C (payload plan_estudio_id): elección del
  // usuario o plan resuelto por el backend.
  const planEstudioId = planSeleccionadoId ?? contexto?.plan?.id ?? null;

  return useMemo(
    () => ({
      contexto,
      contextoLoading: loading,
      contextoError: error,
      refetchContexto,
      planes,
      planSeleccionadoId,
      planEstudioId,
      mostrarSelectorPlan,
      planFijoMotivo,
      onSelectPlan,
      esNuevoSistema,
      tieneHistorialSistema,
    }),
    [
      contexto,
      loading,
      error,
      refetchContexto,
      planes,
      planSeleccionadoId,
      planEstudioId,
      mostrarSelectorPlan,
      planFijoMotivo,
      onSelectPlan,
      esNuevoSistema,
      tieneHistorialSistema,
    ],
  );
};
