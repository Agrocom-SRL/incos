/**
 * Hook: useUpdateStudent
 * 
 * Single Responsibility: Manejar la actualización de estudiantes vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la actualización de estudiantes usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * 
 * Flujo correcto:
 * Application (hook) → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Proporciona función para actualizar estudiantes usando ActualizarEstudianteUseCase
 * - Maneja estados de loading y error
 * - Retorna resultado con success/error
 * 
 * TODO: Este hook está preparado para cuando se implemente el endpoint PUT en el backend
 * Por ahora, el método actualizar retorna un error indicando que no está disponible
 * 
 * @returns {Object} { updateStudent, loading, error, validationErrors }
 */
import { useState, useCallback } from 'react';
import { useCasesFactory } from '@container';
// TODO: Importar validator cuando se cree
// import { validateUpdateStudent } from '@application-estudiantes/validators';

export const useUpdateStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);

  /**
   * Normaliza campos de fecha a formato ISO (YYYY-MM-DD)
   * - Acepta objetos Dayjs/Moment (tienen método format)
   * - Acepta Date nativo
   * - Acepta string 'DD-MM-YYYY' y lo convierte a 'YYYY-MM-DD'
   * - Deja pasar strings ya en 'YYYY-MM-DD'
   */
  const normalizeUpdateStudentPayload = (values) => {
    if (!values || typeof values !== 'object') return values;
    const payload = { ...values };
    const value = payload.fechaNacimiento;
    if (value) {
      try {
        // Dayjs/Moment
        if (typeof value === 'object' && typeof value.format === 'function') {
          payload.fechaNacimiento = value.format('YYYY-MM-DD');
        // Date nativo
        } else if (value instanceof Date && !isNaN(value.getTime())) {
          payload.fechaNacimiento = value.toISOString().slice(0, 10);
        // String DD-MM-YYYY
        } else if (typeof value === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(value)) {
          const [dd, mm, yyyy] = value.split('-');
          payload.fechaNacimiento = `${yyyy}-${mm}-${dd}`;
        // String YYYY-MM-DD (dejar igual)
        } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          // no-op
        }
      } catch (_) {
        // Si algo falla, dejar el valor tal cual; el backend validará
      }
    }
    return payload;
  };

  /**
   * Actualiza un estudiante existente
   * 
   * @param {string|number} studentId - ID del estudiante a actualizar
   * @param {Object} formValues - Valores del formulario (estructura plana del frontend)
   * @param {number} step - Paso actual del wizard (opcional, para logging)
   * @param {boolean} isFinal - Si es actualización final (true) o guardado parcial (false)
   * @param {boolean} isPartial - Si es guardado parcial (true) o actualización final (false)
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Array}>}
   */
  const updateStudent = useCallback(async (studentId, formValues, step = null, isFinal = true, isPartial = false) => {
    setLoading(true);
    setError(null);
    setValidationErrors(null);

    try {
      // 0. NORMALIZACIÓN previa (Application Layer)
      // Convertir fechaNacimiento a formato ISO aceptado por backend
      const normalizedValues = normalizeUpdateStudentPayload(formValues);

      // TODO: 1. VALIDACIÓN PREVIA (Application Layer)
      // Validar datos antes de llamar al Use Case para evitar llamadas innecesarias
      // const validation = validateUpdateStudent(normalizedValues);
      // if (!validation.isValid) {
      //   setValidationErrors(validation.errors);
      //   const errorMessage = validation.errors
      //     .map(err => err.message)
      //     .join('. ');
      //   setError(errorMessage);
      //   return {
      //     success: false,
      //     error: errorMessage,
      //     validationErrors: validation.errors,
      //   };
      // }

      // TODO: 2. Obtener el Use Case desde el container (inyección de dependencias)
      // const actualizarEstudianteUseCase = useCasesFactory.actualizarEstudiante();

      // TODO: 3. Ejecutar el Use Case (asume que recibe datos válidos)
      // const result = await actualizarEstudianteUseCase.ejecutar(studentId, normalizedValues);

      // Por ahora, retornar error indicando que no está implementado
      return {
        success: false,
        error: 'El endpoint de actualización aún no está implementado en el backend',
      };

      // TODO: Descomentar cuando se implemente el backend
      // if (!result.success) {
      //   const errorMessage = typeof result.error === 'object' && result.error?.message
      //     ? result.error.message
      //     : result.error || 'Error al actualizar estudiante';
      //   setError(errorMessage);
      //   
      //   if (result.validationErrors) {
      //     setValidationErrors(result.validationErrors);
      //   }
      //   
      //   return result;
      // }

      // return result;
    } catch (err) {
      // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
      const errorMessage = err?.message || 'Error inesperado al actualizar estudiante';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateStudent,
    loading,
    error,
    validationErrors,
  };
};

