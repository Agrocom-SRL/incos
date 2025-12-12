/**
 * Hook personalizado: useCreateStudent
 * 
 * Single Responsibility: Solo maneja la creación de estudiantes
 * Dependency Inversion: Usa use cases, no repositorios directamente
 */

import { useState } from 'react';
import { CreateStudentUseCase } from '@useCases/estudiantes/CreateStudentUseCase';
import { StudentRepository } from '@infrastructure/repositories/StudentRepository';

// Instancias (podrían venir de un contenedor de DI en el futuro)
const studentRepository = new StudentRepository();
const createStudentUseCase = new CreateStudentUseCase(studentRepository);

export const useCreateStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createStudent = async (studentData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createStudentUseCase.execute(studentData);

      if (!result.success) {
        setError(result.error);
        return result;
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Error inesperado al crear el estudiante';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    createStudent,
    loading,
    error,
  };
};

