/**
 * Hook: useAsignarBecaFormHandlers
 * 
 * Single Responsibility: Crear, registrar y manejar el formulario de asignación de beca
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
 * - Expone estados de asignación (loading, error, validationErrors)
 * 
 * Ventajas:
 * - Encapsula toda la lógica del formulario en un solo lugar
 * - El Provider solo orquesta y expone vía Context
 * - La página solo consume, sin lógica de Application Layer
 * 
 * Usado por: AsignarBecaProvider (para exponer form y handlers vía Context)
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '@application/utils';
import { useCreateAsignarBeca } from '@application-estudiantes/hooks';

/**
 * Hook para gestionar handlers de submit del formulario de asignación de beca
 * 
 * Single Responsibility: Crear, registrar y manejar el formulario de asignación de beca
 * - Crea la instancia del formulario usando Form.useForm()
 * - Registra automáticamente el formulario internamente
 * - Procesa handlers de submit (handleFinish, handleSave)
 * 
 * @param {string|number} studentId - ID del estudiante al que se le asignará la beca
 * @param {Object} options - Opciones adicionales
 * @param {Object} options.selectedBecaDescuento - Beca/descuento seleccionada (con id)
 * @returns {Object} Objeto con form, handleFinish, handleSave, getFormValues, loading, error, validationErrors, asignarBecaResult
 */
export const useAsignarBecaFormHandlers = (studentId, options = {}) => {
    const { selectedBecaDescuento } = options;
    
    // Hook genérico compartido para mostrar mensajes
    const showMessage = useMessage();
    
    // Hook de navegación
    const navigate = useNavigate();
    
    // Hook de API para crear asignación de beca
    const { createAsignarBeca, loading: loadingCreate, error: errorCreate, validationErrors: validationErrorsCreate } = useCreateAsignarBeca();
    
    // Usar estados del hook de API
    const loading = loadingCreate;
    const error = errorCreate;
    const validationErrors = validationErrorsCreate;
    
    // Crear la instancia del formulario (el hook maneja todo el ciclo de vida)
    const [form] = Form.useForm();
    
    // Ref para almacenar la instancia del formulario (para compatibilidad con getFormValues)
    const formRef = useRef(null);
    
    // Estado para almacenar el resultado de la asignación (para que la página pueda reaccionar)
    const [asignarBecaResult, setAsignarBecaResult] = useState(null);

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
            setAsignarBecaResult(result);
        } else if (result?.error) {
            if (showMessage) {
                const msg = typeof result.error === 'object'
                    ? (result.error.message || defaultErrorMessage)
                    : (result.error || defaultErrorMessage);
                showMessage('error', msg);
            }
            setAsignarBecaResult(null);
        }
    }, [showMessage]);

    // Handler para finalizar la asignación de beca
    // selectedBecaDescuento puede venir como parámetro opcional o de las opciones
    const handleFinish = useCallback(async (values, selectedBecaDescuentoParam = null) => {
        // Usar selectedBecaDescuento del parámetro o de las opciones
        const becaDescuentoToUse = selectedBecaDescuentoParam || selectedBecaDescuento;
        
        // Validar que se haya seleccionado estudiante y beca
        if (!studentId) {
            const errorMessage = 'Debe seleccionar un estudiante';
            if (showMessage) {
                showMessage('error', errorMessage);
            }
            return {
                success: false,
                error: errorMessage,
            };
        }

        if (!becaDescuentoToUse?.id) {
            const errorMessage = 'Debe seleccionar una beca o descuento';
            if (showMessage) {
                showMessage('error', errorMessage);
            }
            return {
                success: false,
                error: errorMessage,
            };
        }

        // Los valores del formulario vienen en el parámetro values (incluye observaciones)
        // Ant Design pasa los valores validados automáticamente cuando se llama form.submit()
        const formValues = values || {};
        
        // Preparar datos para la API (snake_case como espera el backend)
        // La gestión, fecha_solicitud y estado se establecen automáticamente en el backend
        const asignarBecaData = {
            student_id: studentId,
            beca_descuento_id: becaDescuentoToUse.id,
            observaciones: formValues.observaciones || null,
            // management_id se establece automáticamente en el backend según la gestión activa
            // fecha_solicitud se establece automáticamente como la fecha actual
            // estado se establece automáticamente como PENDIENTE
        };

        // Llamar al hook de API para crear la asignación de beca
        const result = await createAsignarBeca(asignarBecaData);

        // Manejar el resultado
        if (result?.success) {
            // Mostrar mensaje de éxito
            if (showMessage) {
                showMessage('success', 'Beca asignada correctamente');
            }
            
            // Guardar resultado para que la página pueda reaccionar
            setAsignarBecaResult(result);
            
            const data = result.data || {};
            const esBeca100 = data.esBeca100 === true;
            const pagoAporteId = data.pagoAporteId ?? null;

            if (esBeca100 && pagoAporteId) {
                // Beca 100%: el aporte ya está cubierto, ir al detalle del pago
                navigate(`/pagos/${pagoAporteId}`, { replace: true });
            } else {
                // Beca < 100%: ir a registrar pago con el estudiante
                navigate('/pagos/registrar', { state: { studentId }, replace: true });
            }
        } else {
            // Manejar error
            handleSubmitResult(
                result,
                'Beca asignada correctamente',
                'Error al asignar la beca'
            );
        }

        return result;
    }, [studentId, selectedBecaDescuento, getFormValues, createAsignarBeca, showMessage, handleSubmitResult, navigate]);

    // Memoizar el objeto retornado para mantener referencia estable
    // Esto permite que el useMemo del Provider sea más efectivo
    return useMemo(() => {
        return {
            // Instancia del formulario (creada y registrada automáticamente)
            form,
            
            // Handlers de submit
            handleFinish,
            
            // Funciones auxiliares
            getFormValues,
            
            // Estados
            loading,
            error,
            validationErrors,
            asignarBecaResult,
        };
    }, [form, handleFinish, getFormValues, loading, error, validationErrors, asignarBecaResult]);
};
