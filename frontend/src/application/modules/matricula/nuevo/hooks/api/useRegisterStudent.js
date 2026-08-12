/**
 * Hook: useRegisterStudent
 * 
 * Single Responsibility: Manejar el registro de estudiantes vía API
 * 
 * Clean Architecture:
 * - Application Layer: Orquesta la creación de estudiantes usando Use Cases
 * - Usa Use Cases del Domain Layer (nunca llama directamente a Repository o API)
 * - Valida datos ANTES de llamar al Use Case (separación de responsabilidades)
 * 
 * Flujo correcto:
 * Application (hook) → Validator → Domain (Use Case) → Infrastructure (Repository) → API
 * 
 * Este hook:
 * - Valida datos usando RegisterStudentValidator (Application Layer)
 * - Proporciona función para registrar estudiantes usando CrearEstudianteUseCase
 * - Maneja estados de loading y error
 * - Retorna resultado con success/error
 * 
 * @returns {Object} { registerStudent, loading, error, validationErrors }
 */
import { useState, useCallback } from 'react';
import { useCasesFactory } from '@container';
import { validateRegisterStudent } from '@application-matricula/nuevo/validators/RegisterStudentValidator';

export const useRegisterStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState(null);

  /**
   * Normaliza campos de fecha a formato ISO (YYYY-MM-DD)
   * - Acepta objetos Dayjs/Moment (tienen método format)
   * - Acepta Date nativo
   * - Acepta string 'DD-MM-YYYY' y lo convierte a 'YYYY-MM-DD'
   * - Deja pasar strings ya en 'YYYY-MM-DD'
   * - Excluye campos calculados que no se envían al backend (ej: edad)
   */
  const normalizeRegisterStudentPayload = (values) => {
    if (!values || typeof values !== 'object') return values;
    const payload = { ...values };
    
    // Excluir campos calculados que no se envían al backend
    delete payload.edad;
    
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
   * Registra un nuevo estudiante
   * 
   * @param {Object} formValues - Valores del formulario (estructura plana del frontend)
   * @param {number} step - Paso actual del wizard (opcional, para logging)
   * @param {boolean} isFinal - Si es registro final (true) o guardado parcial (false)
   * @param {boolean} isPartial - Si es guardado parcial (true) o registro final (false)
   * @returns {Promise<{success: boolean, data?: Object, error?: string, validationErrors?: Array}>}
   */
  const registerStudent = useCallback(async (formValues, step = null, isFinal = true, isPartial = false) => {
    setLoading(true);
    setError(null);
    setValidationErrors(null);

    try {
      // 0. NORMALIZACIÓN previa (Application Layer)
      // Convertir fechaNacimiento a formato ISO aceptado por backend
      const normalizedValues = normalizeRegisterStudentPayload(formValues);

      // 0.1 Guardado parcial: no incluir documentación si el usuario aún no llegó al paso de documentación
      // NUEVO/ANTIGUO: 4 pasos (documentación = 4). TRASPASO/TRANSITABILIDAD: 5 pasos (documentación = 5).
      if (isPartial && step != null) {
        const tipoAdmision = normalizedValues.tipoAdmision || 'NUEVO';
        const documentacionStep = (tipoAdmision === 'TRASPASO' || tipoAdmision === 'TRANSITABILIDAD') ? 5 : 4;
        if (step < documentacionStep) {
          normalizedValues.documentacion = {};
        }
      }

      // 1. VALIDACIÓN PREVIA (Application Layer)
      // Validar datos antes de llamar al Use Case para evitar llamadas innecesarias
      const validation = validateRegisterStudent(normalizedValues);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        const errorMessage = validation.errors
          .map(err => err.message)
          .join('. ');
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
          validationErrors: validation.errors,
        };
      }

      // 2. Obtener el Use Case desde el container (inyección de dependencias)
      const crearEstudianteUseCase = useCasesFactory.crearEstudiante();

      // 3. Ejecutar el Use Case (asume que recibe datos válidos)
      // El Use Case orquesta el Repository, que envía los datos al backend
      // El backend tiene el validator y el DTO que transforma la estructura
      const result = await crearEstudianteUseCase.ejecutar(normalizedValues);

      if (!result.success) {
        // Extraer el mensaje del error si es un objeto
        const errorMessage = typeof result.error === 'object' && result.error?.message
          ? result.error.message
          : result.error || 'Error al registrar estudiante';
        setError(errorMessage);
        
        // Si el backend retorna errores de validación, guardarlos
        if (result.validationErrors) {
          setValidationErrors(result.validationErrors);
        }
        
        return result;
      }

      return result;
    } catch (err) {
      // Error inesperado (no debería llegar aquí si el Use Case maneja bien los errores)
      const errorMessage = err?.message || 'Error inesperado al registrar estudiante';
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
    registerStudent,
    loading,
    error,
    validationErrors,
  };
};

