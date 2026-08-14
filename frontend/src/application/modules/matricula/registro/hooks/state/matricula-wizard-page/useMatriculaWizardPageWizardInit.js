/**
 * Paso inicial del wizard y valores del formulario en edición.
 *
 * Avance tras elegir estudiante: al seleccionar una fila en el paso «Buscar»
 * el wizard NO salta de inmediato — se espera una pausa breve
 * (STEP_ADVANCE_DELAY_MS) para que el operador vea confirmada su elección
 * (fila resaltada con el check) antes de cambiar de paso. La pausa solo aplica
 * a la selección manual: en edición o con estudiante preseleccionado desde el
 * connector el paso inicial se resuelve al instante.
 */

import { useEffect, useMemo, useState } from 'react';

/** Pausa entre elegir al estudiante y avanzar al paso siguiente (ms). */
const STEP_ADVANCE_DELAY_MS = 1000;

export const useMatriculaWizardPageWizardInit = ({
  editData,
  isNuevoEstudiante,
  studentSearch,
  carrerasData,
  form,
  wizardStepMeta,
  hasPreselectedStudent = false,
}) => {
  // Índices dinámicos: «carrera» e «historial» pueden ser null (paso excluido
  // para estudiantes con historial digital). Nunca usar números mágicos aquí.
  const indices = wizardStepMeta?.indices ?? {
    buscar: 0,
    carrera: 1,
    periodo: 2,
    paralelo: 3,
    historial: null,
  };

  // Selección confirmada (con la pausa aplicada) que habilita el avance de paso.
  const selectedStudentId = studentSearch?.selectedStudent?.id ?? null;
  const avanceInmediato = !!editData || hasPreselectedStudent;
  const [confirmedStudentId, setConfirmedStudentId] = useState(
    avanceInmediato ? selectedStudentId : null,
  );

  // Cambio de estudiante (o deselección): se invalida la confirmación previa
  // durante el render, sin setState dentro de un effect.
  const [prevSelectedId, setPrevSelectedId] = useState(selectedStudentId);
  if (prevSelectedId !== selectedStudentId) {
    setPrevSelectedId(selectedStudentId);
    if (avanceInmediato || selectedStudentId == null) {
      setConfirmedStudentId(selectedStudentId);
    } else if (confirmedStudentId != null) {
      setConfirmedStudentId(null);
    }
  }

  useEffect(() => {
    if (avanceInmediato) return undefined;
    if (selectedStudentId == null || confirmedStudentId === selectedStudentId) return undefined;
    const timer = setTimeout(() => setConfirmedStudentId(selectedStudentId), STEP_ADVANCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [avanceInmediato, selectedStudentId, confirmedStudentId]);

  const initialStep = useMemo(() => {
    if (editData) {
      if (editData.completarSoloHistorialPrevio && indices.historial != null) {
        return indices.historial;
      }
      if (editData.completarSoloHistorialPrevio) {
        return indices.periodo;
      }
      return isNuevoEstudiante ? indices.paralelo : indices.periodo;
    }
    const hasStudent =
      !!studentSearch?.selectedStudent &&
      !studentSearch?.loading &&
      confirmedStudentId === selectedStudentId;
    if (hasStudent && carrerasData?.selectedCarrera) {
      return isNuevoEstudiante ? indices.paralelo : indices.periodo;
    }
    // Sin paso Carrera (estudiante con historial digital) se salta directo a Periodo.
    if (hasStudent) return indices.carrera ?? indices.periodo;
    return indices.buscar;
  }, [
    editData,
    editData?.completarSoloHistorialPrevio,
    isNuevoEstudiante,
    studentSearch?.selectedStudent,
    studentSearch?.loading,
    carrerasData?.selectedCarrera,
    confirmedStudentId,
    selectedStudentId,
    indices,
  ]);

  const initialValues = useMemo(() => {
    if (!editData) return {};
    const values = {};
    if (editData.carreraId && carrerasData?.carreras) {
      const carrera = carrerasData.carreras.find((c) => c.id === Number(editData.carreraId));
      if (carrera) values.carrera = carrera.id;
    }
    return values;
  }, [editData, carrerasData?.carreras]);

  useEffect(() => {
    if (
      editData &&
      form &&
      editData.carreraId &&
      carrerasData?.carreras?.length > 0
    ) {
      const carrera = carrerasData.carreras.find((c) => c.id === Number(editData.carreraId));
      if (carrera) form.setFieldsValue({ carrera: carrera.id });
    }
  }, [editData, form, carrerasData?.carreras]);

  return { initialStep, initialValues };
};
