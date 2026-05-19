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
}) => {
  const initialStep = useMemo(() => {
    if (editData) {
      if (editData.completarSoloHistorialPrevio) return 2;
      return isNuevoEstudiante ? 3 : 2;
    }
    const hasStudent = studentSearch?.selectedStudent && !studentSearch?.loading;
    if (hasStudent && carrerasData?.selectedCarrera) {
      return isNuevoEstudiante ? 3 : 2;
    }
    if (hasStudent) return 1;
    return 0;
  }, [
    editData,
    editData?.completarSoloHistorialPrevio,
    isNuevoEstudiante,
    studentSearch?.selectedStudent,
    studentSearch?.loading,
    carrerasData?.selectedCarrera,
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
