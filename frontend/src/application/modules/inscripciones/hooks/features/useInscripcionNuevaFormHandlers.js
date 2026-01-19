/**
 * Hook: useInscripcionNuevaFormHandlers
 * 
 * Single Responsibility: Crear, registrar y manejar el formulario de inscripción
 * 
 * Clean Architecture:
 * - Application Layer: Hook de lógica específica para handlers de formulario
 * - Maneja la lógica completa del formulario: creación, registro, obtención de valores y handlers de submit
 * 
 * SOLID Principles:
 * - Single Responsibility: Única responsabilidad de manejar el ciclo de vida completo del formulario
 * - Dependency Inversion: Depende de hooks de API (abstracciones) y showMessage
 * - Interface Segregation: Expone solo los handlers y funciones necesarios
 * 
 * Este hook:
 * - Crea la instancia del formulario usando Form.useForm()
 * - Registra automáticamente el formulario internamente
 * - Procesa handlers de submit (handleFinish, handleSave)
 * - Maneja mensajes y notificaciones
 * - Gestiona callbacks de éxito
 * - Expone estados de inscripción (loading, error, validationErrors)
 * 
 * Ventajas:
 * - Encapsula toda la lógica del formulario en un solo lugar
 * - El Provider solo orquesta y expone vía Context
 * - La página solo consume, sin lógica de Application Layer
 * 
 * Usado por: InscripcionesNuevaProvider (para exponer form y handlers vía Context)
 * 
 * Nota: Esta es una versión base que se irá completando por pasos
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '@application/utils';
import { useCreateInscripcion } from '@application-inscripciones/hooks';

/**
 * Hook para gestionar handlers de submit del formulario de inscripción
 * 
 * Single Responsibility: Crear, registrar y manejar el formulario de inscripción
 * - Crea la instancia del formulario usando Form.useForm()
 * - Registra automáticamente el formulario internamente
 * - Procesa handlers de submit (handleFinish, handleSave)
 * 
 * @param {string} mode - Modo del formulario: 'nuevo' (default) o 'editar'
 * @param {Object} options - Opciones adicionales
 * @param {Object} options.selectedStudent - Estudiante seleccionado (con id)
 * @param {Object} options.selectedParalelo - Paralelo seleccionado (con id)
 * @returns {Object} Objeto con form, handleFinish, handleSave, getFormValues, loading, error, validationErrors, inscripcionResult
 */
export const useInscripcionNuevaFormHandlers = (mode = 'nuevo', options = {}) => {
    const { selectedStudent, selectedParalelo } = options;
    
    // Hook genérico compartido para mostrar mensajes
    const showMessage = useMessage();
    
    // Hook de navegación
    const navigate = useNavigate();
    
    // Hook de API para crear inscripción
    const { createInscripcion, loading: loadingCreate, error: errorCreate, validationErrors: validationErrorsCreate } = useCreateInscripcion();
    
    // Usar estados del hook de API
    const loading = loadingCreate;
    const error = errorCreate;
    const validationErrors = validationErrorsCreate;
    
    // Crear la instancia del formulario (el hook maneja todo el ciclo de vida)
    const [form] = Form.useForm();
    
    // Ref para almacenar la instancia del formulario (para compatibilidad con getFormValues)
    const formRef = useRef(null);
    
    // Estado para almacenar el resultado de la inscripción (para que la página pueda reaccionar)
    const [inscripcionResult, setInscripcionResult] = useState(null);

    // Registrar automáticamente el formulario cuando esté disponible
    useEffect(() => {
        if (form) {
            formRef.current = form;
        }
    }, [form]);

    // Función para obtener los valores del formulario
    const getFormValues = useCallback(() => {
        if (!form) {
            console.warn('⚠️ El formulario no está disponible aún');
            return {};
        }
        try {
            // Obtener todos los valores del formulario (incluye campos no renderizados)
            const formValues = form.getFieldsValue(true);
            return formValues;
        } catch (error) {
            console.error('❌ Error al obtener valores del formulario:', error);
            return {};
        }
    }, [form]);

    // Función auxiliar para manejar el resultado de la operación (éxito o error)
    // Factoriza la lógica común de mostrar mensajes y actualizar el estado
    const handleSubmitResult = useCallback((result, successMessage, defaultErrorMessage) => {
        if (result?.success) {
            if (showMessage) {
                showMessage('success', successMessage);
            }
            setInscripcionResult(result);
        } else if (result?.error) {
            if (showMessage) {
                const msg = typeof result.error === 'object'
                    ? (result.error.message || defaultErrorMessage)
                    : (result.error || defaultErrorMessage);
                showMessage('error', msg);
            }
            setInscripcionResult(null);
        }
    }, [showMessage]);

    // Handler para finalizar la inscripción
    const handleFinish = useCallback(async (step) => {
        // Validar que se haya seleccionado estudiante y paralelo
        if (!selectedStudent?.id) {
            const errorMessage = 'Debe seleccionar un estudiante';
            if (showMessage) {
                showMessage('error', errorMessage);
            }
            return {
                success: false,
                error: errorMessage,
            };
        }

        if (!selectedParalelo?.id) {
            const errorMessage = 'Debe seleccionar un paralelo';
            if (showMessage) {
                showMessage('error', errorMessage);
            }
            return {
                success: false,
                error: errorMessage,
            };
        }

        // Obtener valores adicionales del formulario (enrollment_type, observations)
        const formValues = getFormValues ? getFormValues() : {};
        
        // Preparar datos para la API (snake_case como espera el backend)
        const inscripcionData = {
            student_id: selectedStudent.id,
            parallel_id: selectedParalelo.id,
            enrollment_type: formValues.enrollment_type || 'NUEVO',
            observations: formValues.observations || null,
        };

        // Llamar al hook de API para crear la inscripción
        const result = await createInscripcion(inscripcionData);

        // Manejar el resultado
        if (result?.success) {
            // Mostrar mensaje de éxito
            if (showMessage) {
                showMessage('success', 'Inscripción completada correctamente');
            }
            
            // Guardar resultado para que la página pueda reaccionar
            setInscripcionResult(result);
            
            // Obtener el ID de la inscripción creada
            const inscripcionId = result.data?.enrollment?.id || result.data?.id;
            
            if (inscripcionId) {
                // Navegar a la página de detalle de la inscripción
                // El InscripcionDetailProvider cargará automáticamente los datos cuando se monte
                navigate(`/inscripciones/${inscripcionId}`, { replace: true });
            } else {
                // Si no hay ID, solo mostrar mensaje (no navegar)
                console.warn('⚠️ Inscripción creada pero no se obtuvo ID para navegar');
            }
        } else {
            // Manejar error
            handleSubmitResult(
                result,
                'Inscripción completada correctamente',
                'Error al completar la inscripción'
            );
        }

        return result;
    }, [selectedStudent, selectedParalelo, getFormValues, createInscripcion, showMessage, handleSubmitResult, navigate]);

    // Handler para guardar parcialmente
    // NOTA: Por ahora, el guardado parcial también crea la inscripción completa
    // En el futuro se puede implementar un guardado como borrador
    const handleSave = useCallback(async (step) => {
        // Validar que se haya seleccionado estudiante y paralelo
        if (!selectedStudent?.id) {
            const errorMessage = 'Debe seleccionar un estudiante';
            if (showMessage) {
                showMessage('error', errorMessage);
            }
            return {
                success: false,
                error: errorMessage,
            };
        }

        if (!selectedParalelo?.id) {
            const errorMessage = 'Debe seleccionar un paralelo';
            if (showMessage) {
                showMessage('error', errorMessage);
            }
            return {
                success: false,
                error: errorMessage,
            };
        }

        // Obtener valores adicionales del formulario
        const formValues = getFormValues ? getFormValues() : {};
        
        // Preparar datos para la API (snake_case como espera el backend)
        const inscripcionData = {
            student_id: selectedStudent.id,
            parallel_id: selectedParalelo.id,
            enrollment_type: formValues.enrollment_type || 'NUEVO',
            observations: formValues.observations || null,
        };

        // Llamar al hook de API para crear la inscripción
        const result = await createInscripcion(inscripcionData);

        // Manejar el resultado
        if (result?.success) {
            // Mostrar mensaje de éxito
            if (showMessage) {
                showMessage('success', 'Datos guardados correctamente. Puede continuar después.');
            }
            
            // Guardar resultado
            setInscripcionResult(result);
        } else {
            // Manejar error
            handleSubmitResult(
                result,
                'Datos guardados correctamente. Puede continuar después.',
                'Error al guardar los datos'
            );
        }

        return result;
    }, [selectedStudent, selectedParalelo, getFormValues, createInscripcion, showMessage, handleSubmitResult]);

    // Memoizar el objeto retornado para mantener referencia estable
    // Esto permite que el useMemo del Provider sea más efectivo
    return useMemo(() => {
        return {
            // Instancia del formulario (creada y registrada automáticamente)
            form,
            
            // Handlers de submit
            handleFinish,
            handleSave,
            
            // Funciones auxiliares
            getFormValues,
            
            // Estados
            loading,
            error,
            validationErrors,
            inscripcionResult,
        };
    }, [form, handleFinish, handleSave, getFormValues, loading, error, validationErrors, inscripcionResult]);
};
