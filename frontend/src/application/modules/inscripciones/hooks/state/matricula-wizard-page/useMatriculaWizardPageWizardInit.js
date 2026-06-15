/**
 * Paso inicial del wizard y valores del formulario en edición.
 */

import { useEffect, useMemo } from 'react';

export const useMatriculaWizardPageWizardInit = ({
  editData,
  isNuevoEstudiante,
  studentSearch,
  carrerasData,
  form,
  wizardStepMeta,
}) => {
  const indices = wizardStepMeta?.indices ?? {
    buscar: 0,
    carrera: 1,
    periodo: 2,
    paralelo: 3,
    historial: null,
  };

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
    const hasStudent = studentSearch?.selectedStudent && !studentSearch?.loading;
    if (hasStudent && carrerasData?.selectedCarrera) {
      return isNuevoEstudiante ? indices.paralelo : indices.periodo;
    }
    if (hasStudent) return indices.carrera;
    return indices.buscar;
  }, [
    editData,
    editData?.completarSoloHistorialPrevio,
    isNuevoEstudiante,
    studentSearch?.selectedStudent,
    studentSearch?.loading,
    carrerasData?.selectedCarrera,
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
