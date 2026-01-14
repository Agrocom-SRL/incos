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
import { useMessage } from '@application/utils';
// TODO: Importar hooks de API cuando se implementen
// import { useCreateInscripcion } from '@application-inscripciones/hooks/api';

/**
 * Hook para gestionar handlers de submit del formulario de inscripción
 * 
 * Single Responsibility: Crear, registrar y manejar el formulario de inscripción
 * - Crea la instancia del formulario usando Form.useForm()
 * - Registra automáticamente el formulario internamente
 * - Procesa handlers de submit (handleFinish, handleSave)
 * 
 * @param {string} mode - Modo del formulario: 'nuevo' (default) o 'editar'
 * @returns {Object} Objeto con form, handleFinish, handleSave, getFormValues, loading, error, validationErrors, inscripcionResult
 */
export const useInscripcionNuevaFormHandlers = (mode = 'nuevo') => {
    // Hook genérico compartido para mostrar mensajes
    const showMessage = useMessage();
    // TODO: Hook de API para crear inscripción (se implementará en pasos siguientes)
    // const { createInscripcion, loading: loadingCreate, error: errorCreate, validationErrors: validationErrorsCreate } = useCreateInscripcion();
    
    // Usar el hook apropiado según el modo (cuando se implemente)
    // Por ahora, estados básicos temporales
    const loading = false;
    const error = null;
    const validationErrors = null;
    
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
        const formValues = getFormValues ? getFormValues() : {};
        
        // TODO: Implementar llamada a API cuando se cree el hook
        // const result = await createInscripcion(formValues, step, true, false);
        
        // Por ahora solo log (se implementará en pasos siguientes)
        console.log('Inscripción completada:', formValues, step);
        
        // Simulación temporal (se implementará en pasos siguientes)
        const result = { success: false, error: { message: 'Funcionalidad en desarrollo' } };
        
        // Usar función auxiliar para manejar el resultado
        handleSubmitResult(
            result,
            'Inscripción completada correctamente',
            'Error al completar la inscripción'
        );
    }, [getFormValues, handleSubmitResult]);

    // Handler para guardar parcialmente
    const handleSave = useCallback(async (step) => {
        const formValues = getFormValues ? getFormValues() : {};
        
        // TODO: Implementar llamada a API cuando se cree el hook
        // const result = await createInscripcion(formValues, step, false, true);
        
        // Por ahora solo log (se implementará en pasos siguientes)
        console.log('Guardado parcial:', formValues, step);
        
        // Simulación temporal (se implementará en pasos siguientes)
        const result = { success: false, error: { message: 'Funcionalidad en desarrollo' } };
        
        // Usar función auxiliar para manejar el resultado
        handleSubmitResult(
            result,
            'Datos guardados correctamente. Puede continuar después.',
            'Error al guardar los datos'
        );
    }, [getFormValues, handleSubmitResult]);

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
